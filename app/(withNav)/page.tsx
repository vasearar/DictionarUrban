import React from 'react'
import Definition from '../shared/Definition';
import TopSection from '../shared/TopSection';
import DeleteLater from '../shared/DeleteLater';

export default async function page(){
  return(
    <>
      <TopSection />
      <Definition />
      <DeleteLater />
    </>
  );
}