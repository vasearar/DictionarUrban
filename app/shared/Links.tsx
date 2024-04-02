'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Links = () => {
  const session = useSession();
  console.log(session);
  return (
    <ul>
      {session?.data && (<li><Link href="/exemplu">Exemplu</Link></li>)}
      {session?.data ? <li><Link href="#" onClick={() => signOut({ callbackUrl: "/" })}>Ieșiți</Link></li> : <li><Link href="/signIn">Conectați-vă</Link></li>}
    </ul>
  )
}

export default Links