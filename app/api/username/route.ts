import { NextResponse, NextRequest } from "next/server";
import userModel from "../../../models/userModel";
import wordModel from "../../../models/wordModel";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/confings/auth";

const MONGO_URI = process.env.MONGO_URI!;

export async function PATCH(req: NextRequest) {
  try {
    await mongoose.connect(MONGO_URI);

    const aux = await req.json();
    const session = await getServerSession(authConfig);
    const newUsername = aux.data;
    const email = session?.user?.email;

    if (!email || aux.email !== email) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { email: email },
      { username: newUsername },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedWords = await wordModel.updateMany(
      { userEmail: email },
      { username: newUsername }
    );

    if (updatedWords.matchedCount === 0) {
      console.warn("No words were updated. User may not have any words.");
    }

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, res: NextResponse) {
  try {
    await mongoose.connect(MONGO_URI);

    const aux = await req.json();
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;

    if (!email || aux.email !== email) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
    
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
