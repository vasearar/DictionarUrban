import { NextResponse, NextRequest } from "next/server";
import userModel from "../../../models/userModel";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

export async function PATCH(req: Request, res: Response) {
  try {
    await mongoose.connect(MONGO_URI);
    const aux = await req.json();
    const wordid = aux.wordid;
    const email = aux.email;

    const updatedLiked = await userModel.findOneAndUpdate(
      { email: email },
      { $push: { likes: wordid } },
      { new: true }
    );

    if (!updatedLiked) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json(updatedLiked, { status: 200 });

  } catch(error) {
    console.error("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: Request, res: Response) {
  try {
    await mongoose.connect(MONGO_URI);
    const aux = await req.json();
    const wordid = aux.wordid;
    const email = aux.email;

    const updatedLiked = await userModel.findOneAndUpdate(
      { email: email },
      { $pull: { likes: wordid } },
      { new: true }
    );

    if (!updatedLiked) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json(updatedLiked, { status: 200 });

  } catch(error) {
    console.error("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(req: Request, res: Response) {
  try {
    await mongoose.connect(MONGO_URI);
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    // console.log(array.likes.includes(id));
    if (!id || !email) {
      return NextResponse.json({ error: "ID and email are required" }, {status: 400});
    }
    const array = await userModel.findOne({email: email});
    if (!array){
      return NextResponse.json({ error: "User not found" }, {status: 404});
    }

    const liked = array.likes.includes(id);
    return NextResponse.json({ liked }, {status: 200});
  } catch(error) {
    console.error("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}