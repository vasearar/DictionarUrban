'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const loadingWords = ["Analizăm", "Verificăm", "Amuș, amuș", "Încă un pic", "Dă-mi 5 secunde pls"];

const Page = () => {
  const session = useSession();
  const router = useRouter();
  const [word, setWord] = useState<string>("...");

  useEffect(() => {
    let randX = Math.floor(Math.random() * loadingWords.length);
    setWord(loadingWords[randX]);

    const interval = setInterval(() => {
      setWord(prevWord => prevWord + ".");
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function userExist() {
      if (!session.data?.user?.email) return;

      try {
        const response = await fetch(`/api/contact?email=${encodeURIComponent(session.data.user.email)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status == 200) {
          router.push('/');
        } else {
          router.push('/username');
        };
      } catch (error) {
        console.log(
          "There was a problem with the fetch operation: ", error
        );
      }
    }

    if (session.status === "authenticated") {
      userExist();
    }
  }, [router, session.data?.user?.email, session.status]);

  return (
    <div className='w-screen h-screen relative flex justify-center items-center'>
      <h1 className='fon text-5xl'>{word}</h1>
    </div>
  )
}

export default Page
