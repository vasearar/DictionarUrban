import Link from 'next/link'
import React from 'react'

const GoToDefinition = () => {
  return (
    <div className='z-10'>
      <Link className='bg-myorange hover:bg-myhoverorange relative font-bold text-mywhite font-Spacegrotesc border-2 px-4 py-[0.625rem] border-mygray rounded-sm mydropshadow' href="/define">Definește un cuvânt</Link>
    </div>
  )
}

export default GoToDefinition