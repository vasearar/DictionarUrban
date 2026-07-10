import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// robots dinamic (înlocuiește robots.txt static).
// Strategie: conținutul public (cuvinte, profiluri) e complet crawlabil de
// motoare ȘI de crawlerele AI (le vrem să citeze definițiile). Blocăm zonele
// private/funcționale: API, autentificare, panouri, moderare, conturi.

const DISALLOW = [
  "/api/",
  "/admin",
  "/moderator",
  "/panou",
  "/define",
  "/contul-meu",
  "/report",
  "/conectare",
  "/inregistrare",
  "/recuperare-parola",
  "/reset-password",
  "/verify-email",
  "/verifying",
  "/confirmare-email",
  "/username",
];

// Crawlere AI pe care le permitem explicit (citare în ChatGPT, Claude,
// Perplexity, Gemini/AI Overviews, Apple Intelligence, Common Crawl).
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_BOTS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
