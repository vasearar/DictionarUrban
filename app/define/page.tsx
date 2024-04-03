'use client';
import React, { FormEvent, useState } from "react"
import { useSession } from "next-auth/react";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { verifyCaptcha } from "../api/ServerActions";

const page = () => {
	const session = useSession();
  const [isMessageSent, setMessageSent] = useState(false);
	const [captcha, setCaptcha] = useState<string | null>();

	async function onSubmit(e: FormEvent){
		e.preventDefault();
		if (captcha){
			try{
				if(await verifyCaptcha(captcha)){
					handleSubmit(e);
				}
			} catch (error){
				console.error("Error verifying captcha:", error);
			}
	} else {
			console.log("ReCAPTCHA not verified");
	}
	}
	
	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();	
		const target = e.target as HTMLFormElement;
		const word = target?.elements.namedItem("word") as HTMLInputElement;
		const definition = target?.elements.namedItem("definition") as HTMLInputElement;
		const exampleOfUsing = target?.elements.namedItem("exampleOfUsing") as HTMLInputElement;

		const date = new Date();

    interface CustomDateTimeFormatOptions extends Intl.DateTimeFormatOptions {
      locale?: string;
    }
    
		const options : CustomDateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC', locale: 'ro' };

		const data = {
			word: word?.value.toLowerCase(),
			definition: definition.value,
			exampleOfUsing: exampleOfUsing.value,
			username: session?.data?.user?.name,
			userEmail: session?.data?.user?.email,
			likes: 0,
			date: date.toLocaleString('ro-RO', options),
		};

		// console.log(data);
		
		try {
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				throw new Error("HTTP error! status: " + response.status);
			}
			setMessageSent(true);
		} catch (error) {
			console.log(
				"There was a problem with the fetch operation: ", error
			);
		}
		document.querySelector("form")?.reset();
		grecaptcha.reset();
	}

  return (
		<>
    <div className='flex justify-center relative items-center h-screen text-white flex-col'>
      <h1 className='text-4xl mb-16'>Șansa ta de a adăuga un cuvânt sau expresie în dicționar</h1>
      <form onSubmit={onSubmit} className='rounded-lg bg-neutral-600 max-w-[806px] relative h-fit px-7 py-6 shadow-lg'>
        <p>*Distribuiți definiții pe care alte persoane le vor găsi folositoare și nu postați niciodată texte înjositoare sau informații personale ale oamenilor.</p>
        <input className='outline-none bg-transparent text-2xl mt-6 mb-2 border-2 rounded-lg p-2 w-full' maxLength={35} type='text' name='word' id="word" required placeholder='Cuvântul sau expresia' />
        <p className='text-xs'>*scrie pentru o auditorie largă</p>
        <textarea className='bg-transparent w-full outline-none border-2 rounded-lg p-2 mt-2 h-36 resize-none' maxLength={450} name="definition" id="definition" required placeholder='Scrie aici definiția ta...'></textarea>
        <textarea className='bg-transparent w-full outline-none border-2 rounded-lg p-2 my-4 h-[4.3rem] resize-none' maxLength={200} name='exampleOfUsing' id="exampleOfUsing" required placeholder='Scrie un exemplu cum se folosește într-un enunț'></textarea>
				<ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!} onChange={setCaptcha} className="flex justify-center" />
        <button className='w-full h-fit bg-green-400 text-2xl font-semibold text-black py-2 rounded-lg mt-4 hover:bg-green-500' type="submit">Adaugă</button>
				<Link href="/"><svg className="brightness-200 absolute -bottom-11 left-0" xmlns="http://www.w3.org/2000/svg" width="34" height="30" viewBox="0 0 34 30" fill="none">
  				<path d="M2.41663 15L14.9166 2.5M2.41663 15L14.9166 27.5M2.41663 15L31.5833 15" stroke="white" strokeWidth="4.16667" strokeLinecap="round" strokeLinejoin="round"/>
				</svg></Link>
      </form>
    </div>
		</>
  )
}

export default page