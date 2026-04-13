import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import userModel from "@/models/userModel";
import passwordResetTokenModel from "@/models/passwordResetTokenModel";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email-ul este obligatoriu" }, { status: 400 });
    }

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
