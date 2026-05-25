import { NextResponse } from "next/server";
import { requireRole } from "@/lib/moderationAuth";
import auditLogModel from "@/models/auditLogModel";

export async function GET() {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;

  try {
    const auditLogs = await auditLogModel.find().sort({ createdAt: -1 }).limit(250);
    return NextResponse.json(auditLogs, { status: 200 });
  } catch (error) {
    console.error("Audit log error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
