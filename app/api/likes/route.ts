import { NextResponse } from "next/server";
import userModel from "../../../models/userModel";
import wordModel from "../../../models/wordModel";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/confings/auth";

const MONGO_URI = process.env.MONGO_URI!;

// Toggle like SERVER-AUTHORITATIVE.
// Clientul trimite doar intenția ("like"/"unlike") pentru propriul cont
// (emailul vine din sesiune). Contorul cuvântului se modifică DOAR cu +1/-1
// și numai când lista utilizatorului chiar se schimbă (gardă atomică), deci:
//  - nu poate fi trucat din client (max ±1 per utilizator, propriul vot);
//  - păstrează valoarea de bază (ex. like-uri setate manual în DB nu se pierd).
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

    // Modificăm lista doar dacă starea chiar se schimbă:
    //  - like:   doar dacă wordid NU e deja în listă;
    //  - unlike: doar dacă wordid E în listă.
    const filter =
      action === "like"
        ? { email, likes: { $ne: wordid } }
        : { email, likes: wordid };
    const update =
      action === "like"
        ? { $addToSet: { likes: wordid } }
        : { $pull: { likes: wordid } };

    const result = await userModel.updateOne(filter, update);

    let word;
    if (result.modifiedCount === 1) {
      // Lista chiar s-a modificat → aplicăm delta pe contorul existent.
      const delta = action === "like" ? 1 : -1;
      word = await wordModel.findByIdAndUpdate(
        wordid,
        { $inc: { likes: delta } },
        { new: true }
      );
    } else {
      // Starea era deja cea dorită (fără dublă numărare). Verificăm doar
      // că utilizatorul există și returnăm contorul curent.
      const exists = await userModel.exists({ email });
      if (!exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      word = await wordModel.findById(wordid);
    }

    const likes = Math.max(0, word?.likes ?? 0);
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
