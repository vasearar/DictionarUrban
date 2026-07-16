import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import userModel from "@/models/userModel";
import wordModel from "@/models/wordModel";
import reportModel from "@/models/reportModel";
import {
  ACHIEVEMENT_MAP,
  ENDGAME_ID,
  ENDGAME_SET,
  ROLE_ACHIEVEMENTS,
} from "@/lib/achievementCatalog";

/**
 * Motorul de medalii. SERVER-ONLY (atinge DB-ul) — nu-l importa din componente
 * client; pentru titluri/reguli există lib/achievementCatalog.ts.
 *
 * Regula de aur: fiecare trigger evaluează DOAR medaliile pe care le poate
 * afecta. Nu există niciodată un re-scan al tuturor celor 34 pe hot-path.
 *
 * Identitatea vine mereu de la apelant din sesiune (sau din `userEmail`-ul unui
 * document deja citit de pe server) — niciodată din body-ul unei cereri.
 */

export type AchievementTrigger =
  | "definition"
  | "like"
  | "report-resolved"
  | "dice"
  | "client-event"
  | "session-poll";

export interface AchievementContext {
  /** doar pentru "client-event": id-ul medaliei cerute (terms/privacy/lost-404/share) */
  eventId?: string;
  /** doar pentru "like": pe unlike suma nu poate urca, deci sărim pragurile */
  action?: "like" | "unlike";
}

// Praguri, în ordine crescătoare. Le parcurgem pe toate, nu doar pe cea exactă:
// așa un user care avea deja 30 de definiții înainte de lansarea medaliilor le
// primește retroactiv pe toate la prima acțiune (catch-up), nu doar pe def-25.
const DEFINITION_TIERS: [number, string][] = [
  [1, "def-1"],
  [5, "def-5"],
  [10, "def-10"],
  [25, "def-25"],
  [50, "def-50"],
  [100, "def-100"],
];

const LIKE_TIERS: [number, string][] = [
  [10, "like-10"],
  [50, "like-50"],
  [100, "like-100"],
  [250, "like-250"],
  [500, "like-500"],
];

const REPORT_TIERS: [number, string][] = [
  [1, "report-1"],
  [5, "report-5"],
  [10, "report-10"],
  [25, "report-25"],
];

const SENIORITY_TIERS: [number, string][] = [
  [1, "vechime-1"],
  [2, "vechime-2"],
  [3, "vechime-3"],
];

/** Câte medalii ale zarului într-o „sesiune" (fereastră de 1h, server-side). */
export const DICE_THRESHOLD = 50;
export const DICE_WINDOW_MS = 3_600_000;

/**
 * Trigger-ele care se întâmplă ÎN cererea utilizatorului: el așteaptă răspunsul,
 * deci primește id-urile înapoi și afișează toast-ul direct → le marcăm ca
 * notificate din start. Restul (un like primit de la altcineva, un raport
 * rezolvat de un moderator) se descoperă la următorul poll.
 */
const SYNCHRONOUS_TRIGGERS: AchievementTrigger[] = ["definition", "client-event"];

/**
 * Grant idempotent și atomic. Garda `"achievements.id": {$ne: id}` e ÎN filtru,
 * deci două cereri paralele nu pot împinge medalia de două ori: doar una vede
 * `modifiedCount === 1` și doar aceea o raportează ca „nou deblocată".
 */
async function grant(email: string, id: string, notified: boolean): Promise<boolean> {
  const result = await userModel.updateOne(
    { email, "achievements.id": { $ne: id } },
    { $push: { achievements: { id, unlockedAt: new Date(), notified } } }
  );
  return result.modifiedCount === 1;
}

async function grantTiers(
  email: string,
  value: number,
  tiers: [number, string][],
  notified: boolean
): Promise<string[]> {
  const unlocked: string[] = [];
  for (const [threshold, id] of tiers) {
    if (value >= threshold && (await grant(email, id, notified))) {
      unlocked.push(id);
    }
  }
  return unlocked;
}

