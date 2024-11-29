'use client';
import { navigate, verifyCaptcha } from '@/app/api/ServerActions';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { FormEvent, useEffect, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const Report = () => {
  const { data: session, status } = useSession();
  const [captcha, setCaptcha] = useState<string | null>();
  const [id, setId] = useState<string | null>(null);
  const [text, setText] = useState<string>("Verificăm");
  
  useEffect(() => {
    const hasReloaded = sessionStorage.getItem('hasReloaded');
    if (!hasReloaded) {
      sessionStorage.setItem('hasReloaded', 'true');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramId = searchParams.get('id');
    setId(paramId);
    if (paramId == null) {
      navigate();
    }
  }, []);

  const resetForm = () => {
    const form = document.getElementById('report') as HTMLFormElement | null;
    if (form) {
      form.reset();
    }
    grecaptcha.reset();
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (captcha) {
      try {
        if (await verifyCaptcha(captcha)) {
          handleSubmit(e);
        }
      } catch (error) {
        console.error('Error verifying captcha:', error);
      }
    } else {
      console.log('ReCAPTCHA not verified');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const checkedValue = (
      target.querySelector('input[name="reason"]:checked') as HTMLInputElement
    )?.value;
    const optional = target?.elements.namedItem('additional') as HTMLInputElement;
    const date = new Date();

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    };

    const data = {
      wordId: id,
      reason: checkedValue,
      optional: optional.value,
      userEmail: session?.user?.email,
      date: date.toLocaleString('ro-RO', options),
    };

    if (checkedValue == undefined) {
      alert('Așa nu merge');
    } else {
      try {
        const response = await fetch('/api/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('HTTP error! status: ' + response.status);
        }
      } catch (error) {
        console.log('There was a problem with the fetch operation: ', error);
      }
      navigate();
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setText((prevText) => prevText + ".");
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (status === 'loading' || status === 'unauthenticated') {
    return <div className='flex w-full text-4xl h-screen justify-center items-center'>{text}</div>
  }

  return (
    <div className='flex flex-col justify-center w-full items-center my-20 md:my-0 h-fit md:h-screen px-3'>
      <Link href={"/"} id="logo" className="absolute top-8 left-3 md:left-24 flex flex-col text-base font-Unbounded font-bold">
          <p className='text-myorange hidden sm:block'>Dex</p>
          <p className="hidden sm:block">Urban.md</p>
          <svg className="sm:hidden size-8" width="0" height="0" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.9998 11V8.33333L5.99984 8.33333L5.99984 5.66667H3.33317L3.33317 8.33333H0.666504L0.666504 11H3.33317L3.33317 13.6667H5.99984V11L21.9998 11ZM8.6665 16.3333H5.99984L5.99984 13.6667H8.6665V16.3333ZM8.6665 16.3333H11.3332V19H8.6665V16.3333ZM8.6665 3L5.99984 3V5.66667L8.6665 5.66667V3ZM8.6665 3H11.3332V0.333334H8.6665V3Z" fill="#202020"/>
          </svg>
      </Link>
      <h1 className='text-3xl lg:text-5xl text-center font-medium mb-6 mt-3'>Raportează această definiție</h1>
      <h3 className='md:text-lg font-Spacegrotesc mb-12 text-center'>Fii parte din comunitatea DexUrban.md și ajută-ne să facem platforma mai sigură.</h3>
      <form id='report' onSubmit={onSubmit} className='font-Spacegrotesc w-full md:w-fit border-2 border-mygray p-3 md:p-8 bg-mywhite relative rounded-sm mybigdropshadow'>
        <h2 className='text-2xl md:text-3xl font-bold text-center mb-8'>De ce acestă definiție trebuie eliminată?</h2>
        <input type="radio" name="reason" id="joke" value="Definiția este o glumă locală, între un grup de prieteni" />
        <label htmlFor="joke" className='ml-4 md:text-lg'>Definiția este o glumă locală, între un grup de prieteni</label><br />
        <div className='h-4'></div>
        <input type="radio" name="reason" id="personal" value="Definiția include informații personale despre o persoană" />
        <label htmlFor="personal" className='ml-4 md:text-lg'>Definiția include informații personale despre o persoană</label><br />
        <div className='h-4'></div>
        <input type="radio" name="reason" id="bully" value="Definiția conține hărțuire verbală, discriminare sau abuz" />
        <label htmlFor="bully" className='ml-4 md:text-lg'>Definiția conține hărțuire verbală, discriminare sau abuz</label><br />
        <div className='h-4'></div>
        <input type="radio" name="reason" required id="other" value="Altele" />
        <label htmlFor="other" className='ml-4 md:text-lg'>Altele</label><br />
        <textarea placeholder='Introdu informație adițională' name="additional" rows={4} className='p-2 rounded-sm mt-8 mb-6 resize-none outline-none w-full border-2 border-mygray'></textarea>
        <ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!} onChange={setCaptcha} className="flex justify-center scale-90 im:scale-100" />
      </form>
      <div className="w-full md:w-[653px] flex md:flex-row flex-col mt-6 gap-6">
        <button className={`flex items-center justify-center gap-2 hover:bg-myhoverorange font-Spacegrotesc relative w-full h-fit text-2xl border-2 border-mygray font-bold rounded-sm rounded-br-none text-mywhite bg-myorange py-2 mybigdropshadow`} form="report" type="submit">Raportează cuvântul
					<svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M-2.62268e-07 6L-3.49691e-07 8L12 8L12 10L14 10L14 8L16 8L16 6L14 6L14 4L12 4L12 6L-2.62268e-07 6ZM10 2L12 2L12 4L10 4L10 2ZM10 2L8 2L8 -3.49691e-07L10 -2.62268e-07L10 2ZM10 12L12 12L12 10L10 10L10 12ZM10 12L8 12L8 14L10 14L10 12Z" fill="#F1F1F1"/>
					</svg>
				</button>
				<button className={`hover:text-myhovergray w-full md:w-fit text-mygray px-6 text-2xl h-fit py-2 font-bold text-nowrap relative font-Spacegrotesc rounded-sm bg-mywhite rounded-br-none border-2 border-mygray mybigdropshadow`} onClick={resetForm}>M-am răzgândit</button>
			</div>
    </div>
  );
};

export default Report;
