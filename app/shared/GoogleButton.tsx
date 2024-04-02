'use client'

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

const GoogleButton = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  return (
    <button onClick={() => signIn('google', {callbackUrl})}>
      Conectează-te cu Google
    </button>
  )
}

export default GoogleButton