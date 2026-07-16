import { NextResponse, NextRequest } from "next/server";
import userModel from "../../../models/userModel";
import wordModel from "../../../models/wordModel";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/confings/auth";
import { getClientIp, enforceRateLimits } from "@/lib/antispam";
import { validateUsername, sameUsernameQuery } from "@/lib/username";

const MONGO_URI = process.env.MONGO_URI!;

export async function PATCH(req: NextRequest) {
  try {
    await mongoose.connect(MONGO_URI);

    const aux = await req.json();
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;

    if (!email || aux.email !== email) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Validare SERVER-SIDE: regulile existau doar în browser (`verifyUsername`),
    // deci un apel direct la API putea seta orice lungime/caracter.
    const newUsername = typeof aux.data === "string" ? aux.data.trim() : "";
    const invalid = validateUsername(newUsername);
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    const limited = await enforceRateLimits([
      { scope: "username-ip", id: getClientIp(req), limit: 5, windowMs: 60_000 },
      { scope: "username", id: email, limit: 10, windowMs: 3_600_000 },
    ]);
    if (limited) return limited;

    // Unicitate: lipsea complet, deci îmi puteam lua porecla altcuiva și
    // definițiile noastre ajungeau sub același profil.
    const taken = await userModel
      .findOne({ username: sameUsernameQuery(newUsername), email: { $ne: email } })
      .select("_id")
      .lean();
    if (taken) {
      return NextResponse.json({ error: "Această poreclă deja se folosește" }, { status: 409 });
    }

    // Proiecție: răspunsul mergea înapoi cu tot documentul, inclusiv hash-ul de
    // parolă. E propriul cont al apelantului, deci nu era o scurgere către
    // altcineva, dar hash-ul n-are ce căuta pe fir — clientul folosește doar porecla.
    const updatedUser = await userModel.findOneAndUpdate(
      { email: email },
      { username: newUsername },
      { new: true, projection: "username" }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedWords = await wordModel.updateMany(
      { userEmail: email },
      { username: newUsername }
    );

    if (updatedWords.matchedCount === 0) {
      console.warn("No words were updated. User may not have any words.");
    }

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await mongoose.connect(MONGO_URI);

    const aux = await req.json();
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;

    if (!email || aux.email !== email) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
    
    const deletedUser = await userModel.findOneAndDelete({ email: email });

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const deletedWords = await wordModel.deleteMany({ userEmail: email });

    return NextResponse.json({ message: "User and associated words deleted successfully", deletedUser, deletedWords }, { status: 200 });

  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
