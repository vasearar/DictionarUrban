import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import userModel from "@/models/userModel";
import verificationTokenModel from "@/models/verificationTokenModel";
import { sendVerificationEmail } from "@/lib/email";
import { getClientIp, enforceRateLimits } from "@/lib/antispam";
import { validateUsername, sameUsernameQuery } from "@/lib/username";
import { isDuplicateKeyError } from "@/lib/mongoErrors";

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

    // Fără limită, ruta asta însemna conturi în masă și email-bombing pe adresa
    // oricui (fiecare înregistrare trimite un email de verificare).
    const ip = getClientIp(req);
    const limited = await enforceRateLimits([
      { scope: "register-ip", id: ip, limit: 5, windowMs: 60_000 },
      { scope: "register-ip", id: ip, limit: 20, windowMs: 3_600_000 },
      { scope: "register-email", id: String(email).toLowerCase(), limit: 3, windowMs: 3_600_000 },
    ]);
    if (limited) return limited;

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

    const invalidUsername = validateUsername(name);
    if (invalidUsername) {
      return NextResponse.json({ error: invalidUsername }, { status: 400 });
    }
    // Validarea lucrează pe forma trimmed — stocăm tot forma trimmed, altfel
    // porecla ar intra în DB cu spații pe care regulile tocmai le-au respins.
    const username = String(name).trim();

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Acest email este deja înregistrat" },
        { status: 409 }
      );
    }

    // Insensibil la majuscule/diacritice, ca lookup-ul de profil: „Mihaita" și
    // „Mihăiță" rezolvă la același profil, deci nu pot fi conturi diferite.
    const existingUsername = await userModel.findOne({ username: sameUsernameQuery(username) });
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

    try {
      await userModel.create({
        email,
        username,
        password: hashedPassword,
        emailVerified: false,
        role: "user",
        date: date.toLocaleString("ro-RO", options),
        createdAt: date, // `date` de mai sus e localizat ro-RO; ăsta e cel calculabil
        likes: [],
      });
    } catch (error) {
      // Cursa pe care o prinde indexul unique de pe `users.email`: două cereri
      // concurente trec amândouă de `findOne` de mai sus. Fără ramura asta, a
      // doua ar primi un 500 generic în loc de motivul real.
      if (isDuplicateKeyError(error)) {
        return NextResponse.json(
          { error: "Acest email este deja înregistrat" },
          { status: 409 }
        );
      }
      throw error;
    }

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
