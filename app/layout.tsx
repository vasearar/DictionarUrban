import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./shared/Providers";

export const metadata: Metadata = {
  title: "Dicționar urban",
  description: "Dicționarul urban a limbii române",
  icons: {
    icon: '/favicon1.ico',
  },
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          {children}
        </Providers>
        </body>
    </html>
  );
}
