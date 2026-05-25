import { NextResponse } from "next/server";
import { logAuditAction, requireRole } from "@/lib/moderationAuth";
import reportModel from "@/models/reportModel";
import wordModel from "@/models/wordModel";

export async function PATCH(req: Request) {
  const auth = await requireRole("moderator");
  if (auth.error) return auth.error;

  try {
    const { id, word, definition, exampleOfUsing, reportId } = await req.json();

    if (!id || !word || !definition || !exampleOfUsing) {
      return NextResponse.json({ error: "All definition fields are required" }, { status: 400 });
    }

    const previousWord = await wordModel.findById(id);
    if (!previousWord) {
      return NextResponse.json({ error: "Definition not found" }, { status: 404 });
    }

    const updatedWord = await wordModel.findByIdAndUpdate(
      id,
      { word, definition, exampleOfUsing },
      { new: true }
    );

    if (reportId) {
      await reportModel.findByIdAndUpdate(reportId, {
        status: "resolved",
        resolvedAt: new Date(),
        resolvedBy: auth.user.email,
      });
    }

    await logAuditAction({
      actor: auth.user,
      action: "definition_edited",
      targetType: "definition",
      targetId: id,
      targetEmail: previousWord.userEmail,
      details: {
        reportId,
        before: {
          word: previousWord.word,
          definition: previousWord.definition,
          exampleOfUsing: previousWord.exampleOfUsing,
        },
        after: { word, definition, exampleOfUsing },
      },
    });

    return NextResponse.json(updatedWord, { status: 200 });
  } catch (error) {
    console.error("Moderation edit error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireRole("moderator");
  if (auth.error) return auth.error;

  try {
    const { id, reportId, reason } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Definition id is required" }, { status: 400 });
    }

    const hiddenWord = await wordModel.findByIdAndUpdate(
      id,
      {
        hidden: true,
        hiddenAt: new Date(),
        hiddenBy: auth.user.email,
        hiddenReason: reason || "moderator_action",
      },
      { new: true }
    );

    if (!hiddenWord) {
      return NextResponse.json({ error: "Definition not found" }, { status: 404 });
    }

    if (reportId) {
      await reportModel.findByIdAndUpdate(reportId, {
        status: "resolved",
        resolvedAt: new Date(),
        resolvedBy: auth.user.email,
      });
    }

    await logAuditAction({
      actor: auth.user,
      action: "definition_hidden",
      targetType: "definition",
      targetId: id,
      targetEmail: hiddenWord.userEmail,
      details: { reportId, reason: reason || "moderator_action" },
    });

    return NextResponse.json(hiddenWord, { status: 200 });
  } catch (error) {
    console.error("Moderation hide error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
