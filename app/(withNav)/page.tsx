import React from 'react';
import Definition from '../shared/Definition';
import TopSection from '../shared/TopSection';

export default async function page({ searchParams }: { searchParams?: Promise<{ query?: string; page?: string; popularity?: string }> }) {
  const resolvedParams = await searchParams;
  
  const query = resolvedParams?.query || "";
  const page = resolvedParams?.page ?? '1';
  const popularity = resolvedParams?.popularity ?? "1";
  
  return (
    <>
      <TopSection />
      <Definition query={query} page={page} popularity={popularity} />
    </>
  );
}
