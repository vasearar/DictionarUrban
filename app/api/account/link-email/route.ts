import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { authConfig } from "@/app/confings/auth";
import { connectDB } from "@/lib/db";
import { isAnonEmail } from "@/lib/anon";
import { enforceRateLimits, getClientIp } from "@/lib/antispam";
import { sendEmailLinkConfirmation } from "@/lib/email";
import userModel from "@/models/userModel";
import emailChangeTokenModel from "@/models/emailChangeTokenModel";

// Legarea unui cont anonim de un email real + parolă.
// Securitate:
//  - emailul anonim vine DIN SESIUNE, nu din body (nu poți migra contul altcuiva);
//  - doar sesiunile anonime pot porni fluxul (verificat server-side cu regex-ul partajat);
//  - parola se persistă DOAR ca hash bcrypt, în documentul de token pending —
//    user doc-ul rămâne neschimbat până la confirmarea emailului.

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
      { scope: "linkmail", id: anonEmail, limit: 3, windowMs: 60 * 60 * 1000 },
      { scope: "linkmail-ip", id: getClientIp(req), limit: 10, windowMs: 60 * 60 * 1000 },
    ]);
    if (limited) return limited;

    const body = await req.json();
    const newEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!newEmail || !password) {
      return NextResponse.json(
        { error: "Toate câmpurile sunt obligatorii" },
        { status: 400 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail) || isAnonEmail(newEmail)) {
      return NextResponse.json(
        { error: "Adresa de email nu este validă" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Parola trebuie să aibă minimum 6 caractere" },
        { status: 400 }
      );
    }

    await connectDB();

    const anonUser = await userModel.findOne({ email: anonEmail });
    if (!anonUser) {
      return NextResponse.json(
        { error: "Contul tău nu are o înregistrare. Reconectează-te." },
        { status: 400 }
      );
    }

    const existing = await userModel.findOne({ email: newEmail });
    if (existing) {
      return NextResponse.json(
        { error: "Acest email este deja înregistrat" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const token = crypto.randomBytes(32).toString("hex");

    // o singură cerere activă per cont anonim
    await emailChangeTokenModel.deleteMany({ anonEmail });
    await emailChangeTokenModel.create({
      anonEmail,
      newEmail,
      token,
      passwordHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await sendEmailLinkConfirmation(newEmail, token);

    return NextResponse.json(
      { message: "Ți-am trimis un email de confirmare. Verifică inbox-ul." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Link email error:", error);
    return NextResponse.json(
      { error: "Ceva nu a mers bine. Încearcă din nou." },
      { status: 500 }
    );
  }
}

// Starea cererii în așteptare — pentru UI-ul din cont (e a utilizatorului
// autentificat, deci nu scurge nimic).
export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    const anonEmail = session?.user?.email;
    if (!anonEmail) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await connectDB();
    const pendingDoc = await emailChangeTokenModel.findOne({
      anonEmail,
      expiresAt: { $gt: new Date() },
    });

    if (pendingDoc) {
      return NextResponse.json(
        { pending: true, newEmail: pendingDoc.newEmail },
        { status: 200 }
      );
    }
    return NextResponse.json({ pending: false }, { status: 200 });
  } catch (error) {
    console.error("Link email status error:", error);
    return NextResponse.json({ error: "Ceva nu a mers bine" }, { status: 500 });
  }
}

// Anularea cererii în așteptare.
export async function DELETE() {
  try {
    const session = await getServerSession(authConfig);
    const anonEmail = session?.user?.email;
    if (!anonEmail) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await connectDB();
    await emailChangeTokenModel.deleteMany({ anonEmail });
    return NextResponse.json({ message: "Cererea a fost anulată." }, { status: 200 });
  } catch (error) {
    console.error("Link email cancel error:", error);
    return NextResponse.json({ error: "Ceva nu a mers bine" }, { status: 500 });
  }
}
