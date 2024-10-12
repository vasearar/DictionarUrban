'use client'
import React, { useState } from 'react'
import { verifyUsername } from '../api/ServerActions';

interface UsernameEditProps {
  email: string | null;
  close: React.Dispatch<React.SetStateAction<boolean>>;
}

const UsernameEdit: React.FC<UsernameEditProps> = ({ email, close }) => {
  const [error, setError] = useState<string | null>(null);
 
  const resetForm = () => {
		close(false);
    document.body.style.overflow = "auto";
	}

  async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const target = e.target as HTMLFormElement;
    const newUsernameTarget = target?.elements.namedItem("username") as HTMLInputElement;
    const newUsername = newUsernameTarget.value;


    const tests = await verifyUsername(newUsername);
    if (tests === true) {
      try {
        const response = await fetch(`/api/username`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({email: email, data: newUsername}),
        });
        if (!response.ok) {
          throw new Error("HTTP error! status: " + response.status);
        }
        location.reload();
      } catch (error) {
        console.log(
          "There was a problem with the fetch operation: ", error
        );
        }
    } else {
      setError(tests);
    }
  }

  return (
    <div className={`h-screen w-screen bg-black bg-opacity-70 z-50 fixed top-0 left-0 flex justify-center items-center font-Spacegrotesc`}>
      <div className='h-fit max-w-[720px] w-full bg-mywhite mx-3 p-4 sm:p-8'>
        <h1 className='text-center font-bold text-3xl'>Modifică porecla ta</h1>
        <p className='text-center'>Porecla va apărea în spațiul online. Îți sugerăm <span className='font-bold'>să nu-ți folosești numele real.</span></p>
        <form id="edit" onSubmit={handleSubmit} className='flex-col flex gap-4 mt-2 relative'>
          <input className={`${error ? 'myred' : ''} text-2xl px-4 py-2 w-full outline-none border-mygray border-2 rounded-sm`} title="fără simboluri speciale și maxim 28" type="text" name="username" id="username" placeholder='Porecla nouă' />
          <p className='text-red-500 text-sm -translate-y-3'>{error}</p>
        </form>
        <div className="w-full flex flex-row justify-end mt-6 gap-6 relative z-10">
          <button className={`flex items-center justify-center gap-2 hover:bg-myhoverorange font-Spacegrotesc relative w-fit h-fit border-2 border-mygray font-bold rounded-sm rounded-br-none text-mywhite bg-myorange px-4 py-2 mydropshadow`} form="edit" type="submit">Confirmă</button>
				  <button className={`hover:text-myhovergray w-fit text-mygray h-fit px-4 py-2 font-bold text-nowrap relative font-Spacegrotesc rounded-sm bg-mywhite rounded-br-none border-2 border-mygray mydropshadow`} onClick={resetForm}>M-am răzgândit</button>
			</div>
      </div>
    </div>
  )
}

export default UsernameEdit