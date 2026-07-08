'use client'
import React, { useState } from 'react'
import { signIn } from 'next-auth/react'

interface KeepAccountModalProps {
  close: React.Dispatch<React.SetStateAction<boolean>>;
  onPending: (newEmail: string) => void;
}

// Modal prin care un cont anonim se leagă de un email real + parolă sau de
// Google, ca să nu-și piardă definițiile. Nu cere porecla — rămâne cea veche.
const KeepAccountModal: React.FC<KeepAccountModalProps> = ({ close, onPending }) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    close(false);
    document.body.style.overflow = "auto";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    const target = e.target as HTMLFormElement;
    const email = (target.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (target.elements.namedItem("password") as HTMLInputElement).value;

    if (password.length < 6) {
      setError("Parola trebuie să aibă minimum 6 caractere");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/account/link-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(`Ți-am trimis un email de confirmare la ${email}. După confirmare, reconectează-te cu noul email.`);
        onPending(email);
      } else {
        setError(data.error || "Ceva nu a mers bine. Încearcă din nou.");
      }
    } catch (error) {
      setError("Ceva nu a mers bine. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/account/link-google/start", { method: "POST" });
      if (response.ok) {
        // cookie-ul de intenție e setat — sesiunea Google nouă va fi legată
        // de contul anonim în /contul-meu/finalizare-google
        signIn('google', { callbackUrl: '/contul-meu/finalizare-google' });
        return;
      }
      const data = await response.json();
      setError(data.error || "Ceva nu a mers bine. Încearcă din nou.");
    } catch (error) {
      setError("Ceva nu a mers bine. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`h-screen w-screen bg-black bg-opacity-70 z-50 fixed top-0 left-0 flex justify-center items-center font-Spacegrotesc`}>
      <div className='h-fit max-w-[720px] w-full bg-mywhite mx-3 p-4 sm:p-8'>
        <h1 className='text-center font-bold text-3xl'>Păstrează-ți contul</h1>
        <p className='text-center'>Adaugă un email și o parolă (sau conectează-te cu Google) ca să nu-ți pierzi definițiile. <span className='font-bold'>Porecla ta rămâne neschimbată.</span></p>

        {success ? (
          <>
            <p className='text-center mt-6 font-bold text-green-600'>{success}</p>
            <div className="w-full flex flex-row justify-end mt-6 gap-6 relative z-10">
              <button className={`hover:text-myhovergray w-fit text-mygray h-fit px-4 py-2 font-bold text-nowrap relative font-Spacegrotesc rounded-sm bg-mywhite rounded-br-none border-2 border-mygray mydropshadow`} onClick={resetForm}>Am înțeles</button>
            </div>
          </>
        ) : (
          <>
            <form id="keep-account" onSubmit={handleSubmit} className='flex-col flex gap-4 mt-4 relative'>
              <input className={`${error ? 'myred' : ''} text-2xl px-4 py-2 w-full outline-none border-mygray border-2 rounded-sm`} type="email" name="email" id="link-email" placeholder='Email' required />
              <input className={`${error ? 'myred' : ''} text-2xl px-4 py-2 w-full outline-none border-mygray border-2 rounded-sm`} title="minimum 6 caractere" type="password" name="password" id="link-password" placeholder='Parolă' required />
              <p className='text-red-500 text-sm -translate-y-3'>{error}</p>
            </form>

            <div className='flex items-center gap-4 my-2'>
              <div className='h-[2px] grow bg-mygray opacity-30'></div>
              <span className='text-mygray font-bold'>sau</span>
              <div className='h-[2px] grow bg-mygray opacity-30'></div>
            </div>

            <button onClick={handleGoogle} disabled={loading} className="mydropshadow relative justify-center outline-none w-full md:hover:bg-myhoverorange transition-all bg-mywhite text-mygray font-bold rounded-sm border-mygray flex gap-4 text-xl font-Spacegrotesc items-center py-2 border-2 disabled:opacity-40">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M27.074 11.3887H26V11.3334H14V16.6667H21.5353C20.436 19.7714 17.482 22.0001 14 22.0001C9.58196 22.0001 5.99996 18.4181 5.99996 14.0001C5.99996 9.58208 9.58196 6.00008 14 6.00008C16.0393 6.00008 17.8946 6.76941 19.3073 8.02608L23.0786 4.25475C20.6973 2.03541 17.512 0.666748 14 0.666748C6.63663 0.666748 0.666626 6.63675 0.666626 14.0001C0.666626 21.3634 6.63663 27.3334 14 27.3334C21.3633 27.3334 27.3333 21.3634 27.3333 14.0001C27.3333 13.1061 27.2413 12.2334 27.074 11.3887Z" fill="#FFC107"/>
                <path d="M2.20398 7.79408L6.58465 11.0067C7.76998 8.07208 10.6406 6.00008 14 6.00008C16.0393 6.00008 17.8946 6.76941 19.3073 8.02608L23.0786 4.25475C20.6973 2.03541 17.512 0.666748 14 0.666748C8.87865 0.666748 4.43731 3.55808 2.20398 7.79408Z" fill="#FF3D00"/>
                <path d="M14 27.3333C17.444 27.3333 20.5733 26.0153 22.9393 23.872L18.8127 20.38C17.429 21.4322 15.7383 22.0013 14 22C10.532 22 7.58734 19.7886 6.478 16.7026L2.13 20.0526C4.33667 24.3706 8.81801 27.3333 14 27.3333Z" fill="#4CAF50"/>
                <path d="M27.074 11.3886H26V11.3333H14V16.6666H21.5353C21.0095 18.1442 20.0622 19.4354 18.8107 20.3806L18.8127 20.3793L22.9393 23.8713C22.6473 24.1366 27.3333 20.6666 27.3333 13.9999C27.3333 13.1059 27.2413 12.2333 27.074 11.3886Z" fill="#1976D2"/>
              </svg>
              Continuă cu Google
            </button>

            <div className="w-full flex flex-row justify-end mt-6 gap-6 relative z-10">
              <button className={`flex items-center justify-center gap-2 hover:bg-myhoverorange font-Spacegrotesc relative w-fit h-fit border-2 border-mygray font-bold rounded-sm rounded-br-none text-mywhite bg-myorange px-4 py-2 mydropshadow disabled:opacity-40`} form="keep-account" type="submit" disabled={loading}>Confirmă</button>
              <button className={`hover:text-myhovergray w-fit text-mygray h-fit px-4 py-2 font-bold text-nowrap relative font-Spacegrotesc rounded-sm bg-mywhite rounded-br-none border-2 border-mygray mydropshadow`} onClick={resetForm}>M-am răzgândit</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default KeepAccountModal
