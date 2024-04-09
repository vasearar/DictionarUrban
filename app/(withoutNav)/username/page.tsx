'use client'

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
const page = () => {
  const session = useSession();
  return (
    <>
    {session?.data ? 
    <div className='w-screen h-screen flex justify-center items-center'>
      <Link href={"/"} id="logo" className="absolute top-8 left-24 flex flex-col text-base font-Unbounded font-bold">
          <p className='text-myorange'>Dex</p>
          <p>Urban.ro</p>
      </Link>
      <form id='username'>
        <h1 className='font-Unbounded text-5xl'>Care e <span className='text-myorange'>porecla</span> ta?</h1>
        <p className='mt-5 font-Spacegrotesc text-center'>Porecla va apărea în spațiul online.<br /> Îți sugerăm <span className='font-bold'>să nu-ți folosești numele real.</span></p>
        <div className='justify-end flex flex-col mt-7'>
          <label htmlFor="name" className='text-right text-xs text-red-500'>*apoi nu se va putea de schimbat</label>
          <input maxLength={10} id='name' className='bg-mywhite w-full text-2xl max:w-[535px] font-Spacegrotesc rounded-sm py-2 px-4 border-2 border-mygray' type="text" placeholder='Porecla ta' />
        </div>
        <button className='border-2 border-mygray font-Spacegrotesc mt-11 flex items-center justify-center text-mywhite gap-1 text-2xl py-2 rounded-sm w-full max-w-[535px] bg-myorange hover:bg-myhoverorange mybigdropshadow relative'>Continuă
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

export default page