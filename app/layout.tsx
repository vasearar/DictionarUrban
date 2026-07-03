import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./shared/Providers";
import Script from 'next/script';
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NC9BXJJB81"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-NC9BXJJB81');
          `}
        </Script>
      </head>

      <body>
        <Providers>
          {children}
        </Providers>
        </body>
    </html>
  );
}