/** Ani întregi împliniți, pe calendar (nu ms/365 — ar greși în ani bisecți). */
function yearsSince(date: Date): number {
  const now = new Date();
  let years = now.getUTCFullYear() - date.getUTCFullYear();
  const anniversary = new Date(date);
  anniversary.setUTCFullYear(date.getUTCFullYear() + years);
  if (anniversary.getTime() > now.getTime()) years--;
  return years;
}

/** Suma like-urilor de pe definițiile VIZIBILE ale unui autor. */
async function totalLikesFor(email: string): Promise<number> {
  const [row] = await wordModel.aggregate<{ total: number }>([
    { $match: { userEmail: email, hidden: { $ne: true } } },
    { $group: { _id: null, total: { $sum: "$likes" } } },
  ]);
  return row?.total ?? 0;
}

/**
 * „Vedeta cartierului" e unică pe platformă: o ține autorul definiției cu cele
 * mai multe like-uri. Sortarea are tie-break pe `_id` crescător, deci la
 * egalitate câștigă definiția mai veche — deținătorul nu e furat de cineva care
 * ajunge la același scor.
 *
 * Singura medalie care se și REVOCĂ. Întoarce emailul noului deținător doar dacă
 * s-a mutat chiar acum.
 */
async function syncInfluencer(): Promise<string | null> {
  const top = await wordModel
    .findOne({ hidden: { $ne: true } })
    .sort({ likes: -1, _id: 1 })
    .select("userEmail")
    .lean<{ userEmail?: string } | null>();

  const leader = top?.userEmail;
  if (!leader) return null;

  const alreadyHolds = await userModel.exists({
    email: leader,
    "achievements.id": "influencer",
  });
  if (alreadyHolds) return null;

  // Se mută: o luăm de la oricine altcineva o avea...
  await userModel.updateMany(
    { "achievements.id": "influencer", email: { $ne: leader } },
    { $pull: { achievements: { id: "influencer" } } }
  );
  // ...inclusiv de pe profil, altfel ar rămâne afișată o medalie nedeținută.
  await userModel.updateMany(
    { displayedAchievement: "influencer", email: { $ne: leader } },
    { $set: { displayedAchievement: null } }
  );

  const granted = await grant(leader, "influencer", false);
  return granted ? leader : null;
}

/**
 * „Atinge iarba": se acordă când userul are TOATE medaliile din ENDGAME_SET.
 *
 * Odată acordată nu se mai retrage niciodată — nici dacă pierde influencer-ul
 * (nu e în set oricum), nici dacă setul se mărește mai târziu, când un stub
 * devine obtenabil. Cine a atins 100% la momentul lui rămâne cu ea
 * (grandfathering); noii veniți au de bifat lista nouă.
 */
async function checkEndgame(email: string, notified: boolean): Promise<string[]> {
  const user = await userModel
    .findOne({ email })
    .select("achievements.id")
    .lean<{ achievements?: { id: string }[] } | null>();
  if (!user) return [];

  const owned = new Set((user.achievements || []).map((a) => a.id));
  if (owned.has(ENDGAME_ID)) return [];

  for (const id of ENDGAME_SET) {
    if (!owned.has(id)) return [];
  }

  return (await grant(email, ENDGAME_ID, notified)) ? [ENDGAME_ID] : [];
}

/**
 * Evaluează medaliile afectate de `trigger` pentru `email` și întoarce id-urile
 * NOU deblocate (lista e goală în cazul normal, când nimic nu s-a schimbat).
 *
 * Nu aruncă NICIODATĂ: o eroare la evaluare n-are voie să strice acțiunea care a
 * declanșat-o (un like, o definiție publicată). Apelanții pot face `await` fără
 * try/catch în jur; ce s-a apucat să acorde până la eroare tot se raportează.
 */
