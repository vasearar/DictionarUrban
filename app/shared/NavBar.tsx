'use server'
import React from 'react'
import Links from './Links';


export default async function NavBar() {
  return (
  <>
    <nav className='flex place-items-center'>
      <img src="/Logo.png" alt="logo" />
      <Links />
    </nav>
  </>
  )
}