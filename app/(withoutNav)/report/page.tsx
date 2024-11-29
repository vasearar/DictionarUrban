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
      window.location.reload();
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
      {/* Your JSX structure */}
    </div>
  );
};

export default Report;
