'use client';
import React, { FormEvent, useRef, useState } from "react"
import { useSession } from "next-auth/react";
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

	const resetForm = () => {
		const form = document.getElementById("define") as HTMLFormElement | null;
		if (form) {
			form.reset();
		}
	}

  return (
		<>
    <div className='flex relative items-center text-white flex-col text-center'>
      <h1 className='text-4xl mt-8 mb-5 text-mygray font-Unbounded text-center'>Ai posibilitatea să contribui la dicționar</h1>
			<h3 className="text-mygray font-Spacegrotesc mb-8">Definițiile în UrbanDex.ro au fost create de indivizi obișnuiți, asemenea ție.</h3>
      <form id="define" onSubmit={onSubmit} className='font-Spacegrotesc text-mygray bg-mywhite max-w-[720px] relative h-fit shadow-lg'>
				<div className="py-6 px-8 rounded-sm rounded-br-none border-mygray border-2 mybigdropshadow">
					<p className="text-left">*Distribuiți definiții pentru cuvinte care ar putea fi utile altor persoane și NU publicați texte înjositoare sau informații personale <span className="font-bold">- acestea vor fi eliminate.</span></p>
					<input className='outline-none bg-transparent text-2xl mt-2 mb-5 border-mygray border-2 rounded-sm p-2 w-full' maxLength={35} type='text' name='word' id="word" required placeholder='Cuvântul sau expresia' />
					<p className='text-left'>*Rețineți că această definiție <span className="font-bold">va fi citită de un public larg </span>- depuneți efort și asigurați-vă că definiția este detaliată.</p>
					<textarea className='bg-transparent text-lg w-full outline-none rounded-sm p-2 mt-2 h-36 resize-none border-mygray border-2' maxLength={450} name="definition" id="definition" required placeholder='Scrie aici explicația ta...'></textarea>
					<textarea className='bg-transparent text-lg w-full outline-none rounded-sm p-2 mt-3 h-[4.3rem] resize-none border-mygray border-2' maxLength={200} name='exampleOfUsing' id="exampleOfUsing" required placeholder='Scrie un exemplu cum se folosește într-un enunț...'></textarea>
					<ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!} onChange={setCaptcha} className="flex justify-center" />
				</div>
      </form>
			<div className="w-[724px] flex mt-6 gap-6">
        <button className='flex items-center justify-center gap-2 hover:bg-myhoverorange font-Spacegrotesc relative w-full h-fit text-2xl border-2 border-mygray font-bold rounded-sm rounded-br-none text-mywhite bg-myorange py-2 mybigdropshadow' form="define" type="submit">Adaugă<svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M-2.62268e-07 6L-3.49691e-07 8L12 8L12 10L14 10L14 8L16 8L16 6L14 6L14 4L12 4L12 6L-2.62268e-07 6ZM10 2L12 2L12 4L10 4L10 2ZM10 2L8 2L8 -3.49691e-07L10 -2.62268e-07L10 2ZM10 12L12 12L12 10L10 10L10 12ZM10 12L8 12L8 14L10 14L10 12Z" fill="#F1F1F1"/>
					</svg>
				</button>
				<button className="hover:text-myhovergray text-mygray px-6 text-2xl h-fit py-2 font-bold text-nowrap relative font-Spacegrotesc rounded-sm bg-mywhite rounded-br-none border-2 border-mygray mybigdropshadow" onClick={resetForm}>M-am răzgândit</button>
			</div>
    </div>
		</>
  )
}

export default page