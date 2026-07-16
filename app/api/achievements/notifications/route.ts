import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/confings/auth";
import { connectDB } from "@/lib/db";
import { bumpCounter, enforceRateLimits } from "@/lib/antispam";
import { checkAchievements, FULL_SCAN_WINDOW_MS } from "@/lib/achievements";
import userModel from "@/models/userModel";

// Coada de toast-uri a utilizatorului autentificat.
//
// GET și POST sunt separate intenționat: dacă ack-ul ar fi implicit în GET, un
// toast pierdut (tab închis fix atunci, request picat) ar dispărea pentru
// totdeauna. Așa, o medalie rămâne „pending" până când clientul confirmă
// explicit că a arătat-o.

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const limited = await enforceRateLimits([
      { scope: "ach-notif", id: email, limit: 30, windowMs: 60_000 },
    ]);
    if (limited) return limited;

    // Plasa de siguranță. Trigger-ele punctuale (definiție nouă, like primit)
    // acordă medaliile pe loc, dar au două găuri: nu văd trecutul, iar un like
    // se evaluează doar pentru autorul definiției atinse. Așa că, o dată pe oră
    // per utilizator, re-deducem TOT din DB — la simpla deschidere a site-ului.
    //
    // Contorul e atomic, deci din zece navigări rapide exact una declanșează
    // scanarea; restul plătesc doar un `$inc`. Vechimea (care n-are cum să aibă
    // un eveniment — nimeni nu „face" ceva când îi trece un an) și repararea
    // lui `createdAt` intră tot în scanare.
    const scans = await bumpCounter({
      scope: "ach-scan",
      id: email,
      windowMs: FULL_SCAN_WINDOW_MS,
    });
    if (scans === 1) {
      await checkAchievements(email, "full-scan");
    }

    await connectDB();
    const user = await userModel
      .findOne({ email })
      .select("achievements")
      .lean<{ achievements?: { id: string; notified?: boolean }[] } | null>();

    const pending = (user?.achievements || [])
      .filter((achievement) => !achievement.notified)
      .map((achievement) => achievement.id);

    return NextResponse.json({ pending }, { status: 200 });
  } catch (error) {
    console.error("Achievement notifications error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Ack: medaliile astea au fost arătate, nu le mai trimite.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const limited = await enforceRateLimits([
      { scope: "ach-ack", id: email, limit: 30, windowMs: 60_000 },
    ]);
    if (limited) return limited;

    const body = await req.json();
    const ids = Array.isArray(body?.ids)
      ? body.ids.filter((id: unknown): id is string => typeof id === "string").slice(0, 40)
      : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: "ids are required" }, { status: 400 });
    }

    await connectDB();
    await userModel.updateOne(
      { email },
      { $set: { "achievements.$[entry].notified": true } },
      { arrayFilters: [{ "entry.id": { $in: ids } }] }
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Achievement ack error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
