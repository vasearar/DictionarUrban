import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import userModel from "@/models/userModel";
import passwordResetTokenModel from "@/models/passwordResetTokenModel";
import { getClientIp, enforceRateLimits } from "@/lib/antispam";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token-ul și parola sunt obligatorii" },
        { status: 400 }
      );
    }

    // Tokenul are 256 de biți, deci ghicitul e practic imposibil — limita e aici
    // pentru abuz de resurse, nu ca apărare împotriva brute-force-ului.
    // Se dă click o dată, dintr-un email: pragul nu atinge niciun om real.
    const ip = getClientIp(req);
    const limited = await enforceRateLimits([
      { scope: "reset-ip", id: ip, limit: 10, windowMs: 60_000 },
      { scope: "reset-ip", id: ip, limit: 60, windowMs: 3_600_000 },
    ]);
    if (limited) return limited;

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Parola trebuie să aibă minimum 6 caractere" },
        { status: 400 }
      );
    }

    const tokenDoc = await passwordResetTokenModel.findOne({ token });

    if (!tokenDoc) {
      return NextResponse.json(
        { error: "Token invalid sau expirat" },
        { status: 400 }
      );
    }

    if (tokenDoc.expiresAt < new Date()) {
      await passwordResetTokenModel.deleteOne({ _id: tokenDoc._id });
      return NextResponse.json(
        { error: "Token-ul a expirat. Solicită un nou link de resetare." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await userModel.updateOne(
      { email: tokenDoc.email },
      { $set: { password: hashedPassword } }
    );

    await passwordResetTokenModel.deleteMany({ email: tokenDoc.email });

    return NextResponse.json(
      { message: "Parola a fost resetată cu succes!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Ceva nu a mers bine" },
      { status: 500 }
    );
  }
}
