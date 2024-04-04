'use server'
import React from 'react'
import Links from './Links';
import SearchBar from './SearchBar';


export default async function NavBar() {
  return (
  <>
    <nav className="flex place-items-center text-base w-screen px- px-[296px] py-8">
      <div id="logo" className="flex flex-col text-base font-Unbounded font-bold">
        <p className='text-myorange'>Dex</p>
        <p>Urban.ro</p>
      </div>
      <SearchBar />
      <Links />
    </nav>
  </>
  )
}