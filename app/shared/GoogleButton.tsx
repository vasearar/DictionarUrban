'use client'

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

const GoogleButton = (props: { accepted: boolean }) => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  let useraccept = props.accepted;
  return (
    <button className="mydropshadow relative bg-mywhite text-mygray font-bold rounded-sm border-mygray flex gap-4 text-2xl font-Spacegrotesc items-center px-12 py-2 border-2"
            onClick={() => {
              if(useraccept){
                signIn('google', {callbackUrl})
              } else {
                return;
              }}}>
      <img className="size-8" src="GoogleLogo.webp" alt="google" />Sign in with Google
    </button>
  )
}

export default GoogleButton