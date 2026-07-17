import { NextResponse, NextRequest } from "next/server";
import wordModel from "../../../models/wordModel";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/confings/auth";
import { getClientIp, enforceRateLimits, validateField } from "@/lib/antispam";

const MONGO_URI = process.env.MONGO_URI!;

export async function PATCH(req: Request) {
  try{
    const aux = await req.json();
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // `aux.data` era citit direct: un body fără `data` arunca TypeError → 500.
    const id = aux?.wordid;
    const data = aux?.data ?? {};
    const word = typeof data.word === "string" ? data.word.trim() : "";
    const definition = typeof data.definition === "string" ? data.definition.trim() : "";
    const exampleOfUsing = typeof data.exampleOfUsing === "string" ? data.exampleOfUsing.trim() : "";

    if (!id || !word || !definition || !exampleOfUsing) {
      return NextResponse.json({ error: "All definition fields are required" }, { status: 400 });
    }
    // Un id care nu e ObjectId arunca CastError → 500. E un 404, nu o defecțiune.
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    // Aceleași reguli ca la POST /api/definition. Lipseau complet aici, deci se
    // putea publica o definiție cuminte și apoi edita în orice — lungime sau
    // caractere pe care crearea nu le-ar fi acceptat niciodată.
    const contentError =
      validateField({ value: word, min: 2, max: 40, label: "*Expresia sau cuvântul", charset: true }) ||
      validateField({ value: definition, min: 6, max: 460, label: "*Definiția", charset: true }) ||
      validateField({ value: exampleOfUsing, min: 20, max: 250, label: "*Exemplul de folosire", charset: true });
    if (contentError) {
      return NextResponse.json({ error: contentError }, { status: 400 });
    }

    // Praguri lejere: un om corectează un typo de câteva ori, nu de 60.
    // Fără captcha aici, intenționat — ar transforma o corectură în corvoadă.
    const limited = await enforceRateLimits([
      { scope: "edit", id: email, limit: 10, windowMs: 60_000 },
      { scope: "edit", id: email, limit: 60, windowMs: 3_600_000 },
      { scope: "edit-ip", id: getClientIp(req), limit: 30, windowMs: 60_000 },
    ]);
    if (limited) return limited;

    await mongoose.connect(MONGO_URI);

    // Filtrul pe `userEmail` e ce împiedică editarea definiției altcuiva.
    const updatedWord = await wordModel.findOneAndUpdate(
      { _id: id, userEmail: email },
      { word, definition, exampleOfUsing },
      { new: true }
    );

    if (!updatedWord) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }
    return NextResponse.json(updatedWord, { status: 200 }); 

  } catch(error) {
    console.error("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
