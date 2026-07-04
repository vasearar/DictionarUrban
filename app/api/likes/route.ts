import { NextResponse } from "next/server";
import userModel from "../../../models/userModel";
import wordModel from "../../../models/wordModel";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/confings/auth";

const MONGO_URI = process.env.MONGO_URI!;

// Toggle like SERVER-AUTHORITATIVE.
// Clientul trimite doar intenția ("like"/"unlike") pentru propriul cont
// (emailul vine din sesiune). Contorul cuvântului NU vine din client — e
// recalculat din numărul real de utilizatori care au cuvântul în lista lor
// de like-uri, deci nu poate fi trucat și se auto-corectează.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { wordid, action } = await req.json();
    if (!wordid || (action !== "like" && action !== "unlike")) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await mongoose.connect(MONGO_URI);

    // Actualizează lista utilizatorului (idempotent: $addToSet / $pull).
    const update =
      action === "like"
        ? { $addToSet: { likes: wordid } }
        : { $pull: { likes: wordid } };

    const user = await userModel.findOneAndUpdate({ email }, update, { new: true });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Sursa de adevăr: câți utilizatori au acest cuvânt în lista lor de like-uri.
    const likes = await userModel.countDocuments({ likes: wordid });
    await wordModel.findByIdAndUpdate(wordid, { likes });

    return NextResponse.json({ liked: action === "like", likes }, { status: 200 });
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Starea inițială: dacă utilizatorul autentificat a dat like acestui cuvânt.
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await mongoose.connect(MONGO_URI);
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ liked: user.likes.includes(id) }, { status: 200 });
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
