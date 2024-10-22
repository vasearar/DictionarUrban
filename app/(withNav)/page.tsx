import React from 'react'
import Definition from '../shared/Definition';
import TopSection from '../shared/TopSection';

export default async function page({searchParams}: {searchParams?: {
  query?: string;
  page?: string;
  popularity?: string;
};}){
  const query = searchParams?.query || "";
  const page = searchParams?.page ?? '1';
  const popularity = searchParams?.popularity ?? "1";
  return(
    <>
      <TopSection />
      <Definition query={query} page={page} popularity={popularity}/>
    </>
  );
}
