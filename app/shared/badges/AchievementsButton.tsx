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
      {/* Stil SECUNDAR (alb + bordură + umbră dură), ca „Trage la sorți": pe un
          profil, lucrul important e omul și definițiile lui, nu galeria. Un
          singur buton primar pe pagină. */}
      <button
        className="relative shrink-0 h-fit flex items-center gap-2 bg-mywhite md:hover:bg-myhoverorange text-mygray font-bold text-sm md:text-base border-2 border-mygray rounded-sm px-3 py-2 md:px-4 md:py-[0.625rem] mydropshadow transition-all"
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
          {/* cupă: potir cu toarte, picior și soclu. currentColor, nu alb fix:
              butonul e alb, iar la hover devine portocaliu — glifa trebuie să
              rămână vizibilă în ambele. */}
          <g fill="currentColor">
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
