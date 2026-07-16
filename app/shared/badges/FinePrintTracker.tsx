"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAchievementToasts } from "./AchievementToast";

/**
 * „Avocatul poporului" / „Nu am nimic de ascuns": medaliile pentru cine chiar
 * citește scrisul mărunt. Componentă invizibilă, se pune în pagină și atât.
 *
 * Condiția e dublă, și amândouă trebuie îndeplinite:
 *  1. ai derulat până jos — altfel e doar un Ctrl+End;
 *  2. ai stat minimum 75 de secunde — altfel e doar un scroll până jos.
 *
 * Timpul se acumulează DOAR cât fila e vizibilă: nu se ia medalia lăsând
 * pagina deschisă în fundal cât îți faci o cafea.
 */

const DWELL_MS = 75_000;
const TICK_MS = 1000;
const SCROLL_SLACK_PX = 24; // toleranță pentru zoom / bare de adresă mobile
const SCROLL_THROTTLE_MS = 200;

export default function FinePrintTracker({ type }: { type: "terms" | "privacy" }) {
  const { status } = useSession();
  const { notify } = useAchievementToasts();

  const firedRef = useRef(false);
  const dwellRef = useRef(0);
  const scrolledRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    // Deja luată pe browserul ăsta → nu mai deranjăm serverul degeaba. E doar o
    // optimizare: grant-ul e oricum idempotent pe server.
    const storageKey = `dx-medalie-${type}`;
    try {
      if (localStorage.getItem(storageKey) === "1") return;
    } catch {
      // localStorage blocat (mod privat) — mergem mai departe fără el.
    }

    async function fire() {
      if (firedRef.current) return;
      if (!scrolledRef.current || dwellRef.current < DWELL_MS) return;
      firedRef.current = true;

      try {
        const response = await fetch("/api/achievements/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
        if (!response.ok) return;
        const data = await response.json();
        notify(data?.newAchievements);
        try {
          localStorage.setItem(storageKey, "1");
        } catch {
          // fără localStorage doar retrimitem la următoarea vizită; inofensiv
        }
      } catch {
        // Rețea picată: nicio medalie acum. Revine la următoarea vizită.
      }
    }

    function checkScroll() {
      const reachedBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - SCROLL_SLACK_PX;
      if (reachedBottom) {
        scrolledRef.current = true;
        fire();
      }
    }

    let throttled = false;
    function onScroll() {
      if (throttled) return;
      throttled = true;
      setTimeout(() => {
        throttled = false;
        checkScroll();
      }, SCROLL_THROTTLE_MS);
    }

    // Filele din fundal nu numără. `setInterval` e oricum încetinit acolo, dar
    // verificarea explicită e cea care garantează regula.
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      dwellRef.current += TICK_MS;
      fire();
    }, TICK_MS);

    window.addEventListener("scroll", onScroll, { passive: true });
    checkScroll(); // pagină scurtă / reîncărcată deja derulată jos

    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [status, type, notify]);

  return null;
}
