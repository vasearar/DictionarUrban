import React from "react";
import Link from "next/link";
import BackButton from "./shared/BackButton";

// 404 global. Fiind la rădăcina app/ (nu în grupul (withNav)), se randează doar
// în root layout → FĂRĂ bară de navigare și footer, așa cum trebuie.
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 py-16 text-center text-mygray font-Spacegrotesc">
      <p
        aria-hidden="true"
        className="font-Unbounded font-bold text-myorange leading-none text-8xl md:text-[10rem]"
      >
        404
      </p>

      <h1 className="font-Unbounded font-bold text-2xl md:text-4xl max-w-[640px]">
        Ai nimerit-o… pe lângă.
      </h1>

      <p className="text-base md:text-lg max-w-[540px] leading-relaxed">
        Pagina asta nu există. Ori ai ciocănit aiurea link-ul, ori s-a cărat fără
        să anunțe pe nimeni. Noi zicem că tu ai dat-o în bară, dar hai să nu ne
        certăm din prima.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
        <BackButton className="border-2 border-mygray relative rounded-sm px-6 py-3 font-bold bg-myorange text-mywhite hover:bg-myhoverorange mydropshadow">
          ← Înapoi
        </BackButton>
        <Link
          href="/"
          className="border-2 border-mygray relative rounded-sm px-6 py-3 font-bold bg-mywhite text-mygray hover:bg-myhoverorange mydropshadow"
        >
          Pagina principală
        </Link>
      </div>

      <p className="text-sm text-myhovergray max-w-[440px] mt-2">
        Sau caută cuvântul care te-a adus aici - poate există, doar l-ai scris cu
        stângul.
      </p>
    </div>
  );
}
