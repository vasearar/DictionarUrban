import React from 'react';
import GoToDefinition from './GoToDefinition';

export default async function TopSection() {
  return (
    <div className='mx-auto text-center px-3 md:px-8'>
      <h1 className='text-2xl md:text-5xl leading-tight mb-6 mt-8 font-bold'>Dicționar online de jargoane și argouri în<br />limba română</h1>
      <p className='font-Spacegrotesc text-base lg:text-lg mb-12'>DexUrban.md este un dicționar online în limba română, creat de utilizatori,<br /> specializat în jargoane , argouri și expresii neconvenționale.</p>
      <div className='rounded-md text-nowrap mb-8 bg-mywhite mx-auto px-3 pt-3 pb-7 lg:p-8 max-w-[720px] justify-center flex-col lg:flex-row items-center border-2 border-mygray flex gap-4 lg:gap-16 relative mybigdropshadowrounded'>
        <h1 className="text-lg im:text-2xl lg:text-3xl">Tu scrii <span className='font-bold'>DexUrban.md</span></h1>
        <GoToDefinition />
      </div>
    </div>
  );
}
