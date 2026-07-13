import { NextResponse } from "next/server";
import { getRandomWordSlug } from "@/lib/words";

// Butonul „Trage la sorți" din homepage lovește /aleator: alegem un cuvânt
// random și redirecționăm 307 la pagina lui publică. Niciodată cache-uit —
// altfel toată lumea ar nimeri la același cuvânt. Redirectul e relativ la
// host-ul cererii (rămâne pe același domeniu în dev/preview/producție).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const slug = await getRandomWordSlug();
  const target = slug ? `/cuvant/${slug}` : "/";
  return NextResponse.redirect(new URL(target, request.url), { status: 307 });
}
