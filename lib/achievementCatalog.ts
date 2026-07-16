// Catalogul medaliilor. Fișier PUR și client-safe: fără mongoose, fără acces la
// DB, fără secrete de mediu — se importă și în componente client, ca UI-ul să
// mapeze id → titlu/regulă fără să ceară nimic de la server.
//
// Titlurile și regulile sunt exact cele aprobate în design-ul de medalii.

export type AchievementCategory =
  | "Rol"
  | "Vechime"
  | "Definiții"
  | "Influencer"
  | "Like-uri"
  | "Rapoarte"
  | "Scris mărunt"
  | "Easter eggs"
  | "Secretă"
  | "Comunitate"
  | "Merch"
  | "Endgame";

export interface AchievementDef {
  id: string;
  title: string;
  /** Regula, o propoziție. Se vede sub titlu în galerie și ca tooltip pe chip. */
  howTo: string;
  category: AchievementCategory;
  /** Ascunsă până la deblocare: în galerie apare „???" + `lockedHint`. */
  secret?: boolean;
  /** Tile inversat (fundal închis, umbră portocalie) — staff, influencer, endgame. */
  special?: boolean;
  /** Nu se poate obține încă (merch, easter eggs social media) → „În curând". */
  stub?: boolean;
  /** Intră în condiția pentru „Atinge iarba" (endgame-100). */
  countsForEndgame: boolean;
  /** Doar pentru `secret`: gluma afișată cât timp e blocată, în loc de `howTo`. */
  lockedHint?: string;
}

