import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/confings/auth";
import { connectDB } from "@/lib/db";
import { isAnonEmail } from "@/lib/anon";
import userModel from "@/models/userModel";
import wordModel from "@/models/wordModel";
import reportModel from "@/models/reportModel";
import auditLogModel from "@/models/auditLogModel";
import linkIntentModel from "@/models/linkIntentModel";
import { isDuplicateKeyError } from "@/lib/mongoErrors";
import { getClientIp, enforceRateLimits } from "@/lib/antispam";

const LINK_INTENT_COOKIE = "dexurban_link_intent";

// Finalizarea legării de Google: rulează cu sesiunea Google NOUĂ, după
// redirectul OAuth. Intenția (cine era contul anonim) vine din cookie-ul
// httpOnly setat de /start și e validată contra DB — single-use, 10 minute.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    const googleEmail = session?.user?.email;
    if (!googleEmail) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    // utilizatorul a anulat Google și a reintrat ca musafir — nimic de legat
    if (isAnonEmail(googleEmail)) {
      return NextResponse.json(
        { error: "Conectarea cu Google nu a fost finalizată." },
        { status: 400 }
      );
    }

    // Ruta face merge de conturi, deci merită o plasă chiar dacă e deja gardată
    // de cookie + token de intenție. Pragul e la fel de larg ca la /start (15/h):
    // legarea se face o dată în viața unui cont.
    const limited = await enforceRateLimits([
      { scope: "linkgoogle-done-ip", id: getClientIp(req), limit: 20, windowMs: 60 * 60 * 1000 },
    ]);
    if (limited) return limited;

    const expired = () => {
      const res = NextResponse.json(
        { error: "Cererea de legare a expirat. Încearcă din nou." },
        { status: 410 }
      );
      res.cookies.set(LINK_INTENT_COOKIE, "", { path: "/", maxAge: 0 });
      return res;
    };

    const token = req.cookies.get(LINK_INTENT_COOKIE)?.value;
    if (!token) return expired();

    await connectDB();

    const intent = await linkIntentModel.findOne({ token });
    if (!intent || intent.expiresAt < new Date()) return expired();

    const { anonEmail } = intent;
    const cleanup = async () => {
      await linkIntentModel.deleteMany({ anonEmail });
    };
    const withClearedCookie = (res: NextResponse) => {
      res.cookies.set(LINK_INTENT_COOKIE, "", { path: "/", maxAge: 0 });
      return res;
    };

    const anonUser = await userModel.findOne({ email: anonEmail });
    if (!anonUser) {
      // intenție veche — contul anonim a fost deja migrat/șters; idempotent
      await cleanup();
      return withClearedCookie(
        NextResponse.json({ merged: false, message: "Contul era deja actualizat." }, { status: 200 })
      );
    }

    const googleUser = await userModel.findOne({ email: googleEmail });
    if (anonUser.banned || googleUser?.banned) {
      await cleanup();
      return withClearedCookie(
        NextResponse.json({ error: "Contul este blocat" }, { status: 403 })
      );
    }

    if (!googleUser) {
      // Ramura A: emailul Google nu are cont — contul anonim devine contul
      // Google (porecla rămâne, nu se mai cere /username).
      try {
        await userModel.updateOne(
          { email: anonEmail },
          { $set: { email: googleEmail, emailVerified: true } }
        );
      } catch (error) {
        if (!isDuplicateKeyError(error)) throw error;
        // Cursă: contul Google a apărut între `findOne` de mai sus și update.
        // NU facem cleanup și NU ștergem cookie-ul — intenția rămâne validă, iar
        // o reluare va găsi `googleUser` și va trece pe ramura B (merge), care e
        // exact ce trebuia să se întâmple.
        return NextResponse.json(
          { error: "Contul Google tocmai a fost creat în paralel. Încearcă din nou." },
          { status: 409 }
        );
      }
      await wordModel.updateMany(
        { userEmail: anonEmail },
        { $set: { userEmail: googleEmail } }
      );
      await reportModel.updateMany(
        { userEmail: anonEmail },
        { $set: { userEmail: googleEmail } }
      );
      await auditLogModel.updateMany(
        { targetEmail: anonEmail },
        { $set: { targetEmail: googleEmail } }
      );
    } else {
      // Ramura B: emailul Google are deja cont — conținutul anonim se mută
      // în el (definițiile preiau porecla contului supraviețuitor, aceeași
      // regulă de denormalizare ca PATCH /api/username), like-urile se unesc,
      // iar documentul anonim dispare.
      await wordModel.updateMany(
        { userEmail: anonEmail },
        { $set: { userEmail: googleEmail, username: googleUser.username } }
      );
      await reportModel.updateMany(
        { userEmail: anonEmail },
        { $set: { userEmail: googleEmail } }
      );
      await auditLogModel.updateMany(
        { targetEmail: anonEmail },
        { $set: { targetEmail: googleEmail } }
      );
      await userModel.updateOne(
        { email: googleEmail },
        { $addToSet: { likes: { $each: anonUser.likes ?? [] } } }
      );
      await userModel.deleteOne({ _id: anonUser._id });
    }

    await cleanup();
    return withClearedCookie(
      NextResponse.json(
        { merged: true, message: "Contul tău este acum legat de Google!" },
        { status: 200 }
      )
    );
  } catch (error) {
    console.error("Link google complete error:", error);
    return NextResponse.json(
      { error: "Ceva nu a mers bine. Încearcă din nou." },
      { status: 500 }
    );
  }
}
