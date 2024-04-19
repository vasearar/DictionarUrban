import { NextResponse, NextRequest } from "next/server";
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

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams.get('limit');
  try {
    await mongoose.connect(MONGO_URI);
    const data = await wordModel.find({}).sort({_id: -1}).limit(searchParams);
    return NextResponse.json(data);
  } catch(error){
    console.log("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
