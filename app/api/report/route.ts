import { NextResponse, NextRequest } from "next/server";
import reportModel from "../../../models/reportModel";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

export async function POST(req: Request, res: Response) {
  try{
    await mongoose.connect(MONGO_URI);
    const aux = await req.json();

    await reportModel.create(aux);

    return NextResponse.json({ someProp: aux }, { status: 200 });
  } catch(error) {
    console.log("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.searchParams);
  let word = searchParams.get("word");
  
  try {
    await mongoose.connect(MONGO_URI);
    const data = await reportModel.find().sort({ _id: -1 });
    return NextResponse.json(data);
  } catch (error) {
    console.log("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
