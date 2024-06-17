'use client'

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

interface GoogleButtonProps{
  accepted: boolean;
  setShouldAnimate: React.Dispatch<React.SetStateAction<boolean>>;
}

const GoogleButton:React.FC<GoogleButtonProps> = ({accepted, setShouldAnimate}) => {
  const searchParams = useSearchParams();
  //TODO: transmit callback la user si apoi il folosesc 
  // searchParams.get("callbackUrl")
  const callbackUrl = "/verifying";
  let useraccept = accepted;

  return (
    <button className="mydropshadow relative justify-center outline-none w-full max-w-[367px] md:hover:bg-myhoverorange transition-all bg-mywhite text-mygray font-bold rounded-sm border-mygray flex gap-4 text-xl md:text-2xl font-Spacegrotesc items-center py-2 border-2"
            onClick={() => {
              if(useraccept){
                signIn('google', {callbackUrl})
              } else {
                setShouldAnimate(true);
                return;
              }}}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M27.074 11.3887H26V11.3334H14V16.6667H21.5353C20.436 19.7714 17.482 22.0001 14 22.0001C9.58196 22.0001 5.99996 18.4181 5.99996 14.0001C5.99996 9.58208 9.58196 6.00008 14 6.00008C16.0393 6.00008 17.8946 6.76941 19.3073 8.02608L23.0786 4.25475C20.6973 2.03541 17.512 0.666748 14 0.666748C6.63663 0.666748 0.666626 6.63675 0.666626 14.0001C0.666626 21.3634 6.63663 27.3334 14 27.3334C21.3633 27.3334 27.3333 21.3634 27.3333 14.0001C27.3333 13.1061 27.2413 12.2334 27.074 11.3887Z" fill="#FFC107"/>
        <path d="M2.20398 7.79408L6.58465 11.0067C7.76998 8.07208 10.6406 6.00008 14 6.00008C16.0393 6.00008 17.8946 6.76941 19.3073 8.02608L23.0786 4.25475C20.6973 2.03541 17.512 0.666748 14 0.666748C8.87865 0.666748 4.43731 3.55808 2.20398 7.79408Z" fill="#FF3D00"/>
        <path d="M14 27.3333C17.444 27.3333 20.5733 26.0153 22.9393 23.872L18.8127 20.38C17.429 21.4322 15.7383 22.0013 14 22C10.532 22 7.58734 19.7886 6.478 16.7026L2.13 20.0526C4.33667 24.3706 8.81801 27.3333 14 27.3333Z" fill="#4CAF50"/>
        <path d="M27.074 11.3886H26V11.3333H14V16.6666H21.5353C21.0095 18.1442 20.0622 19.4354 18.8107 20.3806L18.8127 20.3793L22.9393 23.8713C22.6473 24.1366 27.3333 20.6666 27.3333 13.9999C27.3333 13.1059 27.2413 12.2333 27.074 11.3886Z" fill="#1976D2"/>
      </svg>
      Sign in with Google
    </button>

  )
}

export default GoogleButton