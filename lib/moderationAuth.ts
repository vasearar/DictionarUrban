import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/app/confings/auth";
import { connectDB } from "@/lib/db";
import auditLogModel from "@/models/auditLogModel";
import userModel from "@/models/userModel";

export type StaffRole = "moderator" | "admin";

const roleRank = {
  user: 0,
  moderator: 1,
  admin: 2,
};

export async function requireRole(requiredRole: StaffRole) {
  const session = await getServerSession(authConfig);
  const email = session?.user?.email;

  if (!email) {
    return {
      error: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    };
  }

  await connectDB();
  const user = await userModel.findOne({ email });

  if (!user || user.banned) {
    return {
      error: NextResponse.json({ error: "Account not allowed" }, { status: 403 }),
    };
  }

  const userRole = (user.role || "user") as keyof typeof roleRank;
  if (roleRank[userRole] < roleRank[requiredRole]) {
    return {
      error: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
    };
  }

  return { user };
}

export async function logAuditAction({
  actor,
  action,
  targetType,
  targetId,
  targetEmail,
  details,
}: {
  actor: { email: string; role?: string };
  action: string;
  targetType: string;
  targetId: string;
  targetEmail?: string;
  details?: Record<string, unknown>;
}) {
  await auditLogModel.create({
    actorEmail: actor.email,
    actorRole: actor.role || "user",
    action,
    targetType,
    targetId,
    targetEmail,
    details,
  });
}
