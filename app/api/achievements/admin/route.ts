import { NextResponse } from "next/server";
import { logAuditAction, requireRole } from "@/lib/moderationAuth";
import { MANUAL_GRANTABLE } from "@/lib/achievementCatalog";
import userModel from "@/models/userModel";

// Acordare/retragere manuală de medalii, doar pentru admini.
//
// Lista `MANUAL_GRANTABLE` e închisă la „beta" — o medalie retroactivă pe care
// nimeni n-o mai poate obține altfel. Restul se câștigă, nu se dau: dacă ruta
// ar accepta orice id, un admin ar putea acorda „Atinge iarba" sau ar putea
// pune „Vedeta cartierului" pe cine vrea, ocolind singura regulă care o face
// interesantă. De asta nici rol-* nu e aici — alea vin din `user.role`.
//
// ─────────────────────────────────────────────────────────────────────────────
// SCHIȚĂ PENTRU MAI TÂRZIU — coduri de revendicare (merch + easter eggs social)
//
// Medaliile de merch și cele ascunse pe Instagram/TikTok au nevoie de un cod
// unic, nu de un buton de admin. Forma minimă, când le implementăm:
//
//   models/claimCodeModel.ts
//     { codeHash: String,        // hash, nu codul în clar: DB-ul nu e o cheie
//       achievementId: String,   // ce deblochează
//       maxUses: Number,         // 1 pentru merch, N pentru un cod public
//       usedBy: [String],        // emailuri, ca să nu-l poată refolosi același om
//       expiresAt: Date }        // index TTL
//
//   POST /api/achievements/claim  { code }
//     sesiune obligatorie → hash → lookup → verifică maxUses/usedBy/expiresAt →
//     grant idempotent + $push usedBy, atomic. Rate limit AGRESIV pe user și pe
//     IP (ex. 5/min, 20/oră): un cod scurt e ghicibil prin brute-force, iar aici
//     limita e singura apărare. Codurile se generează cu crypto.randomBytes.
// ─────────────────────────────────────────────────────────────────────────────

const ACTIONS = ["grant", "revoke"] as const;

export async function POST(req: Request) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;

  try {
    const { userId, action, id } = await req.json();

    if (!userId || !ACTIONS.includes(action) || !MANUAL_GRANTABLE.includes(id)) {
      return NextResponse.json({ error: "Invalid achievement action" }, { status: 400 });
    }

    const targetUser = await userModel.findById(userId).select("email achievements");
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "grant") {
      // Idempotent, ca peste tot: garda e în filtru.
      await userModel.updateOne(
        { _id: userId, "achievements.id": { $ne: id } },
        { $push: { achievements: { id, unlockedAt: new Date(), notified: false } } }
      );
    } else {
      await userModel.updateOne({ _id: userId }, { $pull: { achievements: { id } } });
      // Nu lăsăm pe profil o medalie care tocmai a fost retrasă.
      await userModel.updateOne(
        { _id: userId, displayedAchievement: id },
        { $set: { displayedAchievement: null } }
      );
    }

    await logAuditAction({
      actor: auth.user,
      action: `achievement_${action}`,
      targetType: "user",
      targetId: userId,
      targetEmail: targetUser.email,
      details: { achievementId: id },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Achievement admin action error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