export async function checkAchievements(
  email: string | null | undefined,
  trigger: AchievementTrigger,
  ctx: AchievementContext = {}
): Promise<string[]> {
  if (!email) return [];

  const notified = SYNCHRONOUS_TRIGGERS.includes(trigger);
  const unlocked: string[] = [];

  try {
    await connectDB();

    switch (trigger) {
      case "definition": {
        const count = await wordModel.countDocuments({
          userEmail: email,
          hidden: { $ne: true },
        });
        unlocked.push(...(await grantTiers(email, count, DEFINITION_TIERS, notified)));
        break;
      }

      case "like": {
        // Pe unlike suma doar scade, deci pragurile n-au ce descoperi — dar
        // recordul platformei se poate muta, deci influencer-ul se verifică.
        if (ctx.action !== "unlike") {
          const total = await totalLikesFor(email);
          unlocked.push(...(await grantTiers(email, total, LIKE_TIERS, notified)));
        }
        const newLeader = await syncInfluencer();
        if (newLeader === email) unlocked.push("influencer");
        break;
      }

      case "report-resolved": {
        const count = await reportModel.countDocuments({
          userEmail: email,
          status: "resolved",
        });
        unlocked.push(...(await grantTiers(email, count, REPORT_TIERS, notified)));
        break;
      }

      case "dice": {
        // Contorul e ținut de rută (bumpCounter); aici doar acordăm.
        if (await grant(email, "secret-real", notified)) unlocked.push("secret-real");
        break;
      }

      case "client-event": {
        // Allowlist: doar medalii care există și care chiar sunt evenimente de
        // client. Ruta validează deja tipul; asta e a doua plasă.
        const id = ctx.eventId;
        if (!id || !ACHIEVEMENT_MAP[id]) break;
        if (!["terms", "privacy", "lost-404", "share"].includes(id)) break;
        if (await grant(email, id, notified)) unlocked.push(id);
        break;
      }

      case "session-poll": {
        const user = await userModel
          .findOne({ email })
          .select("createdAt")
          .lean<{ _id: mongoose.Types.ObjectId; createdAt?: Date } | null>();
        if (!user) break;

        let createdAt = user.createdAt;
        if (!createdAt) {
          // Cont vechi neprins de backfill → îl reparăm acum, o dată.
          // Vezi scripts/backfill-user-createdat.ts.
          createdAt = user._id.getTimestamp();
          await userModel.updateOne({ email }, { $set: { createdAt } });
        }

        const years = yearsSince(createdAt);
        unlocked.push(...(await grantTiers(email, years, SENIORITY_TIERS, notified)));
        break;
      }
    }

    // Orice deblocare poate completa colecția. Endgame nu declanșează la rândul
    // ei nimic, deci verificarea nu se poate recursiviza.
    if (unlocked.length > 0) {
      unlocked.push(...(await checkEndgame(email, notified)));
    }
  } catch (error) {
    console.error(`checkAchievements(${trigger}) failed:`, error);
  }

  return unlocked;
}

/**
 * Medaliile deținute de un user: cele din DB + cele derivate din rol.
 * Rolurile NU se stochează — un moderator retrogradat pierde „Șerif de cartier"
 * instant, fără migrare și fără vreo revocare explicită.
 */
export function withRoleAchievements(
  stored: { id: string; unlockedAt?: Date }[],
  role: string | undefined,
  memberSince?: Date
): { id: string; unlockedAt?: Date }[] {
  const roleId = ROLE_ACHIEVEMENTS[role || ""];
  if (!roleId) return stored;
  if (stored.some((a) => a.id === roleId)) return stored;
  return [...stored, { id: roleId, unlockedAt: memberSince }];
}

/** Are userul medalia asta (inclusiv cele derivate din rol)? */
export function holdsAchievement(
  stored: { id: string }[],
  role: string | undefined,
  id: string
): boolean {
  if (stored.some((a) => a.id === id)) return true;
  return ROLE_ACHIEVEMENTS[role || ""] === id;
}

/** Câte medalii are, pentru bara de progres X/34 (rolurile intră la numărat). */
export function countAchievements(stored: { id: string }[], role: string | undefined): number {
  return withRoleAchievements(stored, role).length;
}
