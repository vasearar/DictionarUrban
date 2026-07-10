import { getWordEntry } from "@/lib/words";
import { renderOgImage, ogTruncate, ogSize, ogContentType } from "@/lib/og";

// Imagine OG dinamică per cuvânt: cuvântul mare + prima definiție trunchiată.
// Node runtime (interoghează Mongo). Cache-uită prin ISR ca generarea să nu
// lovească DB-ul la fiecare share.
export const runtime = "nodejs";
export const revalidate = 3600;
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Definiție pe DexUrban.md";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let title = "DexUrban.md";
  let subtitle = "Dicționar urban de argou și expresii românești";

  try {
    const entry = await getWordEntry(decodeURIComponent(slug));
    if (entry) {
      title = entry.word;
      subtitle = ogTruncate(entry.definitions[0].definition, 120);
    }
  } catch {
    // Fallback la textul de brand dacă DB e indisponibil.
  }

  return renderOgImage({ title, subtitle });
}
