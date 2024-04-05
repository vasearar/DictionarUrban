'use server'
import React from 'react'
import Links from './Links';
import SearchBar from './SearchBar';


export default async function NavBar() {
  return (
  <>
    <nav className="flex text-base w-screen justify-between relative py-8">
      <div className='flex'>
        <div id="logo" className="flex flex-col text-base font-Unbounded font-bold mr-8">
          <p className='text-myorange'>Dex</p>
          <p>Urban.ro</p>
        </div>
        <SearchBar />
      </div>
      <Links />
    </nav>
  </>
  )
}