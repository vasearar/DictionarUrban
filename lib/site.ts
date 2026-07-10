// Domeniul canonic al site-ului. O SINGURĂ sursă de adevăr pentru URL-uri
// absolute (canonical, Open Graph, sitemap, robots, JSON-LD). www e forma
// canonică aleasă; non-www trebuie redirecționat 301 la nivel de DNS/host.
export const SITE_URL = "https://www.dexurban.md";

export const SITE_NAME = "DexUrban.md";

/** Construiește un URL absolut pornind de la un path relativ ("/cuvant/x"). */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
