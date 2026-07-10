# Audit SEO + AEO — dexurban.md

**Data:** 2026-07-10
**Faza:** 1 (audit — fără modificări de cod)
**Stack confirmat:** Next.js `15.5.20` (App Router), React 18, MongoDB + Mongoose 8, NextAuth v4. TypeScript. Tailwind. Fără `@vercel/og`, fără layer de cache/ISR.

---

## 0. Rezumat executiv — verdictul brutal

> **Platforma este, în acest moment, aproape invizibilă pentru SEO și complet inutilizabilă pentru AEO.** Nu din cauza unor detalii, ci a unei probleme arhitecturale de fond:

### 🔴 Problema #1 (blochează tot restul): nu există pagini de cuvânt

Nu există nicio rută `/cuvant/[slug]`. **Fiecare definiție din întreaga bază de date trăiește pe homepage**, accesibilă doar prin parametru de query: `/?query=cuvant`. Vezi [`app/(withNav)/page.tsx`](app/(withNav)/page.tsx) → [`app/shared/Definition.tsx`](app/shared/Definition.tsx).

Consecințe directe, toate fatale pentru obiectivele tale:

1. **Google nu indexează per-cuvânt.** Google normalizează și de-duplică URL-urile cu parametri de query; `/?query=x` și `/?query=y` sunt tratate ca aceeași pagină (`/`) sau ignorate. Nu vei rankui niciodată pentru „ce înseamnă [cuvânt]" pentru că nu există un URL dedicat acelui cuvânt.
2. **Chatboturile (Claude, ChatGPT, Perplexity, Gemini) nu pot cita nimic.** Un LLM citează un URL stabil cu un răspuns clar. Aici nu există URL per definiție → nu există ce cita.
3. **Share-ul e rupt.** [`Share.tsx`](app/shared/Share.tsx) distribuie `https://www.dexurban.md/?query=cuvant` — un URL fără metadata proprie, fără OG image, care duce la o listă de rezultate, nu la o pagină de cuvânt.

Vestea bună: conținutul **este** deja server-rendered (componenta `Definition` e un Server Component `async`), deci scheletul tehnic pentru SSR există. Trebuie „doar" mutat pe URL-uri per-cuvânt reale + adăugate toate straturile de metadata/schema/OG care lipsesc.

### Tablou de bord

| Zonă | Status | Notă |
|---|---|---|
| Pagini de cuvânt indexabile | ❌ | Nu există — totul pe `/?query=` |
| SSR conținut vizibil în HTML | ✅ | Server Component, dar fără cache (vezi CWV) |
| robots.txt | ⚠️ | Minimal, fără crawlere AI, fără `Sitemap:` |
| sitemap.xml | ❌ | Doar 3 URL-uri statice, zero cuvinte |
| Metadata unică / pagină | ❌ | Doar titlu global generic |
| Open Graph / Twitter Cards | ❌ | Inexistente |
| JSON-LD (DefinedTerm etc.) | ❌ | Inexistent |
| Imagini OG dinamice | ❌ | Inexistente |
| llms.txt | ❌ | Inexistent |
| Canonical tags | ❌ | Inexistente |
| Structură AEO (definiție-first, H2 întrebări) | ❌ | Listă de carduri, H1-uri multiple |
| Internal linking / index alfabetic | ❌ | Inexistent |
| `lang` corect | ❌ | `<html lang="en">` pe un site RO |
| Fonturi optimizate (CWV) | ✅ | `next/font` self-hosted |

---

## 1. Crawlability & indexare

### robots.txt — ⚠️ parțial
**Locație:** [`app/robots.txt`](app/robots.txt) (fișier static, convenție App Router validă).

```
User-agent: Googlebot
Disallow: /contul-meu
Disallow: /report

User-agent: *
Disallow:
```

