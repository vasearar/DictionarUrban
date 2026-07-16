"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAchievementToasts } from "./AchievementToast";

/**
 * „Rătăcit prin cartier": ai ajuns pe 404. Componentă invizibilă, pusă în
 * app/not-found.tsx. Nu are nicio condiție în afară de a fi acolo — de asta e
 * secretă: n-ai cum s-o cauți, doar s-o nimerești.
 */
export default function NotFoundTracker() {
  const { status } = useSession();
  const { notify } = useAchievementToasts();
  // În React 18 StrictMode efectele rulează de două ori în dev; garda ține
  // POST-ul unic (serverul e idempotent oricum, dar n-are rost cererea).
  const firedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || firedRef.current) return;
    firedRef.current = true;

    (async () => {
      try {
        const response = await fetch("/api/achievements/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "404" }),
        });
        if (!response.ok) return;
        const data = await response.json();
        notify(data?.newAchievements);
      } catch {
        // Un 404 e deja o zi proastă; nu mai adăugăm o eroare peste.
      }
    })();
  }, [status, notify]);

  return null;
}
