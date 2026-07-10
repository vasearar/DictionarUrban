import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllWordSlugs } from "@/lib/words";

// Sitemap dinamic. Regenerat periodic (ISR) ca noile cuvinte să apară fără
// rebuild. Sub 50.000 URL-uri → un singur fișier e suficient; la scară mai mare
// se segmentează într-un sitemap index.
export const revalidate = 3600; // 1h

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE_URL}/termeni-si-conditii`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/politica-de-confidentialitate`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let wordRoutes: MetadataRoute.Sitemap = [];
  try {
    const words = await getAllWordSlugs();
    wordRoutes = words.map(({ slug, lastmod }) => ({
      url: `${SITE_URL}/cuvant/${slug}`,
      lastModified: lastmod ? new Date(lastmod) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    // Sitemap-ul nu trebuie să pice buildul/răspunsul dacă DB e indisponibil.
    console.error("sitemap: nu am putut încărca cuvintele", error);
  }

  return [...staticRoutes, ...wordRoutes];
}
