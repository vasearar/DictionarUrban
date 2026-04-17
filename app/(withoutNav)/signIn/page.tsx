'use client'
import Link from "next/link";
import GoogleButton from "../../shared/GoogleButton";
import { Suspense, useState } from "react";
import AnonymButton from "@/app/shared/AnonymButton";
import CredentialsForm from "@/app/shared/CredentialsForm";

const Signin = () => {
  const [accepted, setAccepted] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const handleCheckboxChange = () => {
    setAccepted(!accepted);
  };

  return (
    <Suspense>
    <div className="w-screen min-h-screen md:h-screen md:min-h-0 md:overflow-hidden flex items-center justify-center flex-col font-Unbounded py-20 md:py-0">
      <Link href={"/"} id="logo" className="absolute top-8 left-10 md:left-24 flex flex-col text-base font-Unbounded font-bold">
          <p className='text-myorange hidden sm:block'>Dex</p>
          <p className="hidden sm:block">Urban.md</p>
          <svg className="sm:hidden size-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_344_737)">
              <rect x="0.25" y="0.25" width="31.5" height="31.5" rx="15.75" fill="#202020" stroke="#F1F1F1" strokeWidth="0.5"/>
              <path d="M8.72 11C9.16333 11 9.55167 11.0783 9.885 11.235C10.2217 11.3883 10.4817 11.6067 10.665 11.89C10.8517 12.17 10.945 12.4983 10.945 12.875C10.945 13.2517 10.8517 13.5817 10.665 13.865C10.4817 14.145 10.2217 14.3633 9.885 14.52C9.55167 14.6733 9.16333 14.75 8.72 14.75H6.85V11H8.72Z" fill="#E86842"/>
              <path d="M7.835 19.075C7.835 19.245 7.86667 19.3933 7.93 19.52C7.99667 19.6433 8.09333 19.7383 8.22 19.805C8.35 19.8717 8.50833 19.905 8.695 19.905C8.885 19.905 9.04333 19.8717 9.17 19.805C9.29667 19.7383 9.39167 19.6433 9.455 19.52C9.51833 19.3933 9.55 19.245 9.55 19.075V17H10.59V19.125C10.59 19.4683 10.51 19.7683 10.35 20.025C10.1933 20.2783 9.97333 20.4767 9.69 20.62C9.40667 20.76 9.075 20.83 8.695 20.83C8.31833 20.83 7.98667 20.76 7.7 20.62C7.41667 20.4767 7.195 20.2783 7.035 20.025C6.87833 19.7683 6.8 19.4683 6.8 19.125V17H7.835V19.075Z" fill="#F1F1F1"/>
            </g>
          </svg>
      </Link>
      <div className="bg-transparent p-3 md:p-6 rounded-lg mt-10 flex items-center justify-center flex-col">
        <h1 className="text-mygray text-3xl md:text-4xl mb-4 text-center">Conectează-te la<br/><span className="text-myorange">Dex</span>Urban</h1>
        <p className="font-Spacegrotes text-sm md:text-base text-center mb-12">Definițiile scrise în UrbanDex.md au fost create de indivizi<br/> obișnuiți, asemenea ție.</p>
        <CredentialsForm accepted={accepted} setShouldAnimate={setShouldAnimate} />

        <div className="w-full max-w-[367px] flex items-center gap-4 my-8">
          <div className="flex-1 h-[2px] bg-mygray"></div>
          <span className="font-Spacegrotesc text-sm text-mygray">sau</span>
          <div className="flex-1 h-[2px] bg-mygray"></div>
        </div>

        <GoogleButton accepted={accepted} setShouldAnimate={setShouldAnimate} />
        <AnonymButton accepted={accepted} setShouldAnimate={setShouldAnimate} />

        <div className={`${shouldAnimate && "shake"} flex items-center max-w-[367px] md:max-w-fit justify-center mt-12 gap-2`}>
          <label className="confirm border border-mygray font-Spacegrotesc">
            <input type="checkbox" name="confirm" id="confirm" onClick={handleCheckboxChange} className="" />
            <svg className="checkmark bg-mywhite" width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.41 4.58008L0 6.00008L4 10.0001L12 2.00008L10.59 0.580078L4 7.17008L1.41 4.58008Z" fill="#E86842"/>
            </svg>
          </label>
          <p className={`${shouldAnimate && "check"} md:text-base text-sm`}>Am citit și sunt de acord cu <Link href={"https://www.dexurban.md/tos"} className="text-myorange md:hover:text-myhoverorange transition-all">Termenii și Condiții</Link> și <Link href={"https://www.dexurban.md/privacy"} className="text-myorange md:hover:text-myhoverorange transition-all">Politică de Confidențialitate</Link></p>
        </div>
      </div>
    </div>
    </Suspense>
  )
}

export default Signin