// countsForEndgame — regula: doar medaliile pe care oricine le poate obține prin
// folosirea normală a site-ului. Excluse deliberat:
//   • rol-*      — depind de o decizie a echipei, nu de user;
//   • influencer — e unică pe platformă și se pierde când altcineva ia recordul;
//   • beta       — acordată manual, retroactiv, nu se mai poate obține;
//   • stub-uri   — nu sunt încă implementabile (merch, easter eggs).
// Când un stub devine real, se dă flip la `stub` + `countsForEndgame` aici, iar
// ștacheta pentru endgame urcă automat (vezi ENDGAME_SET mai jos).
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "rol-moderator",
    title: "Șerif de cartier",
    howTo: "Ai primit rol de moderator.",
    category: "Rol",
    special: true,
    countsForEndgame: false,
  },
  {
    id: "rol-admin",
    title: "Tati",
    howTo: "Ai rol de administrator. Cineva trebuie să fie.",
    category: "Rol",
    special: true,
    countsForEndgame: false,
  },

  {
    id: "vechime-1",
    title: "Un an de pușcărie",
    howTo: "Cont mai vechi de 1 an.",
    category: "Vechime",
    countsForEndgame: true,
  },
  {
    id: "vechime-2",
    title: "Recidivist",
    howTo: "Cont mai vechi de 2 ani.",
    category: "Vechime",
    countsForEndgame: true,
  },
  {
    id: "vechime-3",
    title: "Fosilă de internet",
    howTo: "Cont mai vechi de 3 ani.",
    category: "Vechime",
    countsForEndgame: true,
  },

  {
    id: "def-1",
    title: "S-a spart gheața",
    howTo: "Ai adăugat prima definiție.",
    category: "Definiții",
    countsForEndgame: true,
  },
  {
    id: "def-5",
    title: "Se încălzește mâna",
    howTo: "Ai adăugat 5 definiții.",
    category: "Definiții",
    countsForEndgame: true,
  },
  {
    id: "def-10",
    title: "Grafoman",
    howTo: "Ai adăugat 10 definiții.",
    category: "Definiții",
    countsForEndgame: true,
  },
  {
    id: "def-25",
    title: "Dicționar ambulant",
    howTo: "Ai adăugat 25 de definiții.",
    category: "Definiții",
    countsForEndgame: true,
  },
  {
    id: "def-50",
    title: "Jumate de DEX",
    howTo: "Ai adăugat 50 de definiții.",
    category: "Definiții",
    countsForEndgame: true,
  },
  {
    id: "def-100",
    title: "Academia Română tremură",
    howTo: "Ai adăugat 100 de definiții.",
    category: "Definiții",
    countsForEndgame: true,
  },

  {
    id: "influencer",
    title: "Vedeta cartierului",
    howTo: "Ești autorul definiției cu cele mai multe like-uri de pe platformă.",
    category: "Influencer",
    special: true,
    countsForEndgame: false,
  },

  {
    id: "like-10",
    title: "Mama ta e mândră",
    howTo: "Definițiile tale au strâns 10 like-uri în total.",
    category: "Like-uri",
    countsForEndgame: true,
  },
  {
    id: "like-50",
    title: "Aplaudat de bloc",
    howTo: "50 de like-uri în total pe definițiile tale.",
    category: "Like-uri",
    countsForEndgame: true,
  },
  {
    id: "like-100",
    title: "Celebritate locală",
    howTo: "100 de like-uri în total pe definițiile tale.",
    category: "Like-uri",
    countsForEndgame: true,
  },
  {
    id: "like-250",
    title: "Idolul maselor",
    howTo: "250 de like-uri în total pe definițiile tale.",
    category: "Like-uri",
    countsForEndgame: true,
  },
  {
    id: "like-500",
    title: "Patrimoniu național",
    howTo: "500 de like-uri în total pe definițiile tale.",
    category: "Like-uri",
    countsForEndgame: true,
  },

  {
    id: "report-1",
    title: "Vecina de la parter",
    howTo: "O raportare de-a ta a dus la ștergerea sau editarea unei definiții.",
    category: "Rapoarte",
    countsForEndgame: true,
  },
  {
    id: "report-5",
    title: "Ochiul vigilent",
    howTo: "5 raportări validate de moderatori.",
    category: "Rapoarte",
    countsForEndgame: true,
  },
  {
    id: "report-10",
    title: "Poliția definițiilor",
    howTo: "10 raportări validate de moderatori.",
    category: "Rapoarte",
    countsForEndgame: true,
  },
  {
    id: "report-25",
    title: "Îngrijitorul platformei",
    howTo: "25 de raportări validate. Practic faci curat aici.",
    category: "Rapoarte",
    countsForEndgame: true,
  },

  {
    id: "terms",
    title: "Avocatul poporului",
    howTo: "Ai citit Termenii și condițiile până la capăt. Da, chiar tu.",
    category: "Scris mărunt",
    countsForEndgame: true,
  },
  {
    id: "privacy",
    title: "Nu am nimic de ascuns",
    howTo: "Ai citit Politica de confidențialitate până la capăt.",
    category: "Scris mărunt",
    countsForEndgame: true,
  },

  {
    id: "egg-instagram",
    title: "Stalker cu diplomă",
    howTo: "Ai găsit easter egg-ul ascuns pe Instagramul DexUrban.",
    category: "Easter eggs",
    stub: true,
    countsForEndgame: false,
  },
  {
    id: "egg-tiktok",
    title: "Brainrot certificat",
    howTo: "Ai găsit easter egg-ul ascuns pe TikTok-ul DexUrban.",
    category: "Easter eggs",
    stub: true,
    countsForEndgame: false,
  },

  {
    id: "secret-real",
    title: "Păcănele",
    howTo: "Ai dat cu zarul de 50 de ori într-o singură sesiune. Caută ajutor.",
    category: "Secretă",
    secret: true,
    special: true,
    countsForEndgame: true,
    lockedHint: "Nu o cauți tu pe ea. Te găsește ea pe tine.",
  },
  {
    id: "lost-404",
    title: "Rătăcit prin cartier",
    howTo: "Ai aterizat pe pagina 404. Felicitări, ai găsit nimicul.",
    category: "Secretă",
    secret: true,
    special: true,
    countsForEndgame: true,
    lockedHint: "Unii caută. Alții o iau pe unde nu trebuie. Ambele merg.",
  },

  {
    id: "beta",
    title: "Cobai profesionist",
    howTo: "Ai găsit un bug și ne-ai spus în loc să-l exploatezi.",
    category: "Comunitate",
    countsForEndgame: false,
  },
  {
    id: "share",
    title: "Apostol digital",
    howTo: "Ai distribuit o definiție cu butonul de share.",
    category: "Comunitate",
    countsForEndgame: true,
  },

  {
    id: "merch-cana",
    title: "Bea apă, boss",
    howTo: "Ai cumpărat cana DexUrban. Cod de revendicare primit pe email.",
    category: "Merch",
    stub: true,
    countsForEndgame: false,
  },
  {
    id: "merch-hoodie",
    title: "Golan cu glugă",
    howTo: "Ai cumpărat hoodie-ul DexUrban. Cod de revendicare primit pe email.",
    category: "Merch",
    stub: true,
    countsForEndgame: false,
  },
  {
    id: "merch-tricou",
    title: "Reclamă ambulantă",
    howTo: "Ai cumpărat tricoul DexUrban. Cod de revendicare primit pe email.",
    category: "Merch",
    stub: true,
    countsForEndgame: false,
  },
  {
    id: "merch-chipiu",
    title: "Șmecher cu cozoroc",
    howTo: "Ai cumpărat chipiul DexUrban. Cod de revendicare primit pe email.",
    category: "Merch",
    stub: true,
    countsForEndgame: false,
  },

  {
    id: "endgame-100",
    title: "Atinge iarba",
    // Textul vechi („toate celelalte medalii") era o minciună: rolurile,
    // influencer-ul, beta și stub-urile n-au fost niciodată cerute. Ăsta descrie
    // ce cere de fapt ENDGAME_SET.
    howTo:
      "Ai deblocat tot ce se poate câștiga singur pe site. Restul se dau, se cumpără sau se fură. Acum du-te afară.",
    category: "Endgame",
    secret: true,
    special: true,
    countsForEndgame: false,
    lockedHint: "Nu se caută. Se ajunge la ea.",
  },
];

