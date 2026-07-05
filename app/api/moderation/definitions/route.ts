import { NextResponse, NextRequest } from "next/server";
import { logAuditAction, requireRole } from "@/lib/moderationAuth";
import reportModel from "@/models/reportModel";
import wordModel from "@/models/wordModel";

// Listează definițiile ASCUNSE (pentru vederea „Ascunse" din panou), cu căutare
// opțională după cuvânt/autor. Doar moderatori+.
export async function GET(req: NextRequest) {
  const auth = await requireRole("moderator");
  if (auth.error) return auth.error;

  try {
    const q = new URL(req.url).searchParams.get("q")?.trim() || "";
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const query: Record<string, unknown> = { hidden: true };
    if (q) {
      const rx = { $regex: escapeRegex(q), $options: "i" };
      query.$or = [{ word: rx }, { username: rx }, { userEmail: rx }];
    }

    const hidden = await wordModel.find(query).sort({ hiddenAt: -1 }).limit(200);
    return NextResponse.json(hidden, { status: 200 });
  } catch (error) {
    console.error("Hidden list error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Readuce o definiție ascunsă (dezascunde). Doar moderatori+.
export async function POST(req: Request) {
  const auth = await requireRole("moderator");
  if (auth.error) return auth.error;

  try {
    const { id, action } = await req.json();
    if (!id || action !== "restore") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const restored = await wordModel.findByIdAndUpdate(
      id,
      {
        hidden: false,
        $unset: { hiddenAt: "", hiddenBy: "", hiddenReason: "" },
      },
      { new: true }
    );

    if (!restored) {
      return NextResponse.json({ error: "Definition not found" }, { status: 404 });
    }

    await logAuditAction({
      actor: auth.user,
      action: "definition_restored",
      targetType: "definition",
      targetId: id,
      targetEmail: restored.userEmail,
    });

    return NextResponse.json(restored, { status: 200 });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

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
