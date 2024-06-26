'use client'

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import React from 'react'

const FacebookButton = (props: { accepted: boolean }) => {
  //TODO: transmit callback la user si apoi il folosesc 
  // searchParams.get("callbackUrl")
  const searchParams = useSearchParams();
  const callbackUrl = "/verifying";
  let useraccept = props.accepted;
  return (
    <button className="mydropshadow mt-6 w-full max-w-[367px] outline-none justify-center text-nowrap relative md:hover:bg-myhoverorange transition-all bg-mywhite text-mygray font-bold rounded-sm border-mygray flex gap-4 text-xl md:text-2xl font-Spacegrotesc items-center py-2 border-2"
            onClick={() => {
              if(useraccept){
                signIn('facebook', {callbackUrl})
              } else {
                return;
              }}}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 16C32 7.1635 24.8365 0 16 0C7.1635 0 0 7.1635 0 16C0 23.986 5.851 30.6054 13.5 31.8056V20.625H9.4375V16H13.5V12.475C13.5 8.465 15.8888 6.25 19.5435 6.25C21.294 6.25 23.125 6.5625 23.125 6.5625V10.5H21.1075C19.1199 10.5 18.5 11.7334 18.5 12.9987V16H22.9375L22.2281 20.625H18.5V31.8056C26.149 30.6054 32 23.9861 32 16Z" fill="#1877F2"/>
        <path d="M22.2281 20.625L22.9375 16H18.5V12.9987C18.5 11.7332 19.1199 10.5 21.1075 10.5H23.125V6.5625C23.125 6.5625 21.294 6.25 19.5434 6.25C15.8888 6.25 13.5 8.465 13.5 12.475V16H9.4375V20.625H13.5V31.8056C14.327 31.9352 15.1629 32.0002 16 32C16.8371 32.0002 17.673 31.9353 18.5 31.8056V20.625H22.2281Z" fill="#F1F1F1"/>
      </svg>
      Sign in with Facebook
    </button>
  )
}

export default FacebookButton