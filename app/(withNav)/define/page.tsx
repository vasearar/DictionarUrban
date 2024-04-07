'use client';
import React, { FormEvent, useState } from "react"
import { useSession } from "next-auth/react";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { verifyCaptcha } from "../../api/ServerActions";

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
    <div className='flex relative items-center text-white flex-col text-center'>
      <h1 className='text-5xl mb-6 text-mygray font-Unbounded text-center'>Ai posibilitatea să contribui la dicționar</h1>
			<h3 className="text-mygray font-Spacegrotesc mb-12">Definițiile în UrbanDex.ro au fost create de indivizi obișnuiți, asemenea ție.</h3>
      <form onSubmit={onSubmit} className='font-Spacegrotesc mydropshadow rounded-[4px] border-mygray border-2 text-mygray bg-mywhite max-w-[720px] relative h-fit px-7 py-6 shadow-lg'>
        <p className="text-left">*Distribuiți definiții pentru cuvinte care ar putea fi utile altor persoane și NU publicați texte înjositoare sau informații personale <span className="font-bold">- acestea vor fi eliminate.</span></p>
        <input className='outline-none bg-transparent text-2xl mt-6 mb-2 border-mygray border-2 rounded-sm p-2 w-full' maxLength={35} type='text' name='word' id="word" required placeholder='Cuvântul sau expresia' />
        <p className='text-left'>*Rețineți că această definiție <span className="font-bold">va fi citită de un public larg </span>- depuneți efort și asigurați-vă că definiția este detaliată.</p>
        <textarea className='bg-transparent text-lg w-full outline-none rounded-sm p-2 mt-2 h-36 resize-none border-mygray border-2' maxLength={450} name="definition" id="definition" required placeholder='Scrie aici explicația ta...'></textarea>
        <textarea className='bg-transparent text-lg w-full outline-none rounded-sm p-2 my-4 h-[4.3rem] resize-none border-mygray border-2' maxLength={200} name='exampleOfUsing' id="exampleOfUsing" required placeholder='Scrie un exemplu cum se folosește într-un enunț...'></textarea>
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