import React from 'react'
import { redirect } from 'next/navigation';
import Definition from '../shared/Definition';
import TopSection from '../shared/TopSection';
import RandomWord from '../shared/RandomWord';
import { getPublicProfile } from '@/lib/profile';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// JSON-LD pentru homepage: WebSite + SearchAction (activează sitelinks search
// box în Google) și Organization (semnal de autoritate/identitate pentru Google
// și LLM-uri — ține locul unei pagini „Despre" separate).
const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "ro",
      description:
        "Dicționar online de jargoane și argouri în limba română, creat de utilizatori.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?query={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon1.ico`,
      description:
        "DexUrban.md este un dicționar online în limba română, creat de utilizatori, specializat în jargoane, argouri și expresii neconvenționale.",
    },
  ],
};

export default async function Page({ searchParams }: { searchParams?: Promise<{
  query?: string;
  page?: string;
  popularity?: string;
}> }) {
  const params = searchParams ? await searchParams : {};

  const query = params.query || "";

  // Căutarea "@nume" duce la profilul public dacă userul există;
  // altfel cade pe căutarea obișnuită (empty-state / linkuri vechi).
  if (query.startsWith("@") && query.slice(1).trim()) {
    const profile = await getPublicProfile(query.slice(1).trim());
    if (profile) redirect(`/profil/${encodeURIComponent(profile.username)}`);
  }

  const page = params.page ?? '1';
  const popularity = params?.popularity ?? "1";
  return(
    <>
      {/* JSON-LD doar pe homepage-ul canonic (fără căutare activă). */}
      {!query && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
        />
      )}
      <TopSection />
      {/* Butonul random doar pe homepage-ul canonic (fără căutare activă). */}
      {!query && <RandomWord />}
      <Definition query={query} page={page} popularity={popularity}/>
    </>
  );
}
