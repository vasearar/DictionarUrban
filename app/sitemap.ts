import type { MetadataRoute } from 'next'

const BASE_URL = 'https://www.dexurban.md'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: `${BASE_URL}/`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/termeni-si-conditii`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/politica-de-confidentialitate`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
}