Probleme:
- ❌ **Niciun crawler AI menționat** (`GPTBot`, `ClaudeBot`, `Claude-SearchBot`, `PerplexityBot`, `Google-Extended`, `CCBot`, `Applebot-Extended`). Momentan sunt permise implicit prin `User-agent: *` — ceea ce e *bine* pentru AEO (vrei să te citeze), dar nu e o decizie explicită și nu poți controla granular.
- ❌ **Nu blochează zonele private/inutile pentru `*`:** `/api/`, `/admin`, `/moderator`, `/panou`, `/define`, `/conectare`, `/inregistrare`, `/recuperare-parola`, `/reset-password`, `/verify-email`, `/username`. `/api/definition` e crawlabil și returnează JSON brut — risipă de crawl budget și conținut duplicat.
- ❌ **Lipsește directiva `Sitemap:`** care să indice `https://.../sitemap.xml`.
- ⚠️ Regula pentru `Googlebot` **suprascrie** complet grupul `*` pentru Googlebot (robots.txt nu cumulează grupuri) — deci pentru Googlebot se aplică DOAR cele două `Disallow` de mai sus, nu și eventuale reguli viitoare din `*`. De reținut la refactor.

**Impact:** mediu-mare. Crawl budget irosit pe API/zone private; fără semnal de sitemap.

### sitemap.xml — ❌ lipsește (efectiv)
**Locație:** [`app/sitemap.ts`](app/sitemap.ts) — există, dar conține **doar** 3 URL-uri statice (`/`, `/termeni-si-conditii`, `/politica-de-confidentialitate`).

- ❌ Zero pagini de cuvinte (logic — nu există încă).
- ❌ Zero pagini de profil (`/profil/[username]` există dar nu e listată).
- ❌ `lastModified` = `new Date()` (momentul buildului), nu data reală a conținutului.
- ✅ Nu e nevoie de sitemap index încă: exportul DB are ~96 definiții; sub pragul de 50.000. Devine relevant abia la scară.

**Impact:** mare. Fără cuvinte în sitemap, descoperirea depinde 100% de linking intern (care și el lipsește).

### Rendering — ✅ OK (dar cu asterisc de performanță)
- ✅ [`Definition.tsx`](app/shared/Definition.tsx) e Server Component `async`; definițiile ajung în HTML-ul inițial (verificabil în view-source). **Acesta e cel mai important lucru care merge bine.**
- ⚠️ **Anti-pattern:** [`getWords()`](app/api/ServerActions.ts:68) face un **self-fetch HTTP** către propriul `/api/definition` cu `cache: "no-store"`. Serverul își face request la el însuși la fiecare afișare → TTFB dublat, o conexiune HTTP în plus, zero cache. Ar trebui să interogheze Mongo direct (funcție partajată) și să folosească ISR/`revalidate`.
- ⚠️ Totul e **dinamic pe fiecare request**; nimic nu e SSG/ISR. La scară, fiecare cuvânt re-lovește DB-ul.

**Impact:** conținut vizibil = ✅; performanță (LCP/TTFB) = ⚠️ (vezi §7).

### Canonical & duplicate — ❌ lipsește
- ❌ Niciun `<link rel="canonical">` nicăieri.
- ❌ Fără strategie pentru duplicate: `/?query=X`, `/?query=x`, `/?query=X&page=2&popularity=2` produc conținut suprapus fără canonical care să le colapseze.
- ⚠️ Când vor exista pagini de cuvânt: trebuie o singură formă canonică a slug-ului (fără diacritice, lowercase) + redirect 301 de la variante.

### Status codes — ⚠️ parțial
- ✅ `/profil/[username]` folosește corect `notFound()` → 404 real ([`profil/[username]/not-found.tsx`](app/(withNav)/profil/[username]/not-found.tsx)).
- ✅ Redirecturi 301 configurate în [`next.config.mjs`](next.config.mjs) (`/tos`, `/dashboard` etc.).
- ❌ Un cuvânt inexistent nu dă 404 — dă `/?query=inexistent` cu „Astea au fost toate definițiile" și **status 200**. Google indexează asta ca soft-404.

---

## 2. Metadata per pagină

Status general: ❌. Singura metadata reală e globală și generică.

**Locații:** [`app/layout.tsx:22`](app/layout.tsx) și, duplicat, [`app/(withNav)/layout.tsx`](app/(withNav)/layout.tsx):
```ts
title: "Dicționar urban",
description: "Dicționarul urban a limbii române",
```
(Notă: „Dicționarul urban **a** limbii române" — ar trebui „**al** limbii române". Greșeală gramaticală în singura descriere existentă.)

