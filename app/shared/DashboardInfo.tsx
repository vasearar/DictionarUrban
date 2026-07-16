'use client'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import UsernameEdit from './UsernameEdit'
import KeepAccountModal from './KeepAccountModal'
import ChangePasswordModal from './ChangePasswordModal'
import AchievementsButton from './badges/AchievementsButton'
import { isAnonEmail } from '@/lib/anon'

const DashboardInfo = () => {
  const Session = useSession();
  const email = Session?.data?.user?.email;
  const isAnon = isAnonEmail(email);
  const [username, setUsername] = useState("Obținem numele...");
  // Modalul de medalii caută profilul după poreclă, deci butonul apare abia
  // după ce avem porecla reală (nu textul de așteptare).
  const [usernameReady, setUsernameReady] = useState(false);
  const [date, setDate] = useState("[Obținem data înregistrării...]");
  const [hasPassword, setHasPassword] = useState(false);
  // sesiune anonimă al cărei cont a fost deja migrat (în alt browser) —
  // înregistrarea pe emailul anonim nu mai există, cerem reconectare
  const [accountMigrated, setAccountMigrated] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [showUsernameEdit, setShowUsernameEdit] = useState(false);
  const [showKeepAccount, setShowKeepAccount] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [data, setData] = useState<string | null>(null);

  async function getUsername() {
    try {
			const response = await fetch(`/api/contact?email=${Session.data?.user?.email}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
      if(response.status == 200){
				const data = await response.json();
        setUsername(data.username);
        setUsernameReady(Boolean(data.username));
        setDate(data.date);
        setHasPassword(Boolean(data.hasPassword));
      } else if (response.status == 201 && isAnon) {
        // vizita normală trece mereu prin /verifying → /username, deci lipsa
        // înregistrării înseamnă că a fost recheiată pe emailul real
        setAccountMigrated(true);
      };
		} catch (error) {
			console.log(
				"There was a problem with the fetch operation: ", error
			);
		}
  }

  async function getLinkStatus() {
    try {
      const response = await fetch(`/api/account/link-email`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.status == 200) {
        const data = await response.json();
        setPendingEmail(data.pending ? data.newEmail : null);
      }
    } catch (error) {
      console.log("There was a problem with the fetch operation: ", error);
    }
  }

  useEffect(() => {
    if(email){
      getUsername();
      if (isAnon) {
        getLinkStatus();
      }
    }
  }, [email]);

  function displayEdit(email: string){
    setShowUsernameEdit(!showUsernameEdit);
    if(!showUsernameEdit){
      document.body.style.overflow = "hidden";
    }
    setData(email);
  }

  function openModal(setter: React.Dispatch<React.SetStateAction<boolean>>){
    setter(true);
    document.body.style.overflow = "hidden";
  }

  async function cancelLinkRequest(){
    try {
      const response = await fetch(`/api/account/link-email`, { method: "DELETE" });
      if (response.ok) {
        setPendingEmail(null);
      }
    } catch (error) {
      console.log("There was a problem with the fetch operation: ", error);
    }
  }


  function confirmFunction() {
    let text = "Sunteți încrezut că doriți să ștergeți contul? Poate mai bine nu?";
    if (confirm(text) == true) {
      deleteAccount();
    } else {
      return;
    }
  }

 async function deleteAccount(){
    try {
      const res = await fetch(`/api/username`, {
        cache: "no-store",
        method: "DELETE",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({email: email}),
      });
      if (!res.ok) {
        throw new Error('Failed to delete');
      }
      // Contul a fost șters din DB, dar sesiunea (JWT) e stateless și rămâne
      // validă. O curățăm și trimitem userul acasă; altfel /contul-meu ar rămâne
      // blocat pe „Obținem numele..." căutând un cont care nu mai există.
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error('Deleting data error:', error);
      return [];
    }
  }

  // Contul a fost transferat pe noul email (confirmat în alt browser) —
  // sesiunea anonimă veche nu mai corespunde niciunui cont.
  if (isAnon && accountMigrated) {
    return (
      <div className='w-full flex justify-between my-12 font-Spacegrotesc'>
        <div className='mx-auto flex flex-col items-start gap-4 w-full px-3 md:px-0 md:w-[71%]'>
          <h1 className='font-bold text-3xl sm:text-4xl font-Spacegrotesc'>Contul tău a fost transferat pe noul email.</h1>
          <p className='text-zinc-500'>Reconectează-te cu emailul și parola alese ca să-ți accesezi contul.</p>
          <button className='flex items-center gap-2 border-2 relative px-4 tracking-wide h-fit py-2 text-white font-bold border-mygray transition-all bg-myorange hover:bg-myhoverorange mydropshadow' onClick={() => signOut({ callbackUrl: "/conectare" })}>
            Reconectează-te
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {showUsernameEdit && <UsernameEdit email={data} close={setShowUsernameEdit} />}
      {showKeepAccount && <KeepAccountModal close={setShowKeepAccount} onPending={setPendingEmail} />}
      {showChangePassword && <ChangePasswordModal close={setShowChangePassword} />}
      <div className='w-full flex justify-between my-12 font-Spacegrotesc'>
        <div className='mx-auto flex flex-col sm:flex-row justify-between w-full px-3 md:px-0 md:w-[71%]'>
          <div className=''>
            <h1 className='font-bold text-5xl font-Spacegrotesc'>{username}</h1>
            <h6 className='text-zinc-500'>Înregistrat la data {date}</h6>
            {usernameReady && (
              <div className='mt-3'>
                <AchievementsButton username={username} />
              </div>
            )}
          </div>
          <div>
            <div className='flex sm:mt-0 mt-2'>
              <button className='border-2 flex items-center gap-2 relative px-4 tracking-wide h-fit py-2 text-white font-bold border-mygray transition-all bg-myorange hover:bg-myhoverorange mydropshadow' onClick={() => displayEdit(email!)}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 0H15V1H16V2H17V3H18V4H17V5H16V6H15V5H14V4H13V3H12V2H13V1H14M10 4H12V5H13V6H14V8H13V9H12V10H11V11H10V12H9V13H8V14H7V15H6V16H5V17H4V18H0V14H1V13H2V12H3V11H4V10H5V9H6V8H7V7H8V6H9V5H10" fill="#F1F1F1"/>
                </svg>
                Modifică
              </button>
              <button className='ml-6 text-nowrap flex items-center gap-2 border-2 relative px-4 tracking-wide h-fit py-[11px] im:py-2 text-white font-bold border-mygray transition-all bg-myorange hover:bg-myhoverorange mydropshadow' onClick={() =>signOut({ callbackUrl: "/" })}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 0H18V4H16V2H2V16H16V14H18V18H0V0H2ZM18 8H16V6H14V4H12V6H14V8H4V10H14V12H12V14H14V12H16V10H18V8Z" fill="#F1F1F1"/>
                </svg>
                <span className='im:block hidden'>
                  Deconectează-te
                </span>
              </button>
            </div>
            {isAnon && !pendingEmail && (
              <button title="Adaugă un email pentru a păstra contul" className='mt-5 w-full justify-center flex items-center gap-2 border-2 relative px-4 tracking-wide h-fit py-2 text-white font-bold border-mygray transition-all bg-myorange hover:bg-myhoverorange mydropshadow' onClick={() => openModal(setShowKeepAccount)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#F1F1F1"/>
                </svg>
                Păstrează-ți contul
              </button>
            )}
            {isAnon && pendingEmail && (
              <div className='mt-5 border-2 border-mygray bg-mywhite p-3 relative mydropshadow'>
                <p className='font-bold text-sm'>Verifică emailul ({pendingEmail})</p>
                <p className='text-zinc-500 text-sm'>Apasă pe link-ul din email pentru a-ți păstra contul.</p>
                <div className='flex gap-4 mt-2'>
                  <button className='font-bold text-sm text-myorange hover:text-myhoverorange transition-all' onClick={() => openModal(setShowKeepAccount)}>Retrimite</button>
                  <button className='font-bold text-sm text-mygray hover:text-myhovergray transition-all' onClick={cancelLinkRequest}>Anulează</button>
                </div>
              </div>
            )}
            <div className='flex mt-5 gap-6'>
              {hasPassword && (
                <button className='flex items-center gap-2 border-2 relative px-4 tracking-wide h-fit py-2 text-white font-bold border-mygray transition-all bg-myorange hover:bg-myhoverorange mydropshadow' onClick={() => openModal(setShowChangePassword)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15 8H9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8Z" fill="#F1F1F1"/>
                  </svg>
                  Schimbă parola
                </button>
              )}
              <button className='sm:ml-auto flex items-center gap-2 border-2 relative px-4 tracking-wide h-fit py-2 text-white bg-red-600 transition-all hover:bg-red-400 font-bold border-mygray mydropshadow' onClick={() => confirmFunction()}>
                  Șterge cont
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardInfo
