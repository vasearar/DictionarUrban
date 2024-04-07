import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Providers } from "../shared/Providers";
import NavBar from "../shared/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dicționar urban",
  description: "Dicționarul urban a limbii române",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Providers>
        <NavBar />
          {children}
        </Providers>
        </body>
    </html>
  );
}
