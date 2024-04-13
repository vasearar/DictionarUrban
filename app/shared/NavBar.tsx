'use server'
import React from 'react'
import Links from './Links';
import SearchBar from './SearchBar';
import Link from 'next/link';


export default async function NavBar() {
  return (
  <>
    <nav className="flex text-base w-screen justify-between relative py-7">
      <div className='flex'>
        <Link href={"/"} id="logo" className="flex flex-col text-base font-Unbounded font-bold mr-8">
          <p className='text-myorange'>Dex</p>
          <p className='dark:text-mywhite'>Urban.ro</p>
        </Link>
        <SearchBar />
      </div>
      <Links />
    </nav>
  </>
  )
}