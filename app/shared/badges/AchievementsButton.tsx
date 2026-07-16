"use client";

import React, { useState } from "react";
import AchievementsModal from "./AchievementsModal";

/**
 * Butonul „Trofee" + modalul lui. Folosit pe profilul public
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
          {/* cupă: potir cu toarte, picior și soclu */}
          <g fill="#F1F1F1">
            <rect x="2" y="2" width="12" height="1" />
            <rect x="3" y="3" width="10" height="4" />
            <rect x="1" y="3" width="1" height="3" />
            <rect x="14" y="3" width="1" height="3" />
            <rect x="1" y="6" width="2" height="1" />
            <rect x="13" y="6" width="2" height="1" />
            <rect x="4" y="7" width="8" height="1" />
            <rect x="5" y="8" width="6" height="1" />
            <rect x="7" y="9" width="2" height="2" />
            <rect x="5" y="11" width="6" height="1" />
            <rect x="4" y="12" width="8" height="1" />
          </g>
        </svg>
        Trofee
      </button>
    </>
  );
}
