'use client'

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

const GoogleButton = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  return (
    <button className="text-white flex items-center border border-white rounded-full px-3" onClick={() => signIn('google', {callbackUrl})}>
      <img className="size-8" src="GoogleLogo.webp" alt="google" />Conectează-te cu Google
    </button>
  )
}

export default GoogleButton