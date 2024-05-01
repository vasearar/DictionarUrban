'use client'
// onClick={() => signOut({ callbackUrl: "/" })}
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <>
     <div className='w-screen h-screen font-Spacegrotesc ml-5'>
      <div className='text-4xl mb-4 font-bold mt-5'>Totul la timpul său</div>
      <Link className='border relative p-2 text-white border-mygray bg-myorange mydropshadow' href="#" onClick={() =>signOut({ callbackUrl: "/" })}>Deconectează-te</Link>
     </div>
     
    </>
   
  )
}

export default page