import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./shared/Providers";
import CookieConsent from "./shared/CookieConsent";
import { Unbounded, Space_Grotesk } from "next/font/google";

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
  title: "Dicționar urban",
  description: "Dicționarul urban a limbii române",
  icons: {
    icon: '/favicon1.ico',
  },
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en" className={`dark ${unbounded.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Providers>
          {children}
        </Providers>
        <CookieConsent />
        </body>
    </html>
  );
}
