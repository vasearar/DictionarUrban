import { NextResponse, NextRequest } from "next/server";
import wordModel from "../../../models/wordModel";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

export async function PATCH(req: Request, res: Response) {
  try{
    await mongoose.connect(MONGO_URI);
    const aux = await req.json();

    const id = aux.wordid;
    const word = aux.data.word;
    const definition = aux.data.definition;
    const exampleOfUsing = aux.data.exampleOfUsing;

    const updatedWord = await wordModel.findByIdAndUpdate(id, { word, definition, exampleOfUsing }, { new: true });

    if (!updatedWord) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }
    return NextResponse.json(updatedWord, { status: 200 }); 

  } catch(error) {
    console.error("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
