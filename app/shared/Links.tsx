'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Links = () => {
  const session = useSession();
  console.log(session);
  return (
    <ul className='ml-5 flex text-white gap-6'>
      <li><Link href="/define">Definește un cuvânt</Link></li>
      {session?.data ? <li><Link href="#" onClick={() => signOut({ callbackUrl: "/" })}>Ieșiți</Link></li> : <li><Link href="/signIn">Conectați-vă</Link></li>}
    </ul>
  )
}

export default Links