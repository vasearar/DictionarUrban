import type { Metadata } from "next";
import "../globals.css";
import { Providers } from "../shared/Providers";

export const metadata: Metadata = {
  title: "Dicționar urban",
  description: "Dicționarul urban a limbii române",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}
