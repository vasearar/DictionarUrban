import { NextResponse, NextRequest } from "next/server";
import reportModel from "../../../models/reportModel";
import wordModel from "@/models/wordModel";
import { logAuditAction, requireRole } from "@/lib/moderationAuth";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/confings/auth";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

export async function POST(req: Request) {
  try{
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    if (!body?.wordId || !body?.reason) {
      return NextResponse.json({ error: "wordId and reason are required" }, { status: 400 });
    }

    await mongoose.connect(MONGO_URI);

    // Câmpurile de stare/raportor sunt controlate de server, nu preluate din body.
    await reportModel.create({
      wordId: body.wordId,
      reason: body.reason,
      optional: typeof body?.optional === "string" ? body.optional : "",
      userEmail: email, // din sesiune, nu din body
      date: typeof body?.date === "string" ? body.date : new Date().toISOString(),
      status: "pending",
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch(error) {
    console.log("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireRole("moderator");
  if (auth.error) return auth.error;
  
  try {
    await mongoose.connect(MONGO_URI);
    const data = await reportModel.find().sort({ _id: -1 });
    const wordIds = [...new Set(data.map((report) => report.wordId).filter(Boolean))];
    const definitions = await wordModel.find({ _id: { $in: wordIds } });
    const definitionsById = new Map(
      definitions.map((definition) => [definition._id.toString(), definition])
    );

    return NextResponse.json(
      data.map((report) => ({
        ...report.toObject(),
        definition: definitionsById.get(report.wordId)?.toObject() || null,
      }))
    );
  } catch (error) {
    console.log("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireRole("moderator");
  if (auth.error) return auth.error;

  try {
    await mongoose.connect(MONGO_URI);
    const { reportId, status } = await req.json();

    if (!["pending", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid report status" }, { status: 400 });
    }

    const report = await reportModel.findByIdAndUpdate(
      reportId,
      {
        status,
        resolvedAt: status === "pending" ? undefined : new Date(),
        resolvedBy: status === "pending" ? undefined : auth.user.email,
      },
      { new: true }
    );

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    await logAuditAction({
      actor: auth.user,
      action: "report_status_changed",
      targetType: "report",
      targetId: report._id.toString(),
      targetEmail: report.userEmail,
      details: { status, wordId: report.wordId },
    });

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
