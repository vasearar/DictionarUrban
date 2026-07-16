import { cache } from "react";
import { connectDB } from "@/lib/db";
import { holdsAchievement } from "@/lib/achievements";
import { ACHIEVEMENT_MAP } from "@/lib/achievementCatalog";
import { diacriticInsensitivePattern } from "@/lib/search";
import userModel from "@/models/userModel";
import wordModel from "@/models/wordModel";

// Profil public de utilizator — DTO cu whitelist strict: nu expunem niciodată
// email, parolă, banned sau lista de like-uri.

export interface PublicBadge {
  /** id-ul din achievementCatalog — e și cheia iconiței (BadgeIcons). */
  id: string;
  label: string;
  /** tile/chip inversat: staff, influencer, endgame */
  special?: boolean;
}

export interface PublicProfile {
  username: string; // casing-ul canonic din colecția users
  role: "user" | "moderator" | "admin";
  memberSince: string; // users.date
  definitionCount: number; // doar definițiile vizibile (nu hidden)
  /** Cel mult UNA: medalia aleasă de user pentru profil. Restul se văd în modal. */
  badges: PublicBadge[];
}

interface UserRow {
  username?: string;
  role?: string;
  date?: string;
  achievements?: { id: string }[];
  displayedAchievement?: string | null;
}

// Match exact (ancorat), insensibil la majuscule și diacritice — același
// pattern ca la căutarea @username din /api/definition.
function exactNameQuery(name: string) {
  return { $regex: `^${diacriticInsensitivePattern(name)}$`, $options: "i" };
}

/**
 * Rezolvă un profil public după poreclă. Dacă porecla nu mai există în users
 * (userul s-a redenumit, dar definițiile vechi păstrează numele denormalizat),
 * urmărește userEmail de pe cea mai recentă definiție vizibilă către userul
 * curent. Întoarce null dacă nu se găsește nimic.
 * Învelit în cache() ca pagina și generateMetadata să partajeze un singur query.
 */
export const getPublicProfile = cache(
  async (name: string): Promise<PublicProfile | null> => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    await connectDB();

    let user = await userModel
      .findOne({ username: exactNameQuery(trimmed) })
      .select("username role date achievements displayedAchievement")
      .lean<UserRow | null>();

    if (!user) {
      const word = await wordModel
        .findOne({ username: exactNameQuery(trimmed), hidden: { $ne: true } })
        .sort({ _id: -1 })
        .select("userEmail")
        .lean<{ userEmail?: string } | null>();
      if (!word?.userEmail) return null;
      user = await userModel
        .findOne({ email: word.userEmail })
        .select("username role date achievements displayedAchievement")
        .lean<UserRow | null>();
    }

    if (!user?.username) return null;

    const definitionCount = await wordModel.countDocuments({
      username: exactNameQuery(user.username),
      hidden: { $ne: true },
    });

    const role = user.role === "moderator" || user.role === "admin" ? user.role : "user";

    return {
      username: user.username,
      role,
      memberSince: user.date || "",
      definitionCount,
      badges: displayedBadge(user, role),
    };
  }
);

/**
 * Medalia aleasă pentru profil — dar numai dacă e chiar deținută. Re-validăm la
 * fiecare citire pentru cazurile în care a fost pierdută după ce a fost pusă pe
 * profil: „Vedeta cartierului" se mută la alt autor, iar medaliile de rol dispar
 * la retrogradare. Altfel un fost moderator ar rămâne cu „Șerif de cartier" pe
 * profil la nesfârșit.
 */
function displayedBadge(user: UserRow, role: string): PublicBadge[] {
  const id = user.displayedAchievement;
  if (!id) return [];

  const achievement = ACHIEVEMENT_MAP[id];
  if (!achievement) return [];

  if (!holdsAchievement(user.achievements || [], role, id)) return [];

  return [{ id, label: achievement.title, special: achievement.special }];
}
