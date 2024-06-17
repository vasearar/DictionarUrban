import { NextResponse, NextRequest } from "next/server";
import userModel from "../../../models/userModel";
import wordModel from "../../../models/wordModel";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

export async function DELETE(req: NextRequest, res: NextResponse) {
  try {
    await mongoose.connect(MONGO_URI);

    const aux = await req.json();
    const email = aux.email;
    
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