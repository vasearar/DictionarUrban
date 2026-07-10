import { renderOgImage, ogSize, ogContentType } from "@/lib/og";

// Imagine OG fallback pentru site (homepage și orice pagină fără OG image
// proprie). Statică, fără DB → poate fi cache-uită agresiv.
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "DexUrban.md — dicționar urban al limbii române";

export default function Image() {
  return renderOgImage({
    title: "DexUrban.md",
    subtitle:
      "Dicționarul urban al limbii române — argou, jargoane și expresii, cu exemple.",
  });
}
