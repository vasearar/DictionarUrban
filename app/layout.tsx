import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./shared/Providers";
import CookieConsent from "./shared/CookieConsent";
import AchievementToastProvider from "./shared/badges/AchievementToast";
import { Unbounded, Space_Grotesk } from "next/font/google";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// Fonturi self-hosted prin next/font: elimină requestul blocant către
// fonts.googleapis.com și adaugă un fallback cu size-adjust (reduce CLS).
// latin-ext păstrează diacriticele româneşti (ă î ș ț â).
const unbounded = Unbounded({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-unbounded",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-spacegrotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DexUrban.md - dicționar urban de argou și expresii românești",
    template: `%s`,
  },
  description:
    "Dicționarul urban al limbii române, creat de utilizatori: argou, jargoane și expresii neconvenționale, cu exemple de folosire.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "DexUrban.md - dicționar urban de argou și expresii românești",
    description:
      "Dicționarul urban al limbii române, creat de utilizatori: argou, jargoane și expresii neconvenționale.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DexUrban.md - dicționar urban de argou și expresii românești",
    description:
      "Dicționarul urban al limbii române, creat de utilizatori: argou, jargoane și expresii neconvenționale.",
  },
  icons: {
    icon: '/favicon1.ico',
  },
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="ro" className={`dark ${unbounded.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Providers>
          {/* Înăuntrul Providers: are nevoie de sesiune. La rădăcină, nu în
              (withNav): toast-urile trebuie să apară și pe paginile fără navbar
              și pe 404 (de unde se ia chiar o medalie). */}
          <AchievementToastProvider>
            {children}
          </AchievementToastProvider>
        </Providers>
        <CookieConsent />
        </body>
    </html>
  );
}
