import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/confings/auth";
import { getRandomWordSlug } from "@/lib/words";
import { bumpCounter } from "@/lib/antispam";
import { checkAchievements, DICE_THRESHOLD, DICE_WINDOW_MS } from "@/lib/achievements";

// Butonul „Trage la sorți" din homepage lovește /aleator: alegem un cuvânt
// random și redirecționăm 307 la pagina lui publică. Niciodată cache-uit —
// altfel toată lumea ar nimeri la același cuvânt. Redirectul e relativ la
// host-ul cererii (rămâne pe același domeniu în dev/preview/producție).
export const dynamic = "force-dynamic";

/**
 * Medalia „Păcănele": 50 de aruncări „într-o singură sesiune".
 *
 * „Sesiune" = o fereastră server-side de o oră. Contorul stă în același
 * mecanism ca rate-limit-ul (document atomic + index TTL), deci nu trebuie
 * curățat de nimeni și nu se poate falsifica din client.
 *
 * Totul e fail-open și izolat: dacă orice pas de aici crapă, userul tot ajunge
 * la cuvântul lui. Butonul nu are voie să se strice din cauza unei glume.
 */
async function trackDiceRoll() {
  try {
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;
    if (!email) return; // vizitator nelogat: n-avem cui să acordăm nimic

    const rolls = await bumpCounter({
      scope: "zar",
      id: email,
      windowMs: DICE_WINDOW_MS,
    });
    if (rolls >= DICE_THRESHOLD) {
      await checkAchievements(email, "dice");
    }
  } catch (error) {
    console.error("Dice achievement tracking failed (fail-open):", error);
  }
}

export async function GET(request: Request) {
  await trackDiceRoll();
  const slug = await getRandomWordSlug();
  const target = slug ? `/cuvant/${slug}` : "/";
  return NextResponse.redirect(new URL(target, request.url), { status: 307 });
}
