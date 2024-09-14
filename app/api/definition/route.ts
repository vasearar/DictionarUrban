import { NextResponse, NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import wordModel from "../../../models/wordModel";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

export async function POST(req: Request, res: Response) {
  try{
    await mongoose.connect(MONGO_URI);
    const aux = await req.json();

    await wordModel.create(aux);

    return NextResponse.json({ someProp: aux }, { status: 200 });
  } catch(error) {
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
  let query = {};

  if (id){
    query = { _id: new ObjectId(id) };
  } else if (email && word) {
    query = { userEmail: email, word: { $regex: `^${word}`, $options: "i" } };
  } else if (email) {
    query = { userEmail: email };
  } else if (word) {
    query = { word: { $regex: `^${word}`, $options: "i" } };
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


export async function PATCH(req: Request, res: Response) {
  try {
    await mongoose.connect(MONGO_URI);
    const aux = await req.json();
    const likes = aux.likes;
    const id = aux.id;
    
    const updatedWord = await wordModel.findByIdAndUpdate(id, { likes }, { new: true });

    if (!updatedWord) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json(updatedWord, { status: 200 });

  } catch(error) {
    console.error("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: Request, res: Response) {
  try {
    await mongoose.connect(MONGO_URI);
    const aux = await req.json();
    const id = aux.id;
    const email = aux.email;
    const deleteWord = await wordModel.deleteOne({_id: id});
    const newData = await wordModel.find({userEmail: email}).sort({_id: -1});
  
    if (!deleteWord) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json(newData, { status: 200 });

  } catch(error) {
    console.error("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
