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
      {/* <head>
        <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Unbounded:wght@200..900&display=swap"
            as="style"
          />
          <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Unbounded:wght@200..900&display=swap"
            as="style"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Unbounded:wght@200..900&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Unbounded:wght@200..900&display=swap"
            rel="stylesheet"
          />
      </head> */}
      <body>
        <Providers>
          {children}
        </Providers>
        </body>
    </html>
  );
}
