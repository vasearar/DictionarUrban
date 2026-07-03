import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import userModel from "../../../models/userModel";
import { authConfig } from "@/app/confings/auth";

const MONGO_URI = process.env.MONGO_URI!;

// Creează înregistrarea de user pentru contul autentificat (flux OAuth → alegere poreclă).
// Securitate:
//  - emailul vine DIN SESIUNE, nu din body (nu poți crea cont pentru alt email);
//  - rolul e forțat "user" — niciodată din body, ca să nu se poată injecta
//    role:"admin" (mass-assignment / escaladare de privilegii).
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    await mongoose.connect(MONGO_URI);

    // porecla deja folosită
    const existingUsername = await userModel.findOne({ username });
    if (existingUsername) {
      return NextResponse.json({ error: "Acestă poreclă deja se folosește" }, { status: 409 });
    }

    // contul are deja o înregistrare → nu o dublăm/suprascriem
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ someProp: existingUser }, { status: 200 });
    }

    const created = await userModel.create({
      email, // din sesiune, nu din body
      username,
      role: "user", // forțat — niciodată din body
      date: typeof body?.date === "string" ? body.date : new Date().toISOString(),
      likes: [],
    });

    return NextResponse.json({ someProp: created }, { status: 200 });
  } catch (error) {
    console.log("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Returnează datele minime ale UTILIZATORULUI AUTENTIFICAT (nu ale unui email arbitrar).
// Emailul vine din sesiune, deci nu se mai poate enumera rolul altor conturi.
export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await mongoose.connect(MONGO_URI);
    const user = await userModel.findOne({ email });
    if (user) {
      return NextResponse.json(
        { username: user.username, date: user.date, role: user.role },
        { status: 200 }
      );
    }
    return NextResponse.json({ exists: false }, { status: 201 });
  } catch (error) {
    console.log("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
