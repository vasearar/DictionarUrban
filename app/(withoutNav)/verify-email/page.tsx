'use client'

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const VerifyEmailContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Link invalid. Token-ul lipsește.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Ceva nu a mers bine.");
      });
  }, [token]);

  return (
    <div className="w-screen h-screen flex items-center justify-center flex-col font-Unbounded">
      <Link href={"/"} id="logo" className="absolute top-8 left-10 md:left-24 flex flex-col text-base font-Unbounded font-bold">
        <p className='text-myorange hidden sm:block'>Dex</p>
        <p className="hidden sm:block">Urban.md</p>
        <svg className="sm:hidden size-8" width="0" height="0" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.9998 11V8.33333L5.99984 8.33333L5.99984 5.66667H3.33317L3.33317 8.33333H0.666504L0.666504 11H3.33317L3.33317 13.6667H5.99984V11L21.9998 11ZM8.6665 16.3333H5.99984L5.99984 13.6667H8.6665V16.3333ZM8.6665 16.3333H11.3332V19H8.6665V16.3333ZM8.6665 3L5.99984 3V5.66667L8.6665 5.66667V3ZM8.6665 3H11.3332V0.333334H8.6665V3Z" fill="#202020"/>
        </svg>
      </Link>

      <div className="bg-transparent p-3 md:p-6 rounded-lg flex items-center justify-center flex-col max-w-[400px]">
        {status === "loading" && (
          <h1 className="text-mygray text-2xl md:text-3xl text-center">Se verifică...</h1>
        )}

        {status === "success" && (
          <>
            <svg className="mb-6" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#22c55e"/>
            </svg>
            <h1 className="text-mygray text-2xl md:text-3xl mb-4 text-center">{message}</h1>
            <Link href="/signIn" className="mydropshadow relative justify-center outline-none w-full md:hover:bg-myhoverorange transition-all bg-myorange text-mywhite font-bold rounded-sm border-mygray flex gap-4 text-xl md:text-2xl font-Spacegrotesc items-center py-2 border-2 mt-6">
              Conectează-te
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <svg className="mb-6" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ef4444"/>
            </svg>
            <h1 className="text-mygray text-2xl md:text-3xl mb-4 text-center">{message}</h1>
            <Link href="/signIn" className="text-myorange md:hover:text-myhoverorange transition-all font-Spacegrotesc text-sm mt-4">
              Înapoi la conectare
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

const VerifyEmail = () => (
  <Suspense>
    <VerifyEmailContent />
  </Suspense>
);

export default VerifyEmail;
