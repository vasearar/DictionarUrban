import React from 'react'
import Definition from '../shared/Definition';
import TopSection from '../shared/TopSection';

export default async function Page({ searchParams }: { searchParams?: Promise<{
  query?: string;
  page?: string;
  popularity?: string;
}> }) {
  const params = searchParams ? await searchParams : {};

  const query = params.query || "";
  const page = params.page ?? '1';
  const popularity = params?.popularity ?? "1";
  return(
    <>
      <TopSection />
      <Definition query={query} page={page} popularity={popularity}/>
    </>
  );
}
