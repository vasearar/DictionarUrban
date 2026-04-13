import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import userModel from "@/models/userModel";
import passwordResetTokenModel from "@/models/passwordResetTokenModel";

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
