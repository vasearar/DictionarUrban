import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import userModel from "@/models/userModel";
import verificationTokenModel from "@/models/verificationTokenModel";
import { getClientIp, enforceRateLimits } from "@/lib/antispam";

export async function GET(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token lipsă" }, { status: 400 });
    }

    // Ca la reset-password: tokenul e pe 256 de biți, deci limita ține doar de
    // abuz de resurse. Pragul e larg și pentru că scanerele de email prefetch-uiesc
    // linkurile — nu vrem să blocăm o verificare legitimă.
    const ip = getClientIp(req);
    const limited = await enforceRateLimits([
      { scope: "verify-ip", id: ip, limit: 10, windowMs: 60_000 },
      { scope: "verify-ip", id: ip, limit: 60, windowMs: 3_600_000 },
    ]);
    if (limited) return limited;

    const tokenDoc = await verificationTokenModel.findOne({ token });

    if (!tokenDoc) {
      return NextResponse.json(
        { error: "Token invalid sau expirat" },
        { status: 400 }
      );
    }

    if (tokenDoc.expiresAt < new Date()) {
      await verificationTokenModel.deleteOne({ _id: tokenDoc._id });
      return NextResponse.json(
        { error: "Token-ul a expirat. Înregistrează-te din nou." },
        { status: 400 }
      );
    }

    await userModel.updateOne(
      { email: tokenDoc.email },
      { $set: { emailVerified: true } }
    );

    await verificationTokenModel.deleteMany({ email: tokenDoc.email });

    return NextResponse.json(
      { message: "Email-ul a fost verificat cu succes!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Ceva nu a mers bine" },
      { status: 500 }
    );
  }
}
