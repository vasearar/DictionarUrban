"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ACHIEVEMENT_MAP } from "@/lib/achievementCatalog";
import { BadgeIcon } from "./BadgeIcons";

/**
 * Toast-urile de deblocare, în stil Steam/PlayStation: dreapta-jos, unul câte
 * unul, fără să întrerupă nimic.
 *
 * Două surse de medalii ajung aici:
 *  1. SINCRON — acțiunea userului a acordat medalia chiar acum (a publicat o
 *     definiție, a citit termenii). Ruta întoarce id-urile în răspuns și pagina
 *     cheamă `notify()` direct, fără drum în plus la server.
 *  2. PRIN POLL — medalia a venit din acțiunea altcuiva (cineva i-a dat like,
 *     un moderator i-a validat raportul) sau din trecerea timpului (vechimea).
 *     Userul n-avea cum s-o afle: întrebăm la fiecare schimbare de pagină.
 *
 * Montat în layout, înăuntrul <Providers> (are nevoie de sesiune), deci acoperă
 * și paginile cu navbar, și pe cele fără, și 404-ul.
 */

const TOAST_MS = 6000; // cât stă pe ecran
const EXIT_MS = 1200; // durata animației de ieșire (sincronizată cu CSS-ul)
const POLL_THROTTLE_MS = 60_000; // navigarea rapidă nu trebuie să bombardeze API-ul

interface AchievementToastApi {
  /** Pune la coadă toast-uri pentru id-urile date. Ignoră ce nu există sau s-a arătat deja. */
  notify: (ids: string[] | undefined | null) => void;
}

const AchievementToastContext = createContext<AchievementToastApi>({ notify: () => {} });

export function useAchievementToasts() {
  return useContext(AchievementToastContext);
}

export default function AchievementToastProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();

  const [queue, setQueue] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  const lastPollRef = useRef(0);
  // Un id arătat o dată nu se mai arată în sesiunea asta, chiar dacă un poll
  // pornit înainte de ack îl mai raportează o dată ca pending.
  const shownRef = useRef<Set<string>>(new Set());

  const notify = useCallback((ids: string[] | undefined | null) => {
    if (!ids || ids.length === 0) return;
    const fresh = ids.filter((id) => ACHIEVEMENT_MAP[id] && !shownRef.current.has(id));
    if (fresh.length === 0) return;
    fresh.forEach((id) => shownRef.current.add(id));
    setQueue((previous) => [...previous, ...fresh]);
  }, []);

  // Un toast într-o filă din fundal e un toast irosit: animația de intrare nici
  // n-ar porni (rAF nu rulează acolo), dar cronometrul de auto-dismiss da — deci
  // medalia ar fi confirmată și ștearsă fără ca omul s-o vadă vreodată. Ținem
  // coada pe loc până revine la filă.
  useEffect(() => {
    const sync = () => setVisible(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // Poll: la montare și la fiecare schimbare de pagină, dar nu mai des de un
  // minut. Doar autentificat — pentru un vizitator n-are ce să întoarcă.
  useEffect(() => {
    if (status !== "authenticated") return;

    const now = Date.now();
    if (now - lastPollRef.current < POLL_THROTTLE_MS) return;
    lastPollRef.current = now;

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/achievements/notifications", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) notify(data?.pending);
      } catch {
        // Fără toast acum; reîncearcă la următoarea pagină.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, pathname, notify]);

  // Scoate următorul din coadă când ecranul e liber.
  useEffect(() => {
    if (current !== null || queue.length === 0) return;
    setCurrent(queue[0]);
    setQueue((previous) => previous.slice(1));
  }, [current, queue]);

  // Ciclul de viață al toast-ului curent. Depinde doar de `current` și de
  // vizibilitate — dacă ar depinde și de coadă, o medalie pusă la coadă în
  // timpul afișării ar reseta cronometrele celei de pe ecran. Dacă userul
  // comută taburile la mijloc, cronometrele se opresc și toast-ul se reia
  // întreg la întoarcere.
  useEffect(() => {
    if (current === null || !visible) return;

    // Ack: medalia a fost arătată, nu o mai trimite la următorul poll. Trimis
    // separat de GET intenționat — dacă ack-ul pică, toast-ul reapare, ceea ce
    // e mai bine decât o medalie deblocată în tăcere.
    fetch("/api/achievements/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [current] }),
    }).catch(() => {});

    // Două rAF-uri: primul lasă browserul să picteze cardul în afara ecranului,
    // al doilea pornește tranziția. Cu unul singur, ambele stări intră în același
    // paint și animația nu se vede.
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setOpen(true));
    });

    const hide = setTimeout(() => setOpen(false), TOAST_MS);
    const done = setTimeout(() => setCurrent(null), TOAST_MS + EXIT_MS);

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      clearTimeout(hide);
      clearTimeout(done);
    };
  }, [current, visible]);

  const achievement = current ? ACHIEVEMENT_MAP[current] : null;

  return (
    <AchievementToastContext.Provider value={{ notify }}>
      {children}
      {achievement && (
        <div
          className={`achievement-toast fixed bottom-4 right-4 z-[60] font-Spacegrotesc ${
            open ? "achievement-toast--open" : ""
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="relative flex items-center gap-3 border-2 border-mygray bg-mywhite mydropshadow px-4 py-3 max-w-[320px]">
            <BadgeIcon id={achievement.id} size={32} className="flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-myhovergray">
                Medalie deblocată!
              </p>
              <p className="font-bold text-myorange leading-tight">{achievement.title}</p>
            </div>
          </div>
        </div>
      )}
    </AchievementToastContext.Provider>
  );
}
