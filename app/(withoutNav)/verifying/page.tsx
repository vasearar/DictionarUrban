'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react';
import { navigate } from '@/app/api/ServerActions';
import { useRouter } from 'next/navigation';

const Page = () => {
  const session = useSession();
  const router = useRouter();
  const [word, setWord] = useState<string>("...");

  const words = ["Analizăm", "Verificăm", "Amuș, amuș", "Încă un pic", "Dă-mi 5 secunde pls"];

  function setRandomWord(){
    let randX = Math.floor(Math.random() * 5);
    setWord(words[randX]);
  }

  useEffect(() => {
    setRandomWord();

    const interval = setInterval(() => {
      setWord(prevWord => prevWord + ".");
    }, 1500);

    return () => clearInterval(interval);
  }, []);

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
      } else {
        router.push('/username');
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

  return (
    <div className='w-screen h-screen relative flex justify-center items-center'>
      <h1 className='fon text-5xl'>{word}</h1>
    </div>
  )
}

export default Page