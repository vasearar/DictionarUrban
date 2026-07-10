// Utilitare de căutare partajate între server (rute API) și client (autocomplete).
// Scop: potrivire insensibilă la MAJUSCULE și la DIACRITICE, în ambele direcții
// ("inghetata" ↔ "Înghețată", "pisica" ↔ "Pisica").

/**
 * Aduce un text la forma de bază: litere mici, fără diacritice.
 * `normalize("NFD")` desparte litera de semnul diacritic (ă → a + ˘, ț → t + ,),
 * iar regex-ul șterge semnele combinate (U+0300–U+036F). Acoperă toate
 * diacriticele românești, inclusiv variantele cu cedilă (ş/ţ) și cu virgulă (ș/ț).
 */
export function stripDiacritics(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Escape pentru caracterele speciale de regex, ca input-ul userului să fie literal. */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Litera de bază → clasa cu toate variantele ei diacritice (folosită la construirea regex-ului).
const DIACRITIC_CLASSES: Record<string, string> = {
  a: "aăâ",
  i: "iî",
  s: "sșş",
  t: "tțţ",
};

/**
 * Construiește un fragment de pattern regex insensibil la diacritice pornind de
 * la textul userului: normalizează la litere de bază, escapează, apoi extinde
 * fiecare a/i/s/t la clasa lui ([aăâ] etc.). Se combină cu flag-ul "i" pentru
 * insensibilitate la majuscule.
 */
export function diacriticInsensitivePattern(q: string): string {
  const base = escapeRegex(stripDiacritics(q));
  return base.replace(/[aist]/g, (ch) => `[${DIACRITIC_CLASSES[ch]}]`);
}

/** Obiect regex Mongo/JS insensibil la diacritice și majuscule, ancorat opțional pe prefix. */
export function searchRegex(q: string, anchor: "prefix" | "contains" = "contains") {
  const body = diacriticInsensitivePattern(q);
  return new RegExp(anchor === "prefix" ? `^${body}` : body, "i");
}

/** Formă pentru operatorul $regex din Mongo (string pattern + opțiuni). */
export function mongoSearch(q: string, anchor: "prefix" | "contains" = "contains") {
  const body = diacriticInsensitivePattern(q);
  return { $regex: anchor === "prefix" ? `^${body}` : body, $options: "i" };
}

/** Potrivire locală (în memorie), pentru filtrarea listelor deja încărcate — ex. panoul. */
export function matches(haystack: string | undefined | null, needle: string): boolean {
  if (!haystack) return false;
  return stripDiacritics(haystack).includes(stripDiacritics(needle));
}

/**
 * Slug canonic pentru URL-uri de cuvânt: litere mici, fără diacritice, orice run
 * de caractere non-alfanumerice → cratimă. „Înghețată" → "inghetata",
 * „De belea!" → "de-belea". Pur (fără DB) → sigur și pe client (ex. Share).
 */
export function slugify(word: string): string {
  return stripDiacritics(word)
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
