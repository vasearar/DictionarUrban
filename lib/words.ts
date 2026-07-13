import { cache } from "react";
import { connectDB } from "@/lib/db";
import { diacriticInsensitivePattern, slugify } from "@/lib/search";
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

    // Fiecare segment din slug → pattern diacritic-insensibil; separatorul poate
    // fi orice caracter non-alfanumeric din cuvântul original (spațiu, „-", „.").
    const body = clean
      .split("-")
      .map((part) => diacriticInsensitivePattern(part))
      .join("[^a-zA-Z0-9]+");
    const rx = new RegExp(`^${body}$`, "i");

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
