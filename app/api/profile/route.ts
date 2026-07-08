import { NextResponse, NextRequest } from "next/server";
import { getPublicProfile } from "@/lib/profile";
import { getClientIp, enforceRateLimits } from "@/lib/antispam";

// Profil public după poreclă: GET /api/profile?username=<nume>
// Fără autentificare — întoarce doar DTO-ul whitelist din lib/profile.ts.

export async function GET(req: NextRequest) {
  const username = new URL(req.url).searchParams.get("username")?.trim() || "";
  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const ip = getClientIp(req);
  const limited = await enforceRateLimits([
    { scope: "profile-ip", id: ip, limit: 120, windowMs: 60_000 },
  ]);
  if (limited) return limited;

  try {
    const profile = await getPublicProfile(username);
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
