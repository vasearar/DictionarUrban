import { ImageResponse } from "next/og";

// Helper partajat pentru imaginile Open Graph dinamice (1200×630).
// Estetică brutalistă, pe brand: fundal întunecat (mygray), accent portocaliu
// (myorange), text alb (mywhite). Folosit de ruta de cuvânt și de fallback.

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const MYGRAY = "#202020";
const MYORANGE = "#E86842";
const MYWHITE = "#F1F1F1";
const MYDARKHOVERGRAY = "#BDBDBD";

/** Taie un text la o singură linie ~max caractere, pe graniță de cuvânt. */
export function ogTruncate(text: string, max = 120): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 30 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function renderOgImage({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  // Cuvinte lungi → font mai mic ca să încapă.
  const titleSize = title.length > 22 ? 68 : title.length > 12 ? 88 : 108;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: MYGRAY,
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 36,
            fontWeight: 700,
            color: MYORANGE,
            letterSpacing: -1,
          }}
        >
          DexUrban.md
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            borderLeft: `10px solid ${MYORANGE}`,
            paddingLeft: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: titleSize,
              fontWeight: 800,
              color: MYWHITE,
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                display: "flex",
                marginTop: 30,
                fontSize: 36,
                color: MYDARKHOVERGRAY,
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", fontSize: 28, color: MYWHITE }}>
          dicționar urban de argou și expresii românești
        </div>
      </div>
    ),
    { ...ogSize }
  );
}
