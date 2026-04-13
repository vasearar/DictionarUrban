'use client'

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Parola trebuie să aibă minimum 6 caractere");
      return;
    }

    if (password !== confirmPassword) {
      setError("Parolele nu coincid");
      return;
    }

    if (!token) {
      setError("Link invalid. Token-ul lipsește.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setSuccess(data.message);
      }
    } catch {
      setError("Ceva nu a mers bine.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-screen h-screen flex items-center justify-center flex-col font-Unbounded">
        <h1 className="text-mygray text-2xl md:text-3xl mb-4 text-center">Link invalid</h1>
        <Link href="/signIn" className="text-myorange md:hover:text-myhoverorange transition-all font-Spacegrotesc text-sm mt-4">
          Înapoi la conectare
        </Link>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center flex-col font-Unbounded">
      <Link href={"/"} id="logo" className="absolute top-8 left-10 md:left-24 flex flex-col text-base font-Unbounded font-bold">
        <p className='text-myorange hidden sm:block'>Dex</p>
        <p className="hidden sm:block">Urban.md</p>
        <svg className="sm:hidden size-8" width="0" height="0" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.9998 11V8.33333L5.99984 8.33333L5.99984 5.66667H3.33317L3.33317 8.33333H0.666504L0.666504 11H3.33317L3.33317 13.6667H5.99984V11L21.9998 11ZM8.6665 16.3333H5.99984L5.99984 13.6667H8.6665V16.3333ZM8.6665 16.3333H11.3332V19H8.6665V16.3333ZM8.6665 3L5.99984 3V5.66667L8.6665 5.66667V3ZM8.6665 3H11.3332V0.333334H8.6665V3Z" fill="#202020"/>
        </svg>
      </Link>

      <div className="bg-transparent p-3 md:p-6 rounded-lg flex items-center justify-center flex-col">
        <h1 className="text-mygray text-2xl md:text-3xl mb-4 text-center">Parolă nouă</h1>

        {success ? (
          <div className="w-full max-w-[367px] text-center">
            <div className="bg-green-50 border-2 border-green-500 rounded-sm p-6 mb-6">
              <p className="font-Spacegrotesc text-green-700 text-sm">{success}</p>
            </div>
            <Link href="/signIn" className="mydropshadow relative justify-center outline-none w-full max-w-[367px] md:hover:bg-myhoverorange transition-all bg-myorange text-mywhite font-bold rounded-sm border-mygray flex gap-4 text-xl md:text-2xl font-Spacegrotesc items-center py-2 border-2 mt-4">
              Conectează-te
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-[367px] flex flex-col gap-3">
            <input
              type="password"
              placeholder="Parolă nouă (minimum 6 caractere)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-mywhite w-full text-mygray text-base md:text-lg font-Spacegrotesc rounded-sm py-2 px-4 border-2 border-mygray outline-none"
            />
            <input
              type="password"
              placeholder="Confirmă parola nouă"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-mywhite w-full text-mygray text-base md:text-lg font-Spacegrotesc rounded-sm py-2 px-4 border-2 border-mygray outline-none"
            />

            {error && <p className="text-red-500 text-xs font-Spacegrotesc">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mydropshadow relative justify-center outline-none w-full md:hover:bg-myhoverorange transition-all bg-myorange text-mywhite font-bold rounded-sm border-mygray flex gap-4 text-xl md:text-2xl font-Spacegrotesc items-center py-2 border-2 disabled:opacity-50"
            >
              {loading ? "Se salvează..." : "Salvează parola"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const ResetPassword = () => (
  <Suspense>
    <ResetPasswordContent />
  </Suspense>
);

export default ResetPassword;
