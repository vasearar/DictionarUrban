import React from 'react'
import { redirect } from 'next/navigation';
import Definition from '../shared/Definition';
import TopSection from '../shared/TopSection';
import { getPublicProfile } from '@/lib/profile';

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
      <TopSection />
      <Definition query={query} page={page} popularity={popularity}/>
    </>
  );
}
