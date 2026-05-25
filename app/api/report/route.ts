import { NextResponse, NextRequest } from "next/server";
import reportModel from "../../../models/reportModel";
import wordModel from "@/models/wordModel";
import { logAuditAction, requireRole } from "@/lib/moderationAuth";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

export async function POST(req: Request, res: Response) {
  try{
    await mongoose.connect(MONGO_URI);
    const aux = await req.json();

    await reportModel.create({ ...aux, status: "pending" });

    return NextResponse.json({ someProp: aux }, { status: 200 });
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
