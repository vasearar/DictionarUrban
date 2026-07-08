import { cache } from "react";
import { connectDB } from "@/lib/db";
import { diacriticInsensitivePattern } from "@/lib/search";
import userModel from "@/models/userModel";
import wordModel from "@/models/wordModel";

// Profil public de utilizator — DTO cu whitelist strict: nu expunem niciodată
// email, parolă, banned sau lista de like-uri.

export interface PublicBadge {
  id: string;
  label: string;
  icon?: string;
}

export interface PublicProfile {
  username: string; // casing-ul canonic din colecția users
  role: "user" | "moderator" | "admin";
  memberSince: string; // users.date
  definitionCount: number; // doar definițiile vizibile (nu hidden)
  badges: PublicBadge[]; // mereu gol deocamdată — slot de extensie
}

interface UserRow {
  username?: string;
  role?: string;
  date?: string;
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
      .select("username role date")
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
        .select("username role date")
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
      badges: [],
    };
  }
);