| Element | Status | Observație |
|---|---|---|
| `<title>` unic/cuvânt | ❌ | Toate paginile moștenesc „Dicționar urban". Zero unicitate. |
| Meta description unică | ❌ | Una singură, globală, greșită gramatical. |
| Open Graph (og:title/description/image/url/type/locale) | ❌ | **Complet absent.** |
| Twitter Cards | ❌ | Absent. |
| `og:locale=ro_RO` | ❌ | Absent; în plus `<html lang="en">`. |
| Hreflang ro-MD/ro-RO | ❌ | Absent. **Recomandare:** nu e strict necesar (o singură limbă, RO). Un singur `lang="ro"` + `og:locale=ro_RO` e suficient. Nu complica cu hreflang. |

- ✅ Excepție parțială: [`profil/[username]/page.tsx`](app/(withNav)/profil/[username]/page.tsx) are `generateMetadata` cu titlu/descriere dinamice — **bun model de urmat**, dar și el fără OG/Twitter/canonical.

**Impact:** critic. Fără title/description unice, nicio pagină nu poate rankui pentru termeni specifici; fără OG, fiecare share arată gol.

---

## 3. Date structurate (Schema.org / JSON-LD) — ❌ complet absent

Zero `<script type="application/ld+json">` în tot codebase-ul.

