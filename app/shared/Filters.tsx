'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

const Filters = () => {
  const [popularity, setPopularity] = useState(1);
  const [isFirstRender, setIsFirstRender] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()

  function handleClick() {
    if (popularity >= 3) {
      setPopularity(1);
    } else {
      setPopularity(popularity + 1);
    }
  }

  useEffect(() => {
    if (isFirstRender == 0){
      setIsFirstRender(1);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set('popularity', popularity.toString());
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [popularity])

  return (
    <div className="mb-4 px-3 md:px-0 mx-auto w-full md:w-[720px] font-Spacegrotesc flex items-center justify-between gap-3">
      {/* Doar eticheta e clickabilă (w-fit) — nu tot rândul, ca înainte. */}
      <button
        type="button"
        onClick={handleClick}
        className={`${
          popularity > 1 ? 'text-myorange' : 'text-black'
        } transition-all font-bold md:text-xl flex items-center cursor-pointer select-none w-fit`}
      >
        Popularitate
        <svg
          className={`${
            popularity > 1 ? 'opacity-100' : 'opacity-0'
          } ${popularity === 3 ? 'rotate-180' : 'rotate-0'} transition-all`}
          width="12"
          height="5"
          viewBox="0 0 12 5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 5L11.1962 0.5H0.803848L6 5Z" fill="#E86842" />
        </svg>
      </button>

      {/* Buton „Trage la sorți": ancoră normală → navigare completă care urmează
          redirectul 307 de la /aleator → /cuvant/[slug] random. `relative` e
          obligatoriu ca umbra ::after (mydropshadow) să se raporteze la buton,
          nu la tot viewport-ul. */}
      <a
        href="/aleator"
        className="relative shrink-0 bg-myorange hover:bg-myhoverorange text-mywhite font-bold text-sm md:text-base border-2 border-mygray rounded-sm px-3 py-2 md:px-4 md:py-[0.625rem] mydropshadow transition-colors"
      >
        Trage la sorți un cuvânt
      </a>
    </div>
  );
};

export default Filters;
