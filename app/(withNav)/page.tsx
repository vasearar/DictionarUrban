import React from 'react'
import Definition from '../shared/Definition';
import TopSection from '../shared/TopSection';
import DeleteLater from '../shared/DeleteLater';

export default async function page({searchParams}: {searchParams?: {
  query?: string;
  page?: string;
};}){
  const query = searchParams?.query || "";
  return(
    <>
      <TopSection />
      <Definition query={query} />
      <DeleteLater />
    </>
  );
}
