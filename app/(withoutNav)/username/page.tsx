'use client'

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { FormEvent, useState } from 'react';
import { verifyUsername, navigate } from '@/app/api/ServerActions';

const Page = () => {
  const session = useSession();
  const [error, setError] = useState<string | null>(null);

  async function userExist() {
    try {
			const response = await fetch(`/api/contact?email=${session.data?.user?.email}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
      if(response.status == 200){
        navigate();
      };
		} catch (error) {
			console.log(
				"There was a problem with the fetch operation: ", error
			);
		}
  }

  if (session?.data){
    userExist();
  }

  async function onSubmit(e: FormEvent){
		e.preventDefault();
    const usernameInput = document.querySelector("#name") as HTMLInputElement;
    const username = usernameInput.value;
    const verify = await verifyUsername(username);
    if (verify == true){
      addToDb(username);
    } else {
      setError(verify);
      usernameInput.classList.add('myred');
    }
	}

  const date = new Date();

  interface CustomDateTimeFormatOptions extends Intl.DateTimeFormatOptions {
    locale?: string;
  }
  
  const options : CustomDateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC', locale: 'ro' };

  async function addToDb(username: string){
    const data = {
      email: session.data?.user?.email,
      username: username,
      role: "user",
      date: date.toLocaleString('ro-RO', options),
      likes: [],
    };

    try {
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
      if(response.status == 409){
        setError("Acestă poreclă deja se folosește");
      }
			if (!response.ok) {
				throw new Error("HTTP error! status: " + response.status);
			} else {
        navigate();
      }
		} catch (error) {
			console.log(
				"There was a problem with the fetch operation: ", error
			);
		}
  }

  return (
    <>
    {session?.data ? 
    <div className='w-screen h-screen flex justify-center items-center'>
      <Link href={"/"} id="logo" className="absolute top-8 left-10 md:left-24 flex flex-col text-base font-Unbounded font-bold">
          <p className='text-myorange hidden sm:block'>Dex</p>
          <p className="hidden sm:block">Urban.ro</p>
          <svg className="sm:hidden size-8" width="0" height="0" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.9998 11V8.33333L5.99984 8.33333L5.99984 5.66667H3.33317L3.33317 8.33333H0.666504L0.666504 11H3.33317L3.33317 13.6667H5.99984V11L21.9998 11ZM8.6665 16.3333H5.99984L5.99984 13.6667H8.6665V16.3333ZM8.6665 16.3333H11.3332V19H8.6665V16.3333ZM8.6665 3L5.99984 3V5.66667L8.6665 5.66667V3ZM8.6665 3H11.3332V0.333334H8.6665V3Z" fill="#202020"/>
          </svg>
      </Link>
      <form onSubmit={onSubmit} id='username' className='max-h-[308px] px-3 box-border'>
        <h1 className='font-Unbounded text-2xl im:text-3xl text-center md:text-5xl text-mygray'>Care e <span className='text-myorange'>porecla</span> ta?</h1>
        <p className='mt-5 text-mygray font-Spacegrotesc text-center'>Porecla va apărea în spațiul online.<br /> Îți sugerăm <span className='font-bold'>să nu-ți folosești numele real.</span></p>
        <div className='justify-end flex flex-col mt-7 relative'>
          <label htmlFor="name" className='text-right text-xs text-myorange'>*apoi nu se va putea de schimbat</label>
          <input  
                 title="fără simboluri speciale și maxim 28" 
                 id="name" 
                 className="bg-mywhite w-full text-mygray text-xl md:text-2xl max:w-[535px] font-Spacegrotesc rounded-sm py-2 px-4 border-2 border-mygray"
                 type="text" 
                 placeholder="Porecla ta"
                 required
                  />
          {error && <p className="text-red-500 text-xs -bottom-4 absolute font-Spacegrotesc">{error}</p>}        
        </div>
        <button form="username" type="submit" className={`border-2 border-mygray font-Spacegrotesc mt-11 flex items-center justify-center text-mywhite gap-1 text-xl md:text-2xl py-2 rounded-sm w-full max-w-[535px] bg-myorange hover:bg-myhoverorange mydropshadow relative`}>Continuă
          <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M-2.62268e-07 6L-3.49691e-07 8L12 8L12 10L14 10L14 8L16 8L16 6L14 6L14 4L12 4L12 6L-2.62268e-07 6ZM10 2L12 2L12 4L10 4L10 2ZM10 2L8 2L8 -3.49691e-07L10 -2.62268e-07L10 2ZM10 12L12 12L12 10L10 10L10 12ZM10 12L8 12L8 14L10 14L10 12Z" fill="#F1F1F1"/>
					</svg>
        </button>
      </form>
    </div>
    : <p className='secret font-Unbounded text-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center'>Tu nu trebuie să fii aici.<br /><Link href="/" className='text-sm text-blue-400'>înapoi</Link></p>}
    </>
  )
}

export default Page