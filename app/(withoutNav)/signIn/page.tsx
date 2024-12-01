'use client'
import Link from "next/link";
import GoogleButton from "../../shared/GoogleButton";
import { Suspense, useState } from "react";
import FacebookButton from "@/app/shared/FacebookButton";

const Signin = () => {
  const [accepted, setAccepted] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const handleCheckboxChange = () => {
    setAccepted(!accepted);
  };

  function detectBrowser() {
    let userAgent = navigator.userAgent;
      if (userAgent.indexOf("Instagram") > -1){
        return false;
      } else {
        return true;
      };
  }

  if (detectBrowser()){    
    return (
      <Suspense>
      <div className="w-screen h-screen flex items-center justify-center flex-col font-Unbounded">
        <Link href={"/"} id="logo" className="absolute top-8 left-10 md:left-24 flex flex-col text-base font-Unbounded font-bold">
            <p className='text-myorange hidden sm:block'>Dex</p>
            <p className="hidden sm:block">Urban.md</p>
            <svg className="sm:hidden size-8" width="0" height="0" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.9998 11V8.33333L5.99984 8.33333L5.99984 5.66667H3.33317L3.33317 8.33333H0.666504L0.666504 11H3.33317L3.33317 13.6667H5.99984V11L21.9998 11ZM8.6665 16.3333H5.99984L5.99984 13.6667H8.6665V16.3333ZM8.6665 16.3333H11.3332V19H8.6665V16.3333ZM8.6665 3L5.99984 3V5.66667L8.6665 5.66667V3ZM8.6665 3H11.3332V0.333334H8.6665V3Z" fill="#202020"/>
            </svg>
        </Link>
        <div className="bg-transparent p-3 md:p-6 rounded-lg mt-10 flex items-center justify-center flex-col">
          <h1 className="text-mygray text-3xl md:text-4xl mb-4 text-center">Conectează-te la<br/><span className="text-myorange">Dex</span>Urban</h1>
          <p className="font-Spacegrotes text-sm md:text-base text-center mb-12">Definițiile scrise în UrbanDex.md au fost create de indivizi<br/> obișnuiți, asemenea ție.</p>
          <GoogleButton accepted={accepted} setShouldAnimate={setShouldAnimate} />
          <FacebookButton accepted={accepted} />
          <div className={`${shouldAnimate && "shake"} flex items-center max-w-[367px] md:max-w-fit justify-center mt-12 gap-2`}>
            <label className="confirm border border-mygray font-Spacegrotesc">
              <input type="checkbox" name="confirm" id="confirm" onClick={handleCheckboxChange} className="" />
              <svg className="checkmark bg-mywhite" width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.41 4.58008L0 6.00008L4 10.0001L12 2.00008L10.59 0.580078L4 7.17008L1.41 4.58008Z" fill="#E86842"/>
              </svg>
            </label>
            <p className={`${shouldAnimate && "check"} md:text-base text-sm`}>Am citit și sunt de acord cu <Link href={"#"} className="text-myorange md:hover:text-myhoverorange transition-all">Termenii și Condiții</Link> și <Link href={"#"} className="text-myorange md:hover:text-myhoverorange transition-all">Politică de Confidențialitate</Link></p>
          </div>
        </div>
      </div>
      </Suspense>
    )
  } else {
    return (
      <div className="w-screen h-screen items-center flex flex-col justify-center">
        <p className="border-2 border-mygray mx-4 px-4 py-4 bg-mywhite mydropshadow relative">Folosește alt browser pentru a te conecta &#129402;</p>
        <Link href="/" className='mt-4 border-2 border-mygray bg-mywhite mydropshadow relative size-8 flex items-center justify-center'
          aria-label='Pagina principală'>
          <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 8L16 6L4 6L4 4L2 4L2 6L1.04907e-06 6L7.86805e-07 8L2 8L2 10L4 10L4 8L16 8ZM6 12L4 12L4 10L6 10L6 12ZM6 12L8 12L8 14L6 14L6 12ZM6 2L4 2L4 4L6 4L6 2ZM6 2L8 2L8 -8.58275e-07L6 -1.12054e-06L6 2Z" fill="#202020"/>
          </svg>
        </Link>
      </div>

    )
  }
}

export default Signin