export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((achievement) => [achievement.id, achievement])
);

/** Numitorul barei de progres din modal (X/34). */
export const TOTAL_COUNT = ACHIEVEMENTS.length;

/** Medaliile pe care trebuie să le ai TOATE ca să primești „Atinge iarba". */
export const ENDGAME_SET: Set<string> = new Set(
  ACHIEVEMENTS.filter((achievement) => achievement.countsForEndgame).map((a) => a.id)
);

export const ENDGAME_ID = "endgame-100";

/**
 * Medaliile derivate din `user.role` la fiecare citire — NU se stochează în DB.
 * Dispar automat la retrogradare, exact ca rolul; nu intră în endgame și nu
 * declanșează niciun toast.
 */
export const ROLE_ACHIEVEMENTS: Record<string, string> = {
  moderator: "rol-moderator",
  admin: "rol-admin",
};

/** Medaliile pe care un admin le poate acorda/retrage manual din panou. */
export const MANUAL_GRANTABLE = ["beta"];

/** Ce scrie pe o medalie secretă deblocată de ALTCINEVA — adică nimic util. */
const FOREIGN_SECRET_HINT = "Medalie secretă. Cum se ia afli doar dacă o iei.";

/**
 * Ce vede clientul pentru o medalie. Singurul loc care decide cât se dezvăluie,
 * ca galeria să nu poată ajunge să se contrazică cu ea însăși.
 *
 * `isOwn` NU are valoare implicită, intenționat: e singurul lucru care ține
 * secretele secrete, deci fiecare apelant trebuie să spună explicit al cui e
 * profilul. Un default ar fi o scurgere care așteaptă să se întâmple.
 */
export function displayFor(achievement: AchievementDef, unlocked: boolean, isOwn: boolean) {
  if (!achievement.secret) {
    return { title: achievement.title, howTo: achievement.howTo, hidden: false };
  }

  // Blocată → nici titlu, nici iconiță. Doar gluma.
  if (!unlocked) {
    return {
      title: "???",
      howTo: achievement.lockedHint || "Medalie secretă.",
      hidden: true,
    };
  }

  // Deblocată, dar pe profilul altcuiva: titlul și iconița se văd — a câștigat-o,
  // are dreptul s-o arate — dar CONDIȚIA nu. Altfel oricine ar afla toate
  // secretele răsfoind profilurile celor care le-au luat deja.
  if (!isOwn) {
    return { title: achievement.title, howTo: FOREIGN_SECRET_HINT, hidden: false };
  }

  return { title: achievement.title, howTo: achievement.howTo, hidden: false };
}
