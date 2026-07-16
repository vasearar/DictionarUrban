import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { enforceRateLimits, getClientIp } from "@/lib/antispam";
import userModel from "@/models/userModel";
import wordModel from "@/models/wordModel";
import reportModel from "@/models/reportModel";
import auditLogModel from "@/models/auditLogModel";
import emailChangeTokenModel from "@/models/emailChangeTokenModel";
import { isDuplicateKeyError } from "@/lib/mongoErrors";

// Confirmarea legării: link-ul din email poate fi deschis din orice browser
// (fără sesiune), ca la verify-email. Identitatea o dă tokenul single-use.
// După migrare, sesiunea anonimă veche degradează sigur: emailul ei nu mai
// există în DB, deci toate lookup-urile întorc gol; utilizatorul se
// reconectează cu noile credențiale.
export async function POST(req: Request) {
  try {
    const limited = await enforceRateLimits([
      { scope: "linkconfirm-ip", id: getClientIp(req), limit: 20, windowMs: 60 * 60 * 1000 },
    ]);
    if (limited) return limited;

    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token invalid sau expirat" }, { status: 400 });
    }

    await connectDB();

    const tokenDoc = await emailChangeTokenModel.findOne({ token });
    if (!tokenDoc) {
      return NextResponse.json({ error: "Token invalid sau expirat" }, { status: 400 });
    }
    if (tokenDoc.expiresAt < new Date()) {
      await emailChangeTokenModel.deleteOne({ _id: tokenDoc._id });
      return NextResponse.json(
        { error: "Token-ul a expirat. Cere din nou legarea emailului." },
        { status: 400 }
      );
    }

    const { anonEmail, newEmail, passwordHash } = tokenDoc;

    // re-verificare coliziune la redemption (emailul putea fi înregistrat între timp)
    const existing = await userModel.findOne({ email: newEmail });
    if (existing) {
      await emailChangeTokenModel.deleteOne({ _id: tokenDoc._id });
      return NextResponse.json(
        { error: "Acest email a fost înregistrat între timp." },
        { status: 409 }
      );
    }

    const anonUser = await userModel.findOne({ email: anonEmail });
    if (!anonUser) {
      await emailChangeTokenModel.deleteOne({ _id: tokenDoc._id });
      return NextResponse.json(
        { error: "Contul nu mai există." },
        { status: 400 }
      );
    }
    if (anonUser.banned) {
      await emailChangeTokenModel.deleteOne({ _id: tokenDoc._id });
      return NextResponse.json({ error: "Contul tău a fost blocat" }, { status: 403 });
    }

    // Migrarea: întâi identitatea (email + parolă + verificat), apoi cascada
    // pe conținut — dacă pică ceva la mijloc, contul e deja funcțional și
    // recheiat, iar cascada e reluabilă (filtrele pe anonEmail rămân valide).
    try {
      await userModel.updateOne(
        { email: anonEmail },
        { $set: { email: newEmail, password: passwordHash, emailVerified: true } }
      );
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
      // Cursă cu re-verificarea de coliziune de mai sus: emailul a fost
      // înregistrat între `findOne` și update. Același deznodământ ca acolo —
      // tokenul se consumă, fiindcă emailul cerut nu mai e disponibil.
      await emailChangeTokenModel.deleteOne({ _id: tokenDoc._id });
      return NextResponse.json(
        { error: "Acest email a fost înregistrat între timp." },
        { status: 409 }
      );
    }
    await wordModel.updateMany(
      { userEmail: anonEmail },
      { $set: { userEmail: newEmail } } // username rămâne — porecla nu se schimbă
    );
    await reportModel.updateMany(
      { userEmail: anonEmail },
      { $set: { userEmail: newEmail } }
    );
    await auditLogModel.updateMany(
      { targetEmail: anonEmail },
      { $set: { targetEmail: newEmail } }
    );
    await emailChangeTokenModel.deleteMany({ anonEmail });

    return NextResponse.json(
      { message: "Emailul a fost confirmat! Conectează-te cu noul email și parola aleasă." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Link email confirm error:", error);
    return NextResponse.json(
      { error: "Ceva nu a mers bine. Încearcă din nou." },
      { status: 500 }
    );
  }
}
