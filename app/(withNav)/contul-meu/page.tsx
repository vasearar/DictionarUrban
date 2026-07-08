import DashDef from '@/app/shared/DashDef'
import DashboardInfo from '@/app/shared/DashboardInfo'
import React from 'react' 
import { Suspense } from 'react'

export default async function Definition(){
  return (
    <>
      <DashboardInfo />
      <Suspense>
        <DashDef />
      </Suspense>
    </>
   
  )
}
