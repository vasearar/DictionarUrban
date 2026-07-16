"use client";

import React, { useEffect, useState } from "react";
import {
  ACHIEVEMENTS,
  AchievementDef,
  displayFor,
  TOTAL_COUNT,
} from "@/lib/achievementCatalog";
import { BadgeIcon } from "./BadgeIcons";

/**
 * Galeria de medalii. Se deschide de pe ORICE profil — poți vedea ce a strâns
 * altcineva — dar alegerea medaliei de profil apare doar pe contul propriu
 * (`isOwn`, decis de server prin comparație cu sesiunea, nu de client).
 *
 * Serverul trimite doar id-urile DEBLOCATE. Tot restul (titluri, reguli) vine
 * din catalog, care e client-side; medaliile secrete pe care userul nu le are
 * rămân „???" pentru că `displayFor` le ascunde, într-un singur loc.
 */

interface AchievementsModalProps {
  /** porecla profilului vizitat (casing-ul canonic din users) */
  username: string;
  close: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AchievementsResponse {
  unlocked: { id: string; unlockedAt?: string }[];
  displayed: string | null;
  progress: { count: number; total: number };
  isOwn: boolean;
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({ username, close }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [displayed, setDisplayed] = useState<string | null>(null);
  const [isOwn, setIsOwn] = useState(false);
  // Bara pornește de la 0 și se umple după ce sosesc datele — de aia e stare
  // separată de `unlocked.size`.
  const [progressWidth, setProgressWidth] = useState(0);

  const closeModal = () => {
    close(false);
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    (async () => {
      try {
        const response = await fetch(
          `/api/achievements?username=${encodeURIComponent(username)}`,
          { cache: "no-store" }
        );
        if (!response.ok) throw new Error("request failed");
        const data: AchievementsResponse = await response.json();
        if (cancelled) return;

        setUnlocked(new Set(data.unlocked.map((achievement) => achievement.id)));
        setDisplayed(data.displayed);
        setIsOwn(data.isOwn);
        setLoading(false);
        // Bara se randează întâi la 0, apoi urcă → tranziția are de unde porni.
        // Timer, nu requestAnimationFrame: rAF nu rulează deloc într-o filă din
        // fundal, iar dacă userul comută taburile fix cât se încarcă modalul,
        // bara ar rămâne blocată la 0% pentru totdeauna. Timer-ul e încetinit
        // în fundal, dar tot se execută — cel mai rău caz e că sare direct la
        // valoarea finală, ceea ce e exact ce vrei când nu te uiți.
        timer = setTimeout(() => {
          if (!cancelled) setProgressWidth((data.progress.count / data.progress.total) * 100);
        }, 50);
      } catch {
        if (!cancelled) {
          setError("Nu am putut încărca medaliile. Încearcă din nou.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [username]);

  // Optimistic: medalia sare pe profil imediat, iar dacă serverul refuză o
  // punem la loc. Un refuz aici înseamnă oricum că cineva a umblat la client.
  async function chooseDisplayed(id: string | null) {
    if (!isOwn || id === displayed) return;
    const previous = displayed;
    setDisplayed(id);
    try {
      const response = await fetch("/api/achievements/display", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) setDisplayed(previous);
    } catch {
      setDisplayed(previous);
    }
  }

  const count = unlocked.size;

  return (
    <div
      className="h-screen w-screen bg-black bg-opacity-70 z-50 fixed top-0 left-0 flex justify-center items-center font-Spacegrotesc"
      onClick={closeModal}
    >
      <div
        className="h-fit max-h-[88vh] overflow-y-auto max-w-[900px] w-full bg-mywhite mx-3 p-4 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-bold text-3xl">Medalii</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {isOwn ? "Colecția ta" : `Colecția lui ${username}`}
            </p>
          </div>
          <button
            className="hover:text-myhovergray text-mygray h-fit px-4 py-2 font-bold text-nowrap relative rounded-sm bg-mywhite rounded-br-none border-2 border-mygray mydropshadow"
            onClick={closeModal}
          >
            Închide
          </button>
        </div>

        {error ? (
          <p className="text-red-500 font-bold mt-8">{error}</p>
        ) : loading ? (
          <p className="text-zinc-500 mt-8">Numărăm medaliile...</p>
        ) : (
          <>
            {/* progres X/34 */}
            <div className="mt-6">
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-bold text-sm uppercase tracking-widest text-myhovergray">
                  Progres
                </span>
                <span className="font-bold">
                  {count}/{TOTAL_COUNT}
                </span>
              </div>
              <div className="h-4 w-full border-2 border-mygray bg-mywhite">
                <div
                  className="achievement-progress-fill h-full bg-myorange"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>

            {isOwn && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-sm text-zinc-500">
                  Apasă pe o medalie deblocată ca s-o pui pe profil.
                </p>
                {displayed && (
                  <button
                    className="text-sm font-bold text-mygray hover:text-myhovergray transition-all underline"
                    onClick={() => chooseDisplayed(null)}
                  >
                    Fără medalie pe profil
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mt-6">
              {ACHIEVEMENTS.map((achievement) => (
                <BadgeTile
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={unlocked.has(achievement.id)}
                  displayed={displayed === achievement.id}
                  selectable={isOwn && unlocked.has(achievement.id)}
                  onSelect={() => chooseDisplayed(achievement.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function BadgeTile({
  achievement,
  unlocked,
  displayed,
  selectable,
  onSelect,
}: {
  achievement: AchievementDef;
  unlocked: boolean;
  displayed: boolean;
  selectable: boolean;
  onSelect: () => void;
}) {
  const { title, howTo, hidden } = displayFor(achievement, unlocked);
  const special = achievement.special && unlocked;

  // Blocată = glifa în gri, transparentă. Gri e rezervat exclusiv stării ăsteia,
  // deci nu poate fi confundată cu o medalie obținută.
  const tone = special
    ? "bg-mygray text-mywhite myorangedropshadow"
    : "bg-mywhite text-mygray mydropshadow";

  const content = (
    <>
      <div className={`flex justify-center mb-2 ${unlocked ? "" : "grayscale opacity-40"}`}>
        <BadgeIcon id={achievement.id} revealed={!hidden} size={56} />
      </div>
      <p className={`font-bold text-sm leading-tight ${unlocked ? "" : "text-myhovergray"}`}>
        {title}
      </p>
      <p className={`text-xs leading-snug mt-1 ${special ? "text-mydarkhovergray" : "text-zinc-500"}`}>
        {achievement.stub && !unlocked ? "În curând." : howTo}
      </p>
      {displayed && (
        <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-myorange">
          Pe profil
        </p>
      )}
    </>
  );

  const shell = `relative border-2 border-mygray rounded-sm rounded-br-none p-3 text-center ${tone} ${
    displayed ? "ring-2 ring-myorange ring-offset-2 ring-offset-mywhite" : ""
  }`;

  if (!selectable) {
    return <div className={shell}>{content}</div>;
  }

  return (
    <button
      type="button"
      className={`${shell} hover:border-myorange transition-all`}
      onClick={onSelect}
      aria-pressed={displayed}
      title="Pune medalia asta pe profil"
    >
      {content}
    </button>
  );
}

export default AchievementsModal;
