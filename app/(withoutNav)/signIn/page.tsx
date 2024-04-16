'use client'
import Link from "next/link";
import GoogleButton from "../../shared/GoogleButton";
import { Suspense, useState } from "react";
import FacebookButton from "@/app/shared/FacebookButton";

const Signin = () => {
  const [accepted, setAccepted] = useState(false);

  const handleCheckboxChange = () => {
    setAccepted(!accepted);
  };

  return (
    <Suspense>
    <div className="w-screen h-screen flex items-center justify-center flex-col font-Unbounded">
      <Link href={"/"} id="logo" className="absolute top-8 left-24 flex flex-col text-base font-Unbounded font-bold">
          <p className='text-myorange'>Dex</p>
          <p className="">Urban.ro</p>
      </Link>
      <div className="bg-transparent p-6 rounded-lg flex items-center justify-center flex-col">
        <h1 className="text-mygraytext-4xl mb-4 text-center">Conectează-te la<br/><span className="text-myorange">Dex</span>Urban</h1>
        <p className="font-Spacegrotes text-center mb-12">Definițiile scrise în UrbanDex.ro au fost create de indivizi<br/> obișnuiți, asemenea ție.</p>
        <GoogleButton accepted={accepted} />
        <FacebookButton accepted={accepted} />
        <div className="flex items-center justify-center mt-12 gap-2">
          <label className="confirm border border-mygray font-Spacegrotesc">
            <input type="checkbox" name="confirm" id="confirm" onClick={handleCheckboxChange} className="" />
            <svg className="checkmark bg-mywhite" width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.41 4.58008L0 6.00008L4 10.0001L12 2.00008L10.59 0.580078L4 7.17008L1.41 4.58008Z" fill="#E86842"/>
            </svg>
          </label>
          <p className="">Am citit și sunt de acord cu <Link href={"#"} className="text-myorange hover:text-myhoverorange transition-all">Termenii și Condiții</Link> și <Link href={"#"} className="text-myorange hover:text-myhoverorange transition-all">Politică de Confidențialitate</Link></p>
        </div>
      </div>
    </div>
    </Suspense>
  )
}

export default Signin