| Schema | Status | Unde ar trebui |
|---|---|---|
| `DefinedTerm` + `DefinedTermSet` | ❌ | Pe fiecare (viitoare) pagină de cuvânt — schema corectă pentru dicționar |
| `WebSite` + `SearchAction` | ❌ | Homepage — activează sitelinks search box |
| `BreadcrumbList` | ❌ | Acasă → Literă → Cuvânt |
| `Organization` | ❌ | Homepage |
| `FAQPage` / `Question`-`Answer` | ❌ | Opțional, pe pagina de cuvânt („Ce înseamnă X?") |

**Impact:** mare pentru AEO + rich results. `DefinedTerm` e semnalul explicit prin care Google și LLM-urile înțeleg „aceasta e o definiție de dicționar pentru termenul X". Absența lui = ratezi rich results și scazi șansa de citare AI.

---

## 4. AEO / GEO — optimizare pentru chatboturi & AI Overviews — ❌ în mare parte

| Criteriu | Status | Observație |
|---|---|---|
| Primul paragraf = definiție directă citabilă | ❌ | Homepage e o listă de carduri; nu există „**[Cuvânt]** înseamnă…" ca prim element citabil pe un URL dedicat. |
| Heading-uri în format întrebare (`<h2>Ce înseamnă X?</h2>`) | ❌ | Nu există. |
| `llms.txt` la rădăcină | ❌ | Absent. |
| Semnale de autoritate (dată publicare/actualizare, autor, moderare, „Despre") | ⚠️ | Există autor (`username`) + dată (string) afișate; **există** politică de conținut (termeni + confidențialitate) și moderare (rute `/moderator`, `hidden`). Lipsește o pagină „Despre" solidă și data în format machine-readable / schema. |
| HTML semantic (`<article>`, `<dfn>`, `<dl>/<dt>/<dd>`) | ❌ | Cardurile sunt `<div>`-uri; definiția e `<p>`. Zero `<article>`/`<dfn>`/`<dl>`. |
| Structură heading | ❌ | **H1 multiplu:** [`TopSection.tsx`](app/shared/TopSection.tsx) are 2× `<h1>`, iar [`Definition.tsx:63`](app/shared/Definition.tsx) pune `<h1>` pe *fiecare* card de cuvânt → o pagină cu 7 `<h1>`. Anti-pattern SEO clasic. |
| Prezență deja în răspunsuri AI | ❓ | De verificat manual (vezi strategia mai jos). Realist: aproape sigur absent, fiind neindexabil. |

**Strategie de autoritate (recomandare, pentru follow-up):**
1. Structura de URL per-cuvânt + `DefinedTerm` (precondiție pentru orice).
2. `llms.txt` care descrie platforma și pattern-ul de URL (`/cuvant/[slug]`).
3. Intrare **Wikidata** pentru „DexUrban" (entitate) — LLM-urile se ancorează puternic pe Wikidata.
4. Backlink-uri din surse citate frecvent de LLM-uri (presă tech RO/MD, Reddit r/Romania, forumuri). 2–3 mențiuni de presă la lansare.
5. IndexNow → Bing → alimentează ChatGPT Search.

**Impact:** critic pentru obiectivul #2 (citare de către AI).

---

## 5. Preview-uri de link (imagini OG dinamice) — ❌ complet absent

- ❌ Fără `@vercel/og` / `satori`. Fără nicio rută `opengraph-image`.
- ❌ Fără fallback OG image (nici măcar una statică). `public/` conține doar `favicon1.ico`, logo Google, sun/moon SVG.
- ❌ `Share.tsx` distribuie `/?query=` fără `og:image` → pe WhatsApp/Telegram/iMessage/Slack/Discord/X/Facebook linkul apare **fără imagine, fără titlu relevant**, doar URL gol. Cea mai vizibilă pierdere pentru creștere organică prin distribuire.

**Test mental (stare actuală):** toate platformele → preview gol/generic. Zero.

**Impact:** mare pentru obiectivul #3 (share bogat) și pentru CTR general.

---

## 6. Arhitectură & internal linking — ❌ în mare parte

### URL-uri
- ❌ Nu există `/cuvant/[slug]`. Structura actuală: `/?query=X&page=N&popularity=M`.
- ⚠️ **Slug & diacritice:** ai deja infrastructura de normalizare în [`lib/search.ts`](lib/search.ts) (`stripDiacritics`, potrivire insensibilă la diacritice ă/â/î/ș/ț). Perfect pentru a genera slug canonic (`Înghețată` → `inghetata`) și a rezolva variantele fără diacritice către forma canonică.
- ⚠️ **Un cuvânt = mai multe definiții.** Modelul [`wordModel`](models/wordModel.ts) stochează o definiție per document; același `word` apare în N documente. Pagina de cuvânt trebuie să **agrege toate definițiile** pentru un slug (model Urban Dictionary), sortate după `likes`. De gestionat și coliziunile de slug (cuvinte diferite care normalizează la același slug).

### Internal linking — ❌
- ❌ Fără index alfabetic (`/litera/a`).
- ❌ Fără pagini de categorii/tag-uri (modelul nici nu are câmp de tag/categorie).
- ❌ Fără „cuvinte înrudite/similare" pe pagini.
- ❌ Fără „cuvântul zilei" cu permalink.
- ❌ Fără „cele mai căutate/populare" ca hub linkabil.
- ✅ Există link către profilul autorului per definiție ([`Definition.tsx:68`](app/shared/Definition.tsx)) și paginile `/profil/[username]` — singurul internal linking real existent.
- ⚠️ Adâncime de crawl: momentan **orice cuvânt e la ∞ click-uri** (nu e linkat nicăieri, doar căutabil). Nefatal doar pentru că nu există pagini de cuvânt — dar la refactor, ținta e ≤3-4 click-uri prin index alfabetic + hub-uri.

### Paginare
- ⚠️ [`PaginationControls`](app/shared/PaginationControls.tsx) folosește `?page=N`. Fără `rel=next/prev` (deprecat de Google oricum) și fără URL-uri canonice per pagină. Acceptabil, dar paginile 2+ nu ar trebui să concureze canonicul.

### `<html lang>` — ❌
- [`app/layout.tsx:32`](app/layout.tsx): `<html lang="en">` pe un dicționar **de limba română**. Greșeală clară; trebuie `lang="ro"`.

### Inconsistență de domeniu — ⚠️
Trei forme diferite ale domeniului în cod:
- `https://www.dexurban.md` — [`sitemap.ts`](app/sitemap.ts), [`Share.tsx`](app/shared/Share.tsx)
- `https://dexurban.md` — fallback în [`ServerActions.ts:70`](app/api/ServerActions.ts)
- `NEXTAUTH_URL` (env) — bază pentru self-fetch

**Trebuie o singură formă canonică** (www vs non-www) + redirect 301 de la cealaltă. Altfel: conținut duplicat pe două host-uri.

---

## 7. Performanță (Core Web Vitals) — ⚠️ mixt

| Aspect | Status | Observație |
|---|---|---|
| Fonturi | ✅ | `next/font` (Unbounded, Space Grotesk) self-hosted, `display: swap`, `latin-ext` pentru diacritice, `variable` fonts → fără request blocant la Google Fonts, CLS redus. Bine făcut. |
| Imagini | ✅/N-A | Aproape fără imagini raster; logo-uri sunt SVG inline. `next/image` neutilizat (dar nici necesar acum). **Va conta** când apar OG images. |
| Rendering/TTFB | ⚠️ | Homepage `cache: "no-store"` + self-fetch → TTFB slab, LCP dependent de rundtrip-ul intern + DB la fiecare request. Fără ISR. |
| JS bundle / hydration | ⚠️ | De măsurat; multe componente `'use client'` (Autocomplete, Share, Actions, CookieConsent). Rezonabil, dar hidratarea listei + cookie banner pot afecta INP. |
| Cookie banner / terți | ⚠️ | [`CookieConsent`](app/shared/CookieConsent.tsx) e client, montat global în root layout. reCAPTCHA (`react-google-recaptcha`) e script terț — de încărcat doar pe formulare, nu global. Impact pe INP/LCP de măsurat cu date reale. |
| CLS | ✅ probabil | Fonturi cu fallback size-adjust; layout brutalist cu borduri fixe. |

**Recomandare:** măsurare reală cu PageSpeed Insights / CrUX după ce paginile de cuvânt există (acum nu are ce măsura per-cuvânt).

---

## Plan de implementare (Faza 2) — ordonat pe impact

### 🔴 Critice (fac diferența între „invizibil" și „indexabil")
1. **Rută nouă `/cuvant/[slug]`** — Server Component, agregă toate definițiile pentru slug, SSR + ISR (`revalidate`). Slug canonic din `stripDiacritics`. Redirect 301 de la variante fără diacritice / casing.
2. **`generateMetadata` per cuvânt** — title „[Cuvânt] — ce înseamnă [cuvânt] | DexUrban", description din prima definiție (~155 car.), `canonical`, OG + Twitter complete, `og:locale=ro_RO`.
3. **Sitemap dinamic** din DB — toate slug-urile unice + `/profil/*` + statice, cu `lastmod` real. `Sitemap:` în robots.
4. **robots.txt** rescris — Allow crawlere AI explicit, Disallow `/api/`, `/admin`, `/moderator`, `/panou`, auth; `Sitemap:`.
5. **`<html lang="ro">`** + domeniu canonic unic (www vs non-www) + redirect.
6. **404 real** pentru cuvinte inexistente.

### 🟠 Impact mare
7. **JSON-LD `DefinedTerm` + `DefinedTermSet`** pe pagina de cuvânt; `WebSite`+`SearchAction`, `Organization`, `BreadcrumbList`.
8. **Imagini OG dinamice** (`opengraph-image` cu `next/og`) — cuvânt mare + prima definiție trunchiată + branding, 1200×630, cache la edge. Plus fallback static.
9. **Structură AEO** — definiție-first citabilă, `<h2>Ce înseamnă X?</h2>`, `<h2>Exemple</h2>`; HTML semantic (`<article>`, `<dfn>`, `<dl>`); UN singur `<h1>` per pagină.
10. **`llms.txt`** la rădăcină.

### 🟡 Impact mediu
11. Internal linking — index alfabetic `/litera/[a]`, „cuvinte înrudite", „populare", „cuvântul zilei" cu permalink.
12. Breadcrumbs vizibile + schema.
13. Optimizări CWV — interogare Mongo directă (elimină self-fetch), ISR, reCAPTCHA lazy.

### ⚪ Follow-up (ghid pas cu pas pentru tine)
14. Google Search Console + Bing Webmaster Tools (verificare, submit sitemap).
15. IndexNow (indexare instant Bing → ChatGPT Search).
16. Wikidata + strategie backlink/presă.
17. Monitorizare index coverage.

---

## Note de confirmat înainte de Faza 2
- **Domeniu canonic:** `www.dexurban.md` sau `dexurban.md`? (Codul le amestecă.)
- **Câte definiții reale în producție** (exportul local are ~96; producția?) — determină dacă e nevoie de sitemap index și de streaming la generare.
- **Model conținut:** confirmăm pagină per-*cuvânt* care agregă toate definițiile (recomandat, tip Urban Dictionary), nu pagină per-*definiție*.
- Nicio modificare din Faza 2 nu va expune zone protejate de NextAuth ([`middleware.ts`](middleware.ts)) crawlerelor — dimpotrivă, le vom bloca explicit în robots.
