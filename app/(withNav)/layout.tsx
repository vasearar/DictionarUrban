import "../globals.css";
import NavBar from "../shared/NavBar";
import Footer from "../shared/Footer";
import { Suspense } from 'react';

// Fără metadata proprie aici: lăsăm default-ul din root layout (title/OG/twitter
// corecte) să se aplice homepage-ului; paginile specifice (cuvânt, profil) își
// suprascriu propria metadata prin generateMetadata.

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <>
      <header>
        <Suspense> 
          <NavBar />
        </Suspense>  
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
