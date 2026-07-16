import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/confings/auth";
import { connectDB } from "@/lib/db";
import { enforceRateLimits, getClientIp } from "@/lib/antispam";
import { withRoleAchievements } from "@/lib/achievements";
import { TOTAL_COUNT } from "@/lib/achievementCatalog";
import { diacriticInsensitivePattern } from "@/lib/search";
import userModel from "@/models/userModel";

// Medaliile unui profil. PUBLIC (modalul se deschide de pe orice profil), deci
// răspunsul e o listă albă strictă:
//   • doar id-uri DEBLOCATE — clientul mapează id → titlu din catalog, iar
//     pentru medaliile secrete pe care userul NU le are nu primește nimic, deci
//     nu poate afla din răspuns nici măcar că există;
//   • niciodată emailul, rolul brut sau vreun alt câmp din users.
export async function GET(req: Request) {
  try {
    const username = new URL(req.url).searchParams.get("username")?.trim();
    if (!username) {
      return NextResponse.json({ error: "username is required" }, { status: 400 });
    }

    // Endpoint public de citire: prag lejer, doar cât să nu poată fi folosit
    // ca să enumereze conturi în rafală.
    const limited = await enforceRateLimits([
      { scope: "ach-read-ip", id: getClientIp(req), limit: 120, windowMs: 60_000 },
    ]);
    if (limited) return limited;

    await connectDB();

    const user = await userModel
      .findOne({
        username: { $regex: `^${diacriticInsensitivePattern(username)}$`, $options: "i" },
      })
      .select("email role achievements displayedAchievement createdAt")
      .lean<{
        email?: string;
        role?: string;
        achievements?: { id: string; unlockedAt?: Date }[];
        displayedAchievement?: string | null;
        createdAt?: Date;
      } | null>();

    if (!user) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const session = await getServerSession(authConfig);
    // Emailul e citit doar ca să comparăm cu sesiunea; nu pleacă în răspuns.
    const isOwn = Boolean(session?.user?.email && session.user.email === user.email);

    const unlocked = withRoleAchievements(user.achievements || [], user.role, user.createdAt);

    // Medalia de profil se re-validează la citire: dacă a fost între timp
    // pierdută (influencer mutat, rol retras), nu o mai servim.
    const displayed =
      user.displayedAchievement && unlocked.some((a) => a.id === user.displayedAchievement)
        ? user.displayedAchievement
        : null;

    return NextResponse.json(
      {
        unlocked: unlocked.map((a) => ({ id: a.id, unlockedAt: a.unlockedAt })),
        displayed,
        progress: { count: unlocked.length, total: TOTAL_COUNT },
        isOwn,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Achievements read error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
