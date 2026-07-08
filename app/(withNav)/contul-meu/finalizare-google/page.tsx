'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Pagina pe care aterizează utilizatorul după OAuth-ul Google pornit din
// modalul „Păstrează-ți contul". Finalizează migrarea contului anonim
// (ruta /complete validează cookie-ul de intenție) și întoarce în cont.
const FinalizareGoogle = () => {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // strict mode montează de două ori în dev
    started.current = true;

    fetch("/api/account/link-google/complete", { method: "POST" })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          router.replace("/contul-meu");
        } else {
          setStatus("error");
          setMessage(data.error || "Ceva nu a mers bine.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Ceva nu a mers bine.");
      });
  }, [router]);

  return (
    <div className="w-full flex items-center justify-center flex-col font-Spacegrotesc my-24 px-3">
      {status === "loading" && (
        <h1 className="text-mygray text-2xl md:text-3xl text-center">Îți legăm contul de Google...</h1>
      )}

      {status === "error" && (
        <>
          <svg className="mb-6" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ef4444"/>
          </svg>
          <h1 className="text-mygray text-2xl md:text-3xl mb-4 text-center">{message}</h1>
          <Link href="/contul-meu" className="text-myorange md:hover:text-myhoverorange transition-all text-sm mt-4 font-bold">
            Înapoi la contul meu
          </Link>
        </>
      )}
    </div>
  );
};

export default FinalizareGoogle;
