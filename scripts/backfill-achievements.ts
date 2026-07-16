/**
 * Backfill: acordă retroactiv toate medaliile meritate, tuturor conturilor.
 *
 * De ce e nevoie: motorul e pe trigger-e — evaluează când se ÎNTÂMPLĂ ceva.
 * Cine avea definiții și like-uri dinainte de lansarea sistemului nu primea
 * nimic până nu mai posta o definiție. Scriptul închide gaura o dată; de aici
 * încolo, ruta de notificări re-scanează singură, o dată pe oră per utilizator
 * (vezi FULL_SCAN_WINDOW_MS), deci nu mai trebuie rulat periodic.
 *
 * Rulare (din rădăcina proiectului):
 *   npx tsx scripts/backfill-achievements.ts --dry-run   (doar raportează)
 *   npx tsx scripts/backfill-achievements.ts             (acordă, în tăcere)
 *   npx tsx scripts/backfill-achievements.ts --toast     (acordă + lasă toast-urile)
 *
 * Implicit e TĂCUT: marchează medaliile ca deja notificate. Altfel un cont cu
 * 23 de definiții ar primi la următoarea vizită un șir de 4-5 toast-uri de câte
 * 6 secunde pentru lucruri făcute acum luni de zile. Cu `--toast` le lasă să
 * apară.
 *
 * Idempotent: grant-urile sunt atomice cu gardă, deci re-rularea nu dublează
 * nimic și nu re-acordă ce există deja.
 */

process.loadEnvFile();

import mongoose from "mongoose";
import userModel from "../models/userModel";
import { checkAchievements } from "../lib/achievements";
import { ACHIEVEMENT_MAP } from "../lib/achievementCatalog";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const withToast = process.argv.includes("--toast");

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI lipsește din .env — nu am unde să mă conectez.");
    process.exit(1);
  }
  await mongoose.connect(uri);

  const users = await userModel.find().select("email username").lean<{ email: string; username?: string }[]>();
  console.log(`Conturi de procesat: ${users.length}${dryRun ? " (dry-run)" : ""}\n`);

  let touched = 0;
  let total = 0;

  for (const user of users) {
    if (!user.email) continue;

    if (dryRun) {
      // Fără scriere: doar arătăm ce are acum, ca să se vadă diferența după.
      const current = await userModel.findOne({ email: user.email }).select("achievements.id").lean<any>();
      console.log(
        `  ${(user.username || "?").padEnd(18)} are acum: ${
          (current?.achievements || []).map((a: any) => a.id).join(", ") || "—"
        }`
      );
      continue;
    }

    // Refolosim motorul, nu re-implementăm pragurile: o singură definiție a
    // regulilor, care nu poate diverge de ce se întâmplă în producție.
    const granted = await checkAchievements(user.email, "full-scan");
    if (granted.length === 0) continue;

    touched++;
    total += granted.length;

    if (!withToast) {
      await userModel.updateOne(
        { email: user.email },
        { $set: { "achievements.$[entry].notified": true } },
        { arrayFilters: [{ "entry.id": { $in: granted } }] }
      );
    }

    console.log(
      `  ${(user.username || "?").padEnd(18)} +${granted.length}: ${granted
        .map((id) => ACHIEVEMENT_MAP[id]?.title || id)
        .join(", ")}`
    );
  }

  if (!dryRun) {
    console.log(
      `\nGata: ${total} medalii acordate la ${touched} conturi${withToast ? " (cu toast)" : " (în tăcere)"}.`
    );
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Backfill eșuat:", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
