import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import userModel from "@/models/userModel";
import passwordResetTokenModel from "@/models/passwordResetTokenModel";
import { sendPasswordResetEmail } from "@/lib/email";
import { getClientIp, enforceRateLimits } from "@/lib/antispam";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email-ul este obligatoriu" }, { status: 400 });
    }

    // Fără limită, oricine putea bombarda inbox-ul unui utilizator real cu
    // emailuri de resetare (și SMTP-ul nostru odată cu el).
    // Limita pe email se aplică ÎNAINTE de a ști dacă contul există, deci nu
    // devine un canal de enumerare: 429 apare la fel și pentru adrese inexistente.
    const ip = getClientIp(req);
    const limited = await enforceRateLimits([
      { scope: "forgot-ip", id: ip, limit: 5, windowMs: 60_000 },
      { scope: "forgot-ip", id: ip, limit: 20, windowMs: 3_600_000 },
      { scope: "forgot-email", id: String(email).toLowerCase(), limit: 3, windowMs: 3_600_000 },
    ]);
    if (limited) return limited;

    const user = await userModel.findOne({ email, password: { $exists: true, $ne: null } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: "Dacă există un cont cu acest email, vei primi un link de resetare." },
        { status: 200 }
      );
    }

    // Delete any existing reset tokens for this email
    await passwordResetTokenModel.deleteMany({ email });

    const token = crypto.randomBytes(32).toString("hex");
    await passwordResetTokenModel.create({
      email,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await sendPasswordResetEmail(email, token);

    return NextResponse.json(
      { message: "Dacă există un cont cu acest email, vei primi un link de resetare." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Ceva nu a mers bine" },
      { status: 500 }
    );
  }
}
