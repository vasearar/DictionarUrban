import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authConfig } from "@/app/confings/auth";
import { connectDB } from "@/lib/db";
import { enforceRateLimits, getClientIp } from "@/lib/antispam";
import userModel from "@/models/userModel";
import passwordResetTokenModel from "@/models/passwordResetTokenModel";

// Schimbarea parolei din cont (autentificat). Identitatea vine din sesiune,
// iar parola actuală e cerută ca dovadă — un JWT furat nu e suficient.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const limited = await enforceRateLimits([
      { scope: "chpass", id: email, limit: 5, windowMs: 15 * 60 * 1000 },
      { scope: "chpass-ip", id: getClientIp(req), limit: 20, windowMs: 60 * 60 * 1000 },
    ]);
    if (limited) return limited;

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Toate câmpurile sunt obligatorii" },
        { status: 400 }
      );
    }
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Parola trebuie să aibă minimum 6 caractere" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await userModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Contul nu există" }, { status: 404 });
    }
    if (!user.password) {
      // conturi Google/anonime — butonul e ascuns în UI, dar apărăm și aici
      return NextResponse.json(
        { error: "Contul tău nu are parolă setată" },
        { status: 400 }
      );
    }
    if (user.banned) {
      return NextResponse.json({ error: "Contul tău a fost blocat" }, { status: 403 });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Parola actuală este incorectă" },
        { status: 403 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await userModel.updateOne({ email }, { $set: { password: hashedPassword } });
    // invalidează link-urile de resetare aflate în circulație
    await passwordResetTokenModel.deleteMany({ email });

    return NextResponse.json(
      { message: "Parola a fost schimbată cu succes!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Ceva nu a mers bine. Încearcă din nou." },
      { status: 500 }
    );
  }
}
