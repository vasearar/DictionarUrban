import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import userModel from "@/models/userModel";
import verificationTokenModel from "@/models/verificationTokenModel";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Toate câmpurile sunt obligatorii" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Parola trebuie să aibă minimum 6 caractere" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Adresa de email nu este validă" },
        { status: 400 }
      );
    }

    const usernameRegex = /^[a-zA-Z0-9_ăîșțâĂÎȘȚÂ]+$/;
    if (name.length < 3 || name.length > 28) {
      return NextResponse.json(
        { error: "Porecla trebuie să fie între 3 și 28 de simboluri" },
        { status: 400 }
      );
    }
    if (!usernameRegex.test(name)) {
      return NextResponse.json(
        { error: "Porecla nu trebuie să conțină simboluri speciale" },
        { status: 400 }
      );
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Acest email este deja înregistrat" },
        { status: 409 }
      );
    }

    const existingUsername = await userModel.findOne({ username: name });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Această poreclă deja se folosește" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    };

    await userModel.create({
      email,
      username: name,
      password: hashedPassword,
      emailVerified: false,
      role: "user",
      date: date.toLocaleString("ro-RO", options),
      likes: [],
    });

    const token = crypto.randomBytes(32).toString("hex");
    await verificationTokenModel.create({
      email,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await sendVerificationEmail(email, token);

    return NextResponse.json(
      { message: "Contul a fost creat. Verifică-ți email-ul pentru a activa contul." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Ceva nu a mers bine. Încearcă din nou." },
      { status: 500 }
    );
  }
}
