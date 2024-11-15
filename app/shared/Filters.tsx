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
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [popularity])

  return (
    <div
      onClick={handleClick}
      className={`${
        popularity > 1 ? 'text-myorange' : 'text-black'
      } mb-4 pl-3 md:pl-0 mx-auto text-left w-[720px] transition-all font-Spacegrotesc font-bold md:text-xl flex items-center cursor-pointer relative select-none`}
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
    </div>
  );
};

export default Filters;
