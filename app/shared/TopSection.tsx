import React from 'react';
import GoToDefinition from './GoToDefinition';

export default function TopSection() {
  return (
    <div className='mx-auto text-center px-6 text-nowrap'>
      <h1 className='text-5xl leading-tight mb-6 mt-8 font-bold'>Dicționar online pentru jargoane și argouri în<br />limba română</h1>
      <p className='font-Spacegrotesc text-lg mb-12'>DexUrban.ro este un dicționar online în limba română, creat de utilizatori,<br /> specializat în jargoane , argouri și expresii neconvenționale.</p>
      <div className='rounded-md mb-8 bg-mywhite mx-auto p-8 max-w-[720px] justify-center items-center border-2 border-mygray flex gap-16 relative mybigdropshadowrounded'>
        <h1 className="text-3xl">Tu scrii <span className='font-bold'>DexUrban.ro</span></h1>
        <GoToDefinition />
      </div>
    </div>
  );
}
