'use client'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { use, useEffect, useState } from 'react';

interface ActionProps{
  id: string;
  likes: number;
}


const Actions:React.FC<ActionProps> = ({id, likes}) => {
  const Session = useSession();
  const email = Session?.data?.user?.email;
  const router = useRouter();
  const [isliked, setLiked] = useState(false);
  const [currentLikes, setcurrentLikes] = useState(likes);

  async function checkIfLiked(){
    if (email != undefined){
      try {
      const response = await fetch(`/api/likes?id=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.liked){
        setLiked(true);
      }
      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status);
      }
      return data;
    } catch (error) {
      console.log(
        "There was a problem with the fetch operation: ", error
      );
    }
    }
  }

  useEffect(() => {
    if(email){
      checkIfLiked();
    } else {

    }
  }, [email]);

  async function addLike(){
    if(!email){
      router.push('/conectare');
      return;
    }

    // Reținem starea curentă ca să putem reveni dacă serverul eșuează.
    const prevLiked = isliked;
    const prevLikes = currentLikes;
    const nextLiked = !isliked;

    // 1) Optimistic: randăm instant pe client.
    setLiked(nextLiked);
    setcurrentLikes(prevLikes + (nextLiked ? 1 : -1));

    // 2) În background: serverul e sursa de adevăr (contorul e recalculat acolo).
    try {
      const response = await fetch(`/api/likes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wordid: id, action: nextLiked ? "like" : "unlike" }),
      });
      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status);
      }
      // 3) Reconciliere cu valoarea reală de la server.
      const data = await response.json();
      setLiked(data.liked);
      setcurrentLikes(data.likes);
    } catch (error) {
      // 4) Revert dacă a picat request-ul.
      setLiked(prevLiked);
      setcurrentLikes(prevLikes);
      console.log("There was a problem with the fetch operation: ", error);
    }
  }

  
  return (
    <div className='flex justify-between mt-6'>
      <div className='z-10'>
        <button onClick={() => addLike()} title="Dă like dacă te-ai simțit vizat." className={`${isliked ? "bg-myorange text-mywhite" : "bg-mywhite"} border-2 border-mygray md:hover:bg-myhoverorange rounded-sm py-2 px-5 flex gap-1 items-center relative mydropshadow`}>
          <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 0.5H4.5V2.5H2.5V4.5H0.5V9.5H2.5V11.5H4.5V13.5H6.5V15.5H8.5V17.5H10.5V19.5H11.5V17.5H13.5V15.5H15.5V13.5H17.5V11.5H19.5V9.5H21.5V4.5H19.5V2.5H17.5V0.5H14.5V2.5H12.5V4.5H9.5V2.5H7.5V0.5Z" fill={isliked ? "#F1F1F1" : "#E86842"} stroke={isliked ? "#F1F1F1" : "#E86842"}/>
          </svg>
          <span className={`transition-none font-bold`}>
            {currentLikes}
          </span>
        </button>
      </div>  
      <div className='z-10'>
        <Link href={`/report/?id=${id}`} title="Te-a ofensat?" className='border-2 border-mygray flex bg-mywhite md:hover:bg-myhoverorange relative rounded-sm py-2 px-5 mydropshadow'
        aria-label='report'>        
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.71429 18.8571V17.1429H0V1.71429H1.71429V0H22.2857V1.71429H24V17.1429H22.2857V18.8571H12H10.2857V20.5714H8.57143V22.2857H6.85714V24H5.14286V22.2857V20.5714V18.8571H1.71429Z" fill="#E86842"/>
            <path d="M11 11.5714V3H13V11.5714H11Z" fill="#202020"/>
            <path d="M13 13.2857H11V15H13V13.2857Z" fill="#202020"/>
          </svg>
        </Link> 
      </div>
    </div>
  )
}

export default Actions