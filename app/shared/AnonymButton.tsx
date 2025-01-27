'use client'

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

interface AnonymButtonProps{
  accepted: boolean;
  setShouldAnimate: React.Dispatch<React.SetStateAction<boolean>>;
}

const AnonymButton:React.FC<AnonymButtonProps> = ({accepted, setShouldAnimate}) => {
  const searchParams = useSearchParams();
  //TODO: transmit callback la user si apoi il folosesc 
  // searchParams.get("callbackUrl")
  const callbackUrl = "/verifying";
  let useraccept = accepted;

  return (
    <button title="Fără email vei pierde contul" className="mydropshadow mt-4 relative justify-center outline-none w-full max-w-[367px] md:hover:bg-myhoverorange transition-all bg-mywhite text-mygray font-bold rounded-sm border-mygray flex gap-4 text-xl md:text-2xl font-Spacegrotesc items-center py-2 border-2"
            onClick={() => {
              if(useraccept){
                signIn('anonym', { callbackUrl: "/verifying" })
              } else {
                setShouldAnimate(true);
                return;
              }}}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_1292_2)">
        <path d="M21 2.7998H7L5.6 11.1998H22.4L21 2.7998ZM0 13.9998C0 13.9998 2.8 15.3998 14 15.3998C25.2 15.3998 28 13.9998 28 13.9998L22.4 11.1998H5.6L0 13.9998ZM11.2 19.5998H16.8V20.9998H11.2V19.5998Z" fill="black"/>
        <path d="M8.39922 25.1998C10.7188 25.1998 12.5992 23.3194 12.5992 20.9998C12.5992 18.6802 10.7188 16.7998 8.39922 16.7998C6.07962 16.7998 4.19922 18.6802 4.19922 20.9998C4.19922 23.3194 6.07962 25.1998 8.39922 25.1998Z" fill="black"/>
        <path d="M19.5984 25.1998C21.918 25.1998 23.7984 23.3194 23.7984 20.9998C23.7984 18.6802 21.918 16.7998 19.5984 16.7998C17.2788 16.7998 15.3984 18.6802 15.3984 20.9998C15.3984 23.3194 17.2788 25.1998 19.5984 25.1998Z" fill="black"/>
        </g>
        <defs>
        <clipPath id="clip0_1292_2">
        <rect width="28" height="28" fill="white"/>
        </clipPath>
        </defs>
      </svg>      
      Sign in as Musafir
    </button>

  )
}

export default AnonymButton