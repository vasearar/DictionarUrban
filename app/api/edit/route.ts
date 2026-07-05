import { NextResponse, NextRequest } from "next/server";
import wordModel from "../../../models/wordModel";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/confings/auth";

const MONGO_URI = process.env.MONGO_URI!;

export async function PATCH(req: Request) {
  try{
    await mongoose.connect(MONGO_URI);
    const aux = await req.json();
    const session = await getServerSession(authConfig);

    const id = aux.wordid;
    const word = aux.data.word;
    const definition = aux.data.definition;
    const exampleOfUsing = aux.data.exampleOfUsing;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const updatedWord = await wordModel.findOneAndUpdate(
      { _id: id, userEmail: session.user.email },
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
