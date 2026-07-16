'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

// `showRandom`: pe profilul cuiva, „Trage la sorți" n-are ce căuta — te-ar
// arunca la un cuvânt aleator de pe tot site-ul, adică exact în afara listei pe
// care tocmai o citeai. Pe home/căutare rămâne.
const Filters = ({ showRandom = true }: { showRandom?: boolean }) => {
  const [popularity, setPopularity] = useState(1);
  const [isFirstRender, setIsFirstRender] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()

  // Rostogolirea zarului pe touch. Pe desktop e pur CSS (:hover), dar pe telefon
  // nu există hover, iar :active ține doar cât degetul pe ecran — mai puțin
  // decât rostogolirea, deci zarul rămânea înghețat între fețe în timp ce pagina
  // naviga. Clasa pusă la touchstart lasă mișcarea să se termine.
  const [rolling, setRolling] = useState(false);
  const rollTimer = useRef<ReturnType<typeof setTimeout>>();

  function rollDice() {
    setRolling(true);
    clearTimeout(rollTimer.current);
    // De obicei navigăm înainte să expire; contează dacă atingerea n-a fost un
    // tap (ai derulat de pe buton) — atunci zarul se așază la loc, ca la
    // ieșirea din hover pe desktop.
    rollTimer.current = setTimeout(() => setRolling(false), 1200);
  }

  useEffect(() => () => clearTimeout(rollTimer.current), []);

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
          redirectul 307 de la /aleator → /cuvant/[slug] random. Stil SECUNDAR
          (alb + bordură + umbră dură, ca like-ul și „M-am răzgândit") ca să nu
          concureze cu CTA-ul orange „Definește un cuvânt" din hero — un singur
          buton primar pe pagină. `relative` e obligatoriu ca umbra ::after
          (mydropshadow) să se raporteze la buton, nu la tot viewport-ul. */}
      {showRandom && (
      <a
        href="/aleator"
        title="Nu știi ce cauți? Normal. Apasă."
        onTouchStart={rollDice}
        className={`dice-btn ${rolling ? "dice-btn--rolling" : ""} relative shrink-0 flex items-center gap-2 bg-mywhite md:hover:bg-myhoverorange text-mygray font-bold text-sm md:text-base border-2 border-mygray rounded-sm px-3 py-2 md:px-4 md:py-[0.625rem] mydropshadow transition-all`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="dice-icon shrink-0"
        >
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2.5" />
          {/* Două fețe suprapuse: 3 puncte pe diagonală (repaus — glifa clasică
              de zar, lizibilă la 18px) și 6 puncte. La rostogolire, CSS-ul le
              comută în plină rotație — zarul „cade" pe 6. */}
          <g className="dice-face-3">
            <circle cx="7.5" cy="7.5" r="1.6" fill="currentColor" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" />
            <circle cx="16.5" cy="16.5" r="1.6" fill="currentColor" />
          </g>
          <g className="dice-face-6">
            <circle cx="8.5" cy="7.5" r="1.6" fill="currentColor" />
            <circle cx="15.5" cy="7.5" r="1.6" fill="currentColor" />
            <circle cx="8.5" cy="12" r="1.6" fill="currentColor" />
            <circle cx="15.5" cy="12" r="1.6" fill="currentColor" />
            <circle cx="8.5" cy="16.5" r="1.6" fill="currentColor" />
            <circle cx="15.5" cy="16.5" r="1.6" fill="currentColor" />
          </g>
        </svg>
        {/* Eticheta stă într-un SINGUR span: textul liber + span-ul „un cuvânt"
            ar deveni items flex separate și ar primi gap-2 PE LÂNGĂ &nbsp;
            (spațiu dublu vizibil). */}
        <span>
          Trage la sorți<span className="hidden im:inline">&nbsp;un cuvânt</span>
        </span>
      </a>
      )}
    </div>
  );
};

export default Filters;
