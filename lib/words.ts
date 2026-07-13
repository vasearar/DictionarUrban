import { cache } from "react";
import { connectDB } from "@/lib/db";
import { slugify } from "@/lib/search";
import wordModel from "@/models/wordModel";

// Re-export pentru compatibilitate: slugify locuiește acum în lib/search (pur,
// client-safe), dar codul server importă în continuare din @/lib/words.
export { slugify };

// Acces la definiții pentru paginile publice de cuvânt (/cuvant/[slug]).
// Interoghează Mongo DIRECT (nu prin self-fetch la /api/definition), la fel ca
// lib/profile.ts. Un cuvânt = mai multe definiții (mai mulți autori) → pagina
// agregă toate definițiile vizibile pentru același slug, model Urban Dictionary.

export interface WordDefinition {
  _id: string;
  word: string;
  definition: string;
  exampleOfUsing: string;
  username: string;
  likes: number;
  date: string;
}

export interface WordEntry {
  slug: string;
  word: string; // forma canonică afișată (a celei mai apreciate definiții)
  definitions: WordDefinition[]; // sortate: cele mai apreciate primele
  lastmod: string; // ISO — cea mai recentă dată din definiții
}

interface WordRow {
  _id: unknown;
  word?: string;
  definition?: string;
  exampleOfUsing?: string;
  username?: string;
  likes?: number;
  date?: string;
}

function toIso(date: string | undefined): string {
  if (!date) return "";
  const t = Date.parse(date);
  return Number.isNaN(t) ? "" : new Date(t).toISOString();
}

// Literele latine accentuate (Latin-1 Supplement → Latin Extended Additional).
// slugify reduce oricare din ele la litera de bază, deci lookup-ul trebuie să
// accepte, pentru fiecare literă din slug, și orice variantă accentuată.
// Caractere LITERALE (nu escape-uri \uXXXX): regex-ul e evaluat de Mongo cu
// PCRE2, care nu suportă sintaxa \u — escape-urile ar arunca Location51091.
const ACCENTED = "À-ɏḀ-ỿ";

/** Segment de slug ([a-z0-9]+) → pattern care tolerează litere accentuate. */
function slugSegmentPattern(part: string): string {
  return part.replace(/[a-z]/g, (ch) => `[${ch}${ACCENTED}]`);
}

/**
 * Toate definițiile vizibile pentru un slug, sortate după like-uri (desc).
 * Construiește un regex ancorat, insensibil la diacritice/majuscule, pornind de
 * la slug (candidați), apoi filtrează exact prin slugify pentru siguranță
 * (elimină cuvintele care doar seamănă, dar au alt slug canonic).
 * Învelit în cache() ca pagina și generateMetadata să împartă un singur query.
 */
export const getWordEntry = cache(
  async (slug: string): Promise<WordEntry | null> => {
    const clean = slugify(slug);
    if (!clean) return null;

    await connectDB();

    // Fiecare segment din slug → pattern per-literă: litera de bază SAU orice
    // literă latină accentuată (acoperă ă/â/î/ș/ț, dar și è, ǎ etc. venite din
    // typos/copy-paste — slugify le reduce pe toate la litera de bază).
    // Separatorul dintre segmente e orice run non-alfanumeric (spațiu, „-", „,").
    // Marginile tolerează punctuație pe care slugify o taie („cine?", „belea!") —
    // altfel acele cuvinte ar fi 404 deși au slug valid. Falsele pozitive sunt
    // eliminate de filtrul exact slugify(word) === clean de mai jos.
    const body = clean
      .split("-")
      .map((part) => slugSegmentPattern(part))
      .join("[^a-zA-Z0-9]+");
    const rx = new RegExp(`^[^a-zA-Z0-9]*${body}[^a-zA-Z0-9]*$`, "i");

    const rows = await wordModel
      .find({ word: rx, hidden: { $ne: true } })
      .sort({ likes: -1, _id: -1 })
      .select("word definition exampleOfUsing username likes date")
      .lean<WordRow[]>();

    const matched = rows.filter((r) => r.word && slugify(r.word) === clean);
    if (matched.length === 0) return null;

    const definitions: WordDefinition[] = matched.map((r) => ({
      _id: String(r._id),
      word: r.word || "",
      definition: r.definition || "",
      exampleOfUsing: r.exampleOfUsing || "",
      username: r.username || "Anonim",
      likes: typeof r.likes === "number" ? r.likes : 0,
      date: r.date || "",
    }));

    const lastmod = definitions
      .map((d) => toIso(d.date))
      .filter(Boolean)
      .sort()
      .pop() || "";

    return {
      slug: clean,
      word: definitions[0].word, // forma cu diacritice a celei mai apreciate
      definitions,
      lastmod,
    };
  }
);

/**
 * Slug-ul unui cuvânt ales aleator dintre definițiile vizibile.
 * Folosește `$sample` (Mongo) ca să nu tragă tot colecția în memorie — un
 * singur document random direct din DB. Alimentează butonul „Trage la sorți".
 */
export async function getRandomWordSlug(): Promise<string | null> {
  await connectDB();
  const rows = await wordModel.aggregate<{ word?: string }>([
    { $match: { hidden: { $ne: true }, word: { $type: "string", $ne: "" } } },
    { $sample: { size: 1 } },
    { $project: { word: 1 } },
  ]);
  const word = rows?.[0]?.word;
  if (!word) return null;
  return slugify(word) || null;
}

interface SitemapRow {
  word?: string;
  date?: string;
}

/**
 * Toate cuvintele unice (după slug) pentru sitemap, cu cel mai recent `lastmod`.
 * O singură trecere prin definițiile vizibile; deduplică pe slug canonic.
 */
export async function getAllWordSlugs(): Promise<
  { slug: string; lastmod: string }[]
> {
  await connectDB();
  const rows = await wordModel
    .find({ hidden: { $ne: true } })
    .select("word date")
    .lean<SitemapRow[]>();

  const map = new Map<string, string>(); // slug → cel mai recent lastmod ISO
  for (const r of rows) {
    if (!r.word) continue;
    const slug = slugify(r.word);
    if (!slug) continue;
    const iso = toIso(r.date);
    const prev = map.get(slug);
    if (prev === undefined || (iso && iso > prev)) map.set(slug, iso);
  }

  return [...map.entries()].map(([slug, lastmod]) => ({ slug, lastmod }));
}
