'use client'

import { signIn } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"

interface CredentialsFormProps {
  accepted: boolean;
  setShouldAnimate: React.Dispatch<React.SetStateAction<boolean>>;
}

const CredentialsForm: React.FC<CredentialsFormProps> = ({ accepted, setShouldAnimate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!accepted) {
      setShouldAnimate(true);
      return;
    }

    if (!email || !password) {
      setError("Introdu email-ul și parola");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      window.location.href = "/verifying";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[367px] flex flex-col gap-3">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-mywhite w-full text-mygray text-base md:text-lg font-Spacegrotesc rounded-sm py-2 px-4 border-2 border-mygray outline-none"
      />
      <input
        type="password"
        placeholder="Parolă"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-mywhite w-full text-mygray text-base md:text-lg font-Spacegrotesc rounded-sm py-2 px-4 border-2 border-mygray outline-none"
      />
      {error && (
        <p className="text-red-500 text-xs font-Spacegrotesc">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mydropshadow relative justify-center outline-none w-full md:hover:bg-myhoverorange transition-all bg-myorange text-mywhite font-bold rounded-sm border-mygray flex gap-4 text-xl md:text-2xl font-Spacegrotesc items-center py-2 border-2 disabled:opacity-50"
      >
        {loading ? "Se conectează..." : "Conectare"}
      </button>
      <div className="flex justify-between font-Spacegrotesc text-sm">
        <Link href="/signUp" className="text-myorange md:hover:text-myhoverorange transition-all">
          Creează cont
        </Link>
        <Link href="/forgot-password" className="text-myorange md:hover:text-myhoverorange transition-all">
          Am uitat parola
        </Link>
      </div>
    </form>
  );
};

export default CredentialsForm;
