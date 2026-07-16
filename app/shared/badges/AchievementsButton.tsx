"use client";

import React, { useState } from "react";
import AchievementsModal from "./AchievementsModal";

/**
 * Butonul „Medalii" + modalul lui. Folosit pe profilul public
 * (ProfileHeader) și pe contul propriu (DashboardInfo) — modalul e același,
 * doar că serverul decide dacă e profilul tău și, deci, dacă poți alege medalia
 * afișată.
 */
export default function AchievementsButton({ username }: { username: string }) {
  const [open, setOpen] = useState(false);

  function openModal() {
    setOpen(true);
    document.body.style.overflow = "hidden";
  }

  return (
    <>
      {open && <AchievementsModal username={username} close={setOpen} />}
      <button
        className="flex items-center gap-2 border-2 relative px-4 tracking-wide h-fit py-2 text-white font-bold border-mygray transition-all bg-myorange hover:bg-myhoverorange mydropshadow"
        onClick={openModal}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          shapeRendering="crispEdges"
          aria-hidden="true"
          focusable="false"
        >
          {/* medalie: cerc pixelat cu panglică */}
          <path
            d="M4 0H6V3H4V0ZM10 0H12V3H10V0ZM5 3H11V4H5V3ZM4 4H5V5H4V4ZM11 4H12V5H11V4ZM3 5H4V11H3V5ZM12 5H13V11H12V5ZM4 11H5V12H4V11ZM11 11H12V12H11V11ZM5 12H6V16H5V12ZM10 12H11V16H10V12ZM6 12H10V13H6V12ZM6 14H10V15H6V14Z"
            fill="#F1F1F1"
          />
        </svg>
        Medalii
      </button>
    </>
  );
}
