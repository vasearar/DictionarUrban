import { NextResponse, NextRequest } from "next/server";
import userModel from "../../../models/userModel";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

export async function POST(req: Request, res: Response) {
  try{
    await mongoose.connect(MONGO_URI);
    const aux = await req.json();
    const userName = await userModel.findOne({username: aux.username}); 
    if (userName){                  
      return NextResponse.json({ error: "Acestă poreclă deja se folosește" }, { status: 409 });
    }
    await userModel.create(aux);
    return NextResponse.json({ someProp: aux }, { status: 200 });
  } catch(error) {
    console.log("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(req: Request, res: Response) {
  try {
    await mongoose.connect(MONGO_URI);
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const email = searchParams.get("email");
    const user = await userModel.findOne({ email });
    if (user) {
      const username = user.username;
      const date = user.date;
      return NextResponse.json({ username: username, date: date }, { status: 200 });
    } else {
      return NextResponse.json({ exists: false }, { status: 201 });
    }
  } catch (error) {
    console.log("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
