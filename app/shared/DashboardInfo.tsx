'use client'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import UsernameEdit from './UsernameEdit'

const DashboardInfo = () => {
  const Session = useSession();
  const email = Session?.data?.user?.email;
  const [username, setUsername] = useState("Obținem numele...");
  const [date, setDate] = useState("[Obținem data înregistrării...]");
  const [showUsernameEdit, setShowUsernameEdit] = useState(false);
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
        setDate(data.date);
      };
		} catch (error) {
			console.log(
				"There was a problem with the fetch operation: ", error
			);
		}
  }

  useEffect(() => {
    if(email){
      getUsername();
    }
  }, [email]);

  function displayEdit(email: string){
    setShowUsernameEdit(!showUsernameEdit);
    if(!showUsernameEdit){
      document.body.style.overflow = "hidden";
    }
    setData(email);
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
    } catch (error) {
      console.error('Deleting data error:', error);
      return [];
    }
  }

  return (
    <>
      {showUsernameEdit && <UsernameEdit email={data} close={setShowUsernameEdit} />}
      <div className='w-full flex justify-between my-12 font-Spacegrotesc'>
        <div className='mx-auto flex justify-between w-[71%]'>
          <div className=''>
            <h1 className='font-bold text-5xl font-Spacegrotesc'>{username}</h1>
            <h6 className='text-zinc-500'>Înregistrat la data {date}</h6>
          </div>
          <div>
            <div className='flex'>
              <button className='border-2 flex items-center gap-2 relative px-4 tracking-wide h-fit py-2 text-white font-bold border-mygray transition-all bg-myorange hover:bg-myhoverorange mydropshadow' onClick={() => displayEdit(email!)}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 0H15V1H16V2H17V3H18V4H17V5H16V6H15V5H14V4H13V3H12V2H13V1H14M10 4H12V5H13V6H14V8H13V9H12V10H11V11H10V12H9V13H8V14H7V15H6V16H5V17H4V18H0V14H1V13H2V12H3V11H4V10H5V9H6V8H7V7H8V6H9V5H10" fill="#F1F1F1"/>
                </svg>
                Modifică
              </button>
              <button className='ml-6 flex items-center gap-2 border-2 relative px-4 tracking-wide h-fit py-2 text-white font-bold border-mygray transition-all bg-myorange hover:bg-myhoverorange mydropshadow' onClick={() =>signOut({ callbackUrl: "/" })}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 0H18V4H16V2H2V16H16V14H18V18H0V0H2ZM18 8H16V6H14V4H12V6H14V8H4V10H14V12H12V14H14V12H16V10H18V8Z" fill="#F1F1F1"/>
                </svg>
                Deconectează-te
              </button>
            </div>
            <button className='mt-5 ml-auto flex items-center gap-2 border-2 relative px-4 tracking-wide h-fit py-2 text-white bg-red-600 transition-all hover:bg-red-400 font-bold border-mygray mydropshadow' onClick={() => confirmFunction()}>
                Șterge cont
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardInfo