import { NextResponse } from "next/server";
import { logAuditAction, requireRole } from "@/lib/moderationAuth";
import userModel from "@/models/userModel";

const actions = ["ban", "unban", "assign_moderator", "remove_moderator"] as const;

export async function GET() {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;

  try {
    const users = await userModel
      .find()
      .select("-password")
      .sort({ _id: -1 });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;

  try {
    const { userId, action } = await req.json();

    if (!userId || !actions.includes(action)) {
      return NextResponse.json({ error: "Invalid user action" }, { status: 400 });
    }

    const targetUser = await userModel.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.email === auth.user.email) {
      return NextResponse.json({ error: "You cannot change your own access here" }, { status: 400 });
    }

    if (targetUser.role === "admin") {
      return NextResponse.json({ error: "Admin accounts cannot be changed here" }, { status: 400 });
    }

    const update =
      action === "ban"
        ? { banned: true }
        : action === "unban"
          ? { banned: false }
          : action === "assign_moderator"
            ? { role: "moderator" }
            : { role: "user" };

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .select("-password");

    await logAuditAction({
      actor: auth.user,
      action,
      targetType: "user",
      targetId: userId,
      targetEmail: targetUser.email,
      details: { before: { role: targetUser.role, banned: targetUser.banned }, after: update },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Admin user action error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
