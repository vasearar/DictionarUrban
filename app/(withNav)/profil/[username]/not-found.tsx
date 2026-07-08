import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-8 my-24 px-3 font-Spacegrotesc">
      <div className="text-center text-xl font-bold">
        Nu am găsit acest utilizator `(*&gt;﹏&lt;*)`
      </div>
      <Link
        href="/"
        className="border-2 relative px-4 tracking-wide h-fit py-2 text-white font-bold border-mygray transition-all bg-myorange hover:bg-myhoverorange mydropshadow"
      >
        Înapoi la pagina principală
      </Link>
    </div>
  );
}
