import React from 'react'
import Definition from '../shared/Definition';
import TopSection from '../shared/TopSection';
import DeleteLater from '../shared/DeleteLater';
import { Suspense } from 'react'

export default async function page({searchParams}: {searchParams?: {
  query?: string;
  page?: string;
};}){
  const query = searchParams?.query || "";
  const page = searchParams?.page ?? '1';
  return(
    <>
      <TopSection />
      <Definition query={query} page={page}/>
      <DeleteLater />
    </>
  );
}
