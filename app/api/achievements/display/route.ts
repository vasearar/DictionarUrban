import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/confings/auth";
import { connectDB } from "@/lib/db";
import { enforceRateLimits } from "@/lib/antispam";
import { holdsAchievement } from "@/lib/achievements";
import userModel from "@/models/userModel";

// Alege medalia afișată pe profilul propriu (una singură) sau niciuna (`null`).
// Se poate seta DOAR o medalie pe care userul chiar o deține — altfel oricine
// și-ar putea pune „Tati" pe profil trimițând un POST.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const limited = await enforceRateLimits([
      { scope: "ach-display", id: email, limit: 20, windowMs: 60_000 },
    ]);
    if (limited) return limited;

    const body = await req.json();
    const id = body?.id;
    if (id !== null && typeof id !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    const user = await userModel
      .findOne({ email })
      .select("role achievements")
      .lean<{ role?: string; achievements?: { id: string }[] } | null>();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // `null` = „fără medalie pe profil". Orice altceva trebuie deținut.
    if (id !== null && !holdsAchievement(user.achievements || [], user.role, id)) {
      return NextResponse.json({ error: "Achievement not unlocked" }, { status: 400 });
    }

    await userModel.updateOne({ email }, { $set: { displayedAchievement: id } });

    return NextResponse.json({ displayed: id }, { status: 200 });
  } catch (error) {
    console.error("Achievement display error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
