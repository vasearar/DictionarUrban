import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import userModel from "@/models/userModel";
import verificationTokenModel from "@/models/verificationTokenModel";

export async function GET(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token lipsă" }, { status: 400 });
    }

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
