import { NextResponse, NextRequest } from "next/server";
import wordModel from "@/models/wordModel";
import { connectDB } from "@/lib/db";
import { getClientIp, enforceRateLimits } from "@/lib/antispam";
import { mongoSearch } from "@/lib/search";

// Endpoint ușor de sugestii pentru autocomplete (separat de /api/definition ca
// să rămână rapid). Întoarce cel mult `limit` sugestii, câmpuri minime.
//
// Regula de prioritate cerută:
//   1. dacă `q` începe cu "@" → sugestii de UTILIZATORI (după poreclă)
//   2. altfel → întâi cuvinte al căror `word` începe cu `q` (prefix)
//   3. dacă nu se găsește NICIUN cuvânt → fallback pe `definition`/`exampleOfUsing`
//
// Totul insensibil la majuscule și diacritice (vezi lib/search.ts).

const MIN_LEN = 2;
const MAX_LIMIT = 8;

interface Suggestion {
  _id: string;
  label: string; // textul principal (cuvântul sau porecla)
  sub?: string; // context secundar (fragment din definiție, autor)
  type: "word" | "definition" | "user";
}

interface WordRow {
  _id: unknown;
  word: string;
  definition?: string;
}

export async function GET(req: NextRequest) {
  const raw = new URL(req.url).searchParams.get("q")?.trim() || "";
  const limit = Math.min(
    Number(new URL(req.url).searchParams.get("limit")) || MAX_LIMIT,
    MAX_LIMIT
  );

  if (raw.length < MIN_LEN) {
    return NextResponse.json({ type: "word", suggestions: [] as Suggestion[] });
  }

  // Rate-limit generos pe IP: autocomplete-ul lovește des, dar un script tot se prinde.
  const ip = getClientIp(req);
  const limited = await enforceRateLimits([
    { scope: "suggest-ip", id: ip, limit: 120, windowMs: 60_000 },
  ]);
  if (limited) return limited;

  try {
    await connectDB();

    const visible = { hidden: { $ne: true } };

    // 1. Utilizatori (prefix "@") — porecle distincte, fără definiții ascunse.
    if (raw.startsWith("@")) {
      const term = raw.slice(1).trim();
      if (term.length < 1) {
        return NextResponse.json({ type: "user", suggestions: [] as Suggestion[] });
      }
      const rows = await wordModel
        .find({ username: mongoSearch(term, "prefix"), ...visible })
        .select("username")
        .lean<{ username?: string }[]>();

      const seen = new Set<string>();
      const suggestions: Suggestion[] = [];
      for (const r of rows) {
        const name = r.username;
        if (!name) continue;
        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        suggestions.push({ _id: `@${name}`, label: name, type: "user" });
        if (suggestions.length >= limit) break;
      }
      return NextResponse.json({ type: "user", suggestions });
    }

    // 2. Cuvinte care încep cu `q` (prefix pe `word`).
    const byWord = await wordModel
      .find({ word: mongoSearch(raw, "prefix"), ...visible })
      .select("word definition")
      .limit(limit)
      .lean<WordRow[]>();

    if (byWord.length > 0) {
      const suggestions: Suggestion[] = byWord.map((w) => ({
        _id: String(w._id),
        label: w.word,
        sub: w.definition?.slice(0, 70),
        type: "word",
      }));
      return NextResponse.json({ type: "word", suggestions });
    }

    // 3. Fallback: niciun cuvânt nu s-a potrivit → caută în definiție/exemplu.
    const rx = mongoSearch(raw, "contains");
    const byText = await wordModel
      .find({ $or: [{ definition: rx }, { exampleOfUsing: rx }], ...visible })
      .select("word definition")
      .limit(limit)
      .lean<WordRow[]>();

    const suggestions: Suggestion[] = byText.map((w) => ({
      _id: String(w._id),
      label: w.word,
      sub: w.definition?.slice(0, 70),
      type: "definition",
    }));
    return NextResponse.json({ type: "definition", suggestions });
  } catch (error) {
    console.error("Suggest error:", error);
    return NextResponse.json({ type: "word", suggestions: [] as Suggestion[] });
  }
}
