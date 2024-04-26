import type { Metadata } from "next";
import "../globals.css";
import NavBar from "../shared/NavBar";
import Footer from "../shared/Footer";

export const metadata: Metadata = {
  title: "Dicționar urban",
  description: "Dicționarul urban a limbii române",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <>
    <header>
      <NavBar />
    </header>
    <main>
      {children}
    </main>
    <footer>
      <Footer />
    </footer>
  </>
  );
}
