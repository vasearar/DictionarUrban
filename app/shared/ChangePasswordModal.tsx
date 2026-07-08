'use client'
import React, { useState } from 'react'

interface ChangePasswordModalProps {
  close: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ close }) => {
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
    const currentPassword = (target.elements.namedItem("currentPassword") as HTMLInputElement).value;
    const newPassword = (target.elements.namedItem("newPassword") as HTMLInputElement).value;
    const repeatPassword = (target.elements.namedItem("repeatPassword") as HTMLInputElement).value;

    if (newPassword.length < 6) {
      setError("Parola trebuie să aibă minimum 6 caractere");
      return;
    }
    if (newPassword !== repeatPassword) {
      setError("Parolele noi nu coincid");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message || "Parola a fost schimbată cu succes!");
      } else {
        setError(data.error || "Ceva nu a mers bine. Încearcă din nou.");
      }
    } catch (error) {
      setError("Ceva nu a mers bine. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`h-screen w-screen bg-black bg-opacity-70 z-50 fixed top-0 left-0 flex justify-center items-center font-Spacegrotesc`}>
      <div className='h-fit max-w-[720px] w-full bg-mywhite mx-3 p-4 sm:p-8'>
        <h1 className='text-center font-bold text-3xl'>Schimbă parola</h1>

        {success ? (
          <>
            <p className='text-center mt-6 font-bold text-green-600'>{success}</p>
            <div className="w-full flex flex-row justify-end mt-6 gap-6 relative z-10">
              <button className={`hover:text-myhovergray w-fit text-mygray h-fit px-4 py-2 font-bold text-nowrap relative font-Spacegrotesc rounded-sm bg-mywhite rounded-br-none border-2 border-mygray mydropshadow`} onClick={resetForm}>Am înțeles</button>
            </div>
          </>
        ) : (
          <>
            <form id="change-password" onSubmit={handleSubmit} className='flex-col flex gap-4 mt-4 relative'>
              <input className={`text-2xl px-4 py-2 w-full outline-none border-mygray border-2 rounded-sm`} type="password" name="currentPassword" id="currentPassword" placeholder='Parola actuală' required />
              <input className={`${error ? 'myred' : ''} text-2xl px-4 py-2 w-full outline-none border-mygray border-2 rounded-sm`} title="minimum 6 caractere" type="password" name="newPassword" id="newPassword" placeholder='Parola nouă' required />
              <input className={`${error ? 'myred' : ''} text-2xl px-4 py-2 w-full outline-none border-mygray border-2 rounded-sm`} type="password" name="repeatPassword" id="repeatPassword" placeholder='Repetă parola nouă' required />
              <p className='text-red-500 text-sm -translate-y-3'>{error}</p>
            </form>
            <div className="w-full flex flex-row justify-end mt-6 gap-6 relative z-10">
              <button className={`flex items-center justify-center gap-2 hover:bg-myhoverorange font-Spacegrotesc relative w-fit h-fit border-2 border-mygray font-bold rounded-sm rounded-br-none text-mywhite bg-myorange px-4 py-2 mydropshadow disabled:opacity-40`} form="change-password" type="submit" disabled={loading}>Confirmă</button>
              <button className={`hover:text-myhovergray w-fit text-mygray h-fit px-4 py-2 font-bold text-nowrap relative font-Spacegrotesc rounded-sm bg-mywhite rounded-br-none border-2 border-mygray mydropshadow`} onClick={resetForm}>M-am răzgândit</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChangePasswordModal
