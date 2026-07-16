import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import rateLimitModel from "@/models/rateLimitModel";

/**
 * Anti-spam invizibil pentru utilizatorii reali, instant pentru boți/scripturi.
 *
 * Principiu: identitatea (email) este GRATIS pe acest site (providerul "anonym"
 * emite sesiuni nelimitate), deci nu ne putem baza doar pe email. Limităm pe
 * IP + identitate simultan și blocăm cine depășește oricare prag.
 *
 * Toate pragurile sunt generoase: un om care scrie definiții/rapoarte nu le
 * atinge niciodată; un script care trage în rafală le atinge din prima.
 */

// ────────────────────────────────────────────────────────────────────────────
// IP-ul clientului (din headerele de proxy — Vercel/Nginx setează x-forwarded-for)
// ────────────────────────────────────────────────────────────────────────────
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    // primul IP din lanț = clientul real
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

// ────────────────────────────────────────────────────────────────────────────
// Rate-limit atomic pe fereastră fixă (durabil în MongoDB → merge în serverless)
// ────────────────────────────────────────────────────────────────────────────
export interface RateWindow {
  /** etichetă a acțiunii, ex. "def" / "report" */
  scope: string;
  /** ce identificăm: valoarea IP-ului sau a emailului */
  id: string;
  /** numărul maxim de acțiuni permise în fereastră */
  limit: number;
  /** lungimea ferestrei în milisecunde */
  windowMs: number;
}

export interface RateResult {
  allowed: boolean;
  /** secunde până se resetează fereastra (pentru header-ul Retry-After) */
  retryAfter: number;
}

async function hitWindow(w: RateWindow): Promise<RateResult> {
  const now = Date.now();
  const windowStart = Math.floor(now / w.windowMs) * w.windowMs;
  const key = `${w.scope}:${w.id}:${w.windowMs}:${windowStart}`;
  const expiresAt = new Date(windowStart + w.windowMs + 1000);

  const doc = await rateLimitModel.findOneAndUpdate(
    { _id: key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const count = doc?.count ?? 1;
  const allowed = count <= w.limit;
  const retryAfter = Math.max(1, Math.ceil((windowStart + w.windowMs - now) / 1000));
  return { allowed, retryAfter };
}

/**
 * Verifică mai multe ferestre deodată. Dacă vreuna e depășită → răspuns 429.
 * Întoarce `null` dacă totul e OK.
 *
 * Notă: pe eroare de DB NU blocăm utilizatorul (fail-open) — anti-spam-ul nu
 * trebuie să scoată site-ul din funcțiune dacă MongoDB clipește.
 */
export async function enforceRateLimits(
  windows: RateWindow[]
): Promise<NextResponse | null> {
  try {
    await connectDB();
    const results = await Promise.all(windows.map(hitWindow));
    const blocked = results.find((r) => !r.allowed);
    if (blocked) {
      return NextResponse.json(
        { error: "Prea multe cereri. Încearcă din nou peste puțin timp." },
        { status: 429, headers: { "Retry-After": String(blocked.retryAfter) } }
      );
    }
    return null;
  } catch (error) {
    console.error("Rate limit check failed (fail-open):", error);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Contor pe fereastră, fără blocare
// ────────────────────────────────────────────────────────────────────────────

/**
 * Incrementează un contor pe fereastră fixă și întoarce noua valoare, fără să
 * blocheze nimic. Același mecanism ca rate-limit-ul (document atomic + TTL, deci
 * curățarea e gratis), dar folosit ca să NUMERE, nu ca să oprească: medalia
 * „Păcănele" are nevoie de „de câte ori ai dat cu zarul în ultima oră".
 *
 * Fail-open: pe eroare de DB întoarce 0 (nicio medalie), niciodată o excepție —
 * apelantul e pe calea unui redirect care nu are voie să pice.
 */
export async function bumpCounter(w: {
  scope: string;
  id: string;
  windowMs: number;
}): Promise<number> {
  try {
    await connectDB();
    const now = Date.now();
    const windowStart = Math.floor(now / w.windowMs) * w.windowMs;
    const key = `${w.scope}:${w.id}:${w.windowMs}:${windowStart}`;
    const doc = await rateLimitModel.findOneAndUpdate(
      { _id: key },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date(windowStart + w.windowMs + 1000) },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return doc?.count ?? 0;
  } catch (error) {
    console.error("bumpCounter failed (fail-open):", error);
    return 0;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Semnale de bot invizibile pentru om: honeypot + timp de completare
// ────────────────────────────────────────────────────────────────────────────

/**
 * `honeypot`: câmp ascuns pe care un om nu-l vede și nu-l completează niciodată.
 * Dacă are conținut → e un bot care completează orbește tot formularul.
 *
 * `elapsedMs`: câte ms au trecut de la randarea formularului până la submit.
 * Un om are nevoie de secunde bune; un script trimite instant. Sub prag → bot.
 * Tratăm valorile lipsă/necredibile permisiv (fail-open) ca să nu lovim omul.
 */
export function looksAutomated(body: {
  honeypot?: unknown;
  elapsedMs?: unknown;
}): boolean {
  const hp = body?.honeypot;
  if (typeof hp === "string" && hp.trim().length > 0) return true;

  const elapsed = Number(body?.elapsedMs);
  // Doar dacă avem un număr valid ȘI e absurd de mic (sub 1.2s) considerăm bot.
  if (Number.isFinite(elapsed) && elapsed > 0 && elapsed < 1200) return true;

  return false;
}

// ────────────────────────────────────────────────────────────────────────────
// Validare de conținut server-side (oglindește regulile din client, dar acum
// nu se mai poate sări peste ele apelând direct API-ul)
// ────────────────────────────────────────────────────────────────────────────

const ALLOWED_TEXT =
  /^[a-zA-Z0-9_ăîșțâĂÎȘȚÂéÉêÊœŒûÛïÏàÀèÈçÇäÄüÜöÖ(){}\[\]"':;,.\/\\~`„”?\-_=+!*\s]+$/;

export interface FieldRule {
  value: string;
  min: number;
  max: number;
  label: string;
  /** dacă true, verifică și setul de caractere permis */
  charset?: boolean;
}

/** Întoarce mesajul de eroare sau `null` dacă e valid. */
export function validateField(rule: FieldRule): string | null {
  const text = rule.value.trim();
  if (text.length < rule.min) {
    return `${rule.label} nu poate conține mai puțin de ${rule.min} simboluri`;
  }
  if (text.length > rule.max) {
    return `${rule.label} nu poate conține mai mult de ${rule.max} simboluri`;
  }
  if (rule.charset && !ALLOWED_TEXT.test(text)) {
    return `${rule.label} conține simboluri nepermise`;
  }
  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// Verificare captcha SERVER-SIDE (graceful: dacă nu e configurată cheia, sare)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Verifică token-ul reCAPTCHA direct la Google, pe server.
 *  - dacă `RECAPTCHA_SECRET_KEY` nu e setat (dev/local) → întoarce true (skip);
 *  - dacă e setat → token-ul e obligatoriu și trebuie să fie valid.
 */
export async function verifyCaptchaToken(token: unknown): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // captcha neconfigurat în acest mediu → nu blocăm

  if (typeof token !== "string" || token.length === 0) return false;

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }).toString(),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error("Captcha verify failed:", error);
    return false;
  }
}
