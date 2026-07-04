import { NextResponse, NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import wordModel from "../../../models/wordModel";
import userModel from "../../../models/userModel";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/confings/auth";
import {
  getClientIp,
  enforceRateLimits,
  looksAutomated,
  validateField,
  verifyCaptchaToken,
} from "@/lib/antispam";

const MONGO_URI = process.env.MONGO_URI!;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();

    // 1. Semnale de bot invizibile pentru om (honeypot completat / submit instant).
    //    Răspundem 200 „gol" ca botul să creadă că a reușit și să nu-și ajusteze scriptul.
    if (looksAutomated(body)) {
      return NextResponse.json({ someProp: null }, { status: 200 });
    }

    const word = typeof body?.word === "string" ? body.word.trim() : "";
    const definition = typeof body?.definition === "string" ? body.definition.trim() : "";
    const exampleOfUsing = typeof body?.exampleOfUsing === "string" ? body.exampleOfUsing.trim() : "";

    if (!word || !definition || !exampleOfUsing) {
      return NextResponse.json({ error: "All definition fields are required" }, { status: 400 });
    }

    // 2. Validare de conținut SERVER-SIDE (înainte era doar în browser → se sărea peste).
    const contentError =
      validateField({ value: word, min: 2, max: 40, label: "*Expresia sau cuvântul", charset: true }) ||
      validateField({ value: definition, min: 6, max: 460, label: "*Definiția", charset: true }) ||
      validateField({ value: exampleOfUsing, min: 20, max: 250, label: "*Exemplul de folosire", charset: true });
    if (contentError) {
      return NextResponse.json({ error: contentError }, { status: 400 });
    }

    // 3. Captcha verificat pe server (dacă e configurat) — nu se mai poate sări peste.
    if (!(await verifyCaptchaToken(body?.captcha))) {
      return NextResponse.json({ error: "Verificarea captcha a eșuat" }, { status: 400 });
    }

    // 4. Rate-limit pe IP + identitate. Emailul e gratis (provider anonim), deci
    //    IP-ul e plasa reală împotriva scripturilor. Praguri generoase pt. oameni.
    const ip = getClientIp(req);
    const limited = await enforceRateLimits([
      { scope: "def", id: email, limit: 6, windowMs: 60_000 },
      { scope: "def", id: email, limit: 40, windowMs: 3_600_000 },
      { scope: "def-ip", id: ip, limit: 20, windowMs: 60_000 },
      { scope: "def-ip", id: ip, limit: 120, windowMs: 3_600_000 },
    ]);
    if (limited) return limited;

    await mongoose.connect(MONGO_URI);

    // 5. Anti-duplicat: același autor nu poate re-posta identic același cuvânt+definiție.
    const duplicate = await wordModel.findOne({ userEmail: email, word, definition });
    if (duplicate) {
      return NextResponse.json({ error: "Ai adăugat deja această definiție" }, { status: 409 });
    }

    // Identitatea autorului vine din sesiune / DB — niciodată din body,
    // ca să nu se poată publica conținut în numele altui utilizator.
    const author = await userModel.findOne({ email });
    const username = author?.username || session.user?.name || "Anonim";

    const created = await wordModel.create({
      word,
      definition,
      exampleOfUsing,
      username,
      userEmail: email,
      likes: 0, // forțat — nu se pot semăna like-uri false
      date: typeof body?.date === "string" ? body.date : new Date().toISOString(),
    });

    return NextResponse.json({ someProp: created }, { status: 200 });
  } catch (error) {
    console.log("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const email = searchParams.get("email");
  const word = searchParams.get("word");
  const id = searchParams.get("id");
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const usernameSearch = word?.startsWith("@") ? word.slice(1).trim() : "";
  let query = {};

  if (email) {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email || session.user.email !== email) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
  }

  if (id){
    query = { _id: new ObjectId(id), hidden: { $ne: true } };
  } else if (email && word) {
    query = { userEmail: email, word: { $regex: `^${escapeRegex(word)}`, $options: "i" } };
  } else if (email) {
    query = { userEmail: email };
  } else if (usernameSearch) {
    query = { username: { $regex: `^${escapeRegex(usernameSearch)}$`, $options: "i" }, hidden: { $ne: true } };
  } else if (word) {
    query = { word: { $regex: `^${escapeRegex(word)}`, $options: "i" }, hidden: { $ne: true } };
  } else {
    query = { hidden: { $ne: true } };
  }
  
  try {
    await mongoose.connect(MONGO_URI);
    const data = await wordModel.find(query).sort({ _id: -1 });
    return NextResponse.json(data);
  } catch (error) {
    console.log("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}


export async function DELETE(req: Request, res: Response) {
  try {
    await mongoose.connect(MONGO_URI);
    const aux = await req.json();
    const session = await getServerSession(authConfig);
    const id = aux.id;
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const deleteWord = await wordModel.deleteOne({_id: id, userEmail: email});
    const newData = await wordModel.find({userEmail: email}).sort({_id: -1});
  
    if (deleteWord.deletedCount === 0) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json(newData, { status: 200 });

  } catch(error) {
    console.error("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
