import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authConfig } from "@/app/confings/auth";
import { connectDB } from "@/lib/db";
import { isAnonEmail } from "@/lib/anon";
import { enforceRateLimits, getClientIp } from "@/lib/antispam";
import userModel from "@/models/userModel";
import linkIntentModel from "@/models/linkIntentModel";

// Numele cookie-ului e dublat în ruta /complete — Next.js nu permite
// exporturi arbitrare din route.ts.
const LINK_INTENT_COOKIE = "dexurban_link_intent";

// Pornirea legării contului anonim de Google. Sesiunea Google care rezultă
// din signIn('google') e una NOUĂ (JWT, fără adapter), deci intenția de
// legare traversează redirectul OAuth printr-un cookie httpOnly cu un token
// opac, validat contra DB la finalizare (în ruta /complete).
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const anonEmail = session?.user?.email;
    if (!anonEmail) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (!isAnonEmail(anonEmail)) {
      return NextResponse.json({ error: "Contul tău are deja un email" }, { status: 403 });
    }

    const limited = await enforceRateLimits([
      { scope: "linkgoogle", id: anonEmail, limit: 5, windowMs: 60 * 60 * 1000 },
      { scope: "linkgoogle-ip", id: getClientIp(req), limit: 15, windowMs: 60 * 60 * 1000 },
    ]);
    if (limited) return limited;

    await connectDB();
    const anonUser = await userModel.findOne({ email: anonEmail });
    if (!anonUser) {
      return NextResponse.json(
        { error: "Contul tău nu are o înregistrare. Reconectează-te." },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    await linkIntentModel.deleteMany({ anonEmail });
    await linkIntentModel.create({
      anonEmail,
      token,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minute
    });

    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.cookies.set(LINK_INTENT_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // supraviețuiește redirectului top-level de la Google
      path: "/",
      maxAge: 600,
    });
    return res;
  } catch (error) {
    console.error("Link google start error:", error);
    return NextResponse.json(
      { error: "Ceva nu a mers bine. Încearcă din nou." },
      { status: 500 }
    );
  }
}
