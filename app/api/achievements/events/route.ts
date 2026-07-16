import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/confings/auth";
import { enforceRateLimits, getClientIp } from "@/lib/antispam";
import { checkAchievements } from "@/lib/achievements";

// Evenimente pe care doar clientul le poate observa: ai citit scrisul mărunt
// până la capăt, ai nimerit pe 404, ai apăsat share.
//
// TRUST-THE-CLIENT, asumat: serverul nu are cum să verifice că ai derulat pagina
// până jos. Acceptăm asta pentru că miza e o glumă, nu un privilegiu, iar
// suprafața e închisă din patru părți: sesiune obligatorie (nu se poate acorda
// altcuiva), rate limit (nu se poate trage în buclă), grant idempotent (a doua
// oară nu face nimic) și un allowlist fix de tipuri. Cel mai rău lucru pe care
// îl poate face cineva care trimite POST-ul „pe scurtătură" e să-și dea singur o
// medalie pe care oricum ar fi luat-o derulând 75 de secunde.
const EVENT_ACHIEVEMENTS: Record<string, string> = {
  terms: "terms",
  privacy: "privacy",
  "404": "lost-404",
  share: "share",
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const achievementId = EVENT_ACHIEVEMENTS[String(body?.type)];
    if (!achievementId) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    const limited = await enforceRateLimits([
      { scope: "ach-event", id: email, limit: 10, windowMs: 60_000 },
      { scope: "ach-event-ip", id: getClientIp(req), limit: 30, windowMs: 60_000 },
    ]);
    if (limited) return limited;

    // Sincron în cererea userului → e marcată notificată din start și clientul
    // afișează toast-ul din răspuns, fără să mai aștepte un poll.
    const newAchievements = await checkAchievements(email, "client-event", {
      eventId: achievementId,
    });

    return NextResponse.json({ newAchievements }, { status: 200 });
  } catch (error) {
    console.error("Achievement event error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
