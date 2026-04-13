'use client'

import Link from "next/link";
import { useState } from "react";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    const usernameRegex = /^[a-zA-Z0-9_ăîșțâĂÎȘȚÂ]+$/;

    if (name.length < 3 || name.length > 28) {
      errors.name = "Porecla trebuie să fie între 3 și 28 de simboluri";
    } else if (!usernameRegex.test(name)) {
      errors.name = "Porecla nu trebuie să conțină simboluri speciale";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Adresa de email nu este validă";
    }

    if (password.length < 6) {
      errors.password = "Parola trebuie să aibă minimum 6 caractere";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Parolele nu coincid";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setSuccess(data.message);
      }
    } catch {
      setError("Ceva nu a mers bine. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center flex-col font-Unbounded py-20">
      <Link href={"/"} id="logo" className="absolute top-8 left-10 md:left-24 flex flex-col text-base font-Unbounded font-bold">
        <p className='text-myorange hidden sm:block'>Dex</p>
        <p className="hidden sm:block">Urban.md</p>
        <svg className="sm:hidden size-8" width="0" height="0" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.9998 11V8.33333L5.99984 8.33333L5.99984 5.66667H3.33317L3.33317 8.33333H0.666504L0.666504 11H3.33317L3.33317 13.6667H5.99984V11L21.9998 11ZM8.6665 16.3333H5.99984L5.99984 13.6667H8.6665V16.3333ZM8.6665 16.3333H11.3332V19H8.6665V16.3333ZM8.6665 3L5.99984 3V5.66667L8.6665 5.66667V3ZM8.6665 3H11.3332V0.333334H8.6665V3Z" fill="#202020"/>
        </svg>
      </Link>
      <div className="bg-transparent p-3 md:p-6 rounded-lg mt-10 flex items-center justify-center flex-col">
        <h1 className="text-mygray text-3xl md:text-4xl mb-4 text-center">Creează cont pe<br/><span className="text-myorange">Dex</span>Urban</h1>
        <p className="font-Spacegrotes text-sm md:text-base text-center mb-12">Completează datele de mai jos pentru a te înregistra.</p>

        {success ? (
          <div className="w-full max-w-[367px] text-center">
            <div className="bg-green-50 border-2 border-green-500 rounded-sm p-6 mb-6">
              <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#22c55e"/>
              </svg>
              <p className="font-Spacegrotesc text-green-700 text-sm">{success}</p>
            </div>
            <Link href="/signIn" className="text-myorange md:hover:text-myhoverorange transition-all font-Spacegrotesc text-sm">
              Înapoi la conectare
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-[367px] flex flex-col gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Porecla (3-28 caractere)"
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldErrors(prev => ({...prev, name: ""})); }}
                className={`bg-mywhite w-full text-mygray text-base md:text-lg font-Spacegrotesc rounded-sm py-2 px-4 border-2 ${fieldErrors.name ? 'border-red-500' : 'border-mygray'} outline-none`}
              />
              {fieldErrors.name && <p className="text-red-500 text-xs mt-1 font-Spacegrotesc">{fieldErrors.name}</p>}
            </div>
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({...prev, email: ""})); }}
                className={`bg-mywhite w-full text-mygray text-base md:text-lg font-Spacegrotesc rounded-sm py-2 px-4 border-2 ${fieldErrors.email ? 'border-red-500' : 'border-mygray'} outline-none`}
              />
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1 font-Spacegrotesc">{fieldErrors.email}</p>}
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Parolă (minimum 6 caractere)"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({...prev, password: ""})); }}
                className={`bg-mywhite w-full text-mygray text-base md:text-lg font-Spacegrotesc rounded-sm py-2 px-4 border-2 ${fieldErrors.password ? 'border-red-500' : 'border-mygray'} outline-none`}
              />
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1 font-Spacegrotesc">{fieldErrors.password}</p>}
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Confirmă parola"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(prev => ({...prev, confirmPassword: ""})); }}
                className={`bg-mywhite w-full text-mygray text-base md:text-lg font-Spacegrotesc rounded-sm py-2 px-4 border-2 ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-mygray'} outline-none`}
              />
              {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-Spacegrotesc">{fieldErrors.confirmPassword}</p>}
            </div>

            {error && <p className="text-red-500 text-xs font-Spacegrotesc">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mydropshadow relative justify-center outline-none w-full md:hover:bg-myhoverorange transition-all bg-myorange text-mywhite font-bold rounded-sm border-mygray flex gap-4 text-xl md:text-2xl font-Spacegrotesc items-center py-2 border-2 mt-2 disabled:opacity-50"
            >
              {loading ? "Se creează..." : "Înregistrare"}
            </button>

            <p className="font-Spacegrotesc text-sm text-center mt-2">
              Ai deja un cont?{" "}
              <Link href="/signIn" className="text-myorange md:hover:text-myhoverorange transition-all">
                Conectează-te
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp;
