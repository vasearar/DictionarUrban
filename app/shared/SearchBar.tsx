"use client"
import React, { useState, useEffect } from 'react';

const SearchBar = () => {
  const [placeholder, setPlaceholder] = useState("Caută un cuvânt sau o frază");

  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia("(max-width: 1535px)").matches) {
        setPlaceholder("Caută");
      } else {
        setPlaceholder("Caută un cuvânt sau o frază");
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <form id='searchForm'
          action="" 
          className='rounded-sm border-mygray bg-mywhite border-solid border-2 flex items-center px-4 py-[10px] gap-2 h-[48px] w-[175px] 2xl:w-[20vw] relative mydropshadow'>
          <button type='submit' form='searchForm'>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.125 4.52173H2.82337V2.82337H4.52173V1.125H9.9565V2.82337H11.6549V4.52173H13.3532V9.61683H11.6549V11.3152H13.3532V13.0136H15.0516V14.7119H16.75V16.4103H15.0516V14.7119H13.3532V13.0136H11.6549V11.3152H9.9565V13.0136H4.52173V11.3152H2.82337V9.61683H1.125V4.52173Z" fill="#202020"/>
              <path d="M9.95638 2.8125H4.52161V4.51087H2.82324V9.60597H4.52161V11.3043H9.95638V9.60597H11.6547V4.51087H9.95638V2.8125Z" fill="#F1F1F1"/>
              <path d="M9.95635 5.85869V4.5H8.59766V5.85869H9.95635Z" fill="#202020"/>
            </svg>
          </button>
          <input className='font-Spacegrotesc bg-transparent focus:outline-none w-full'
                type="text" 
                placeholder={placeholder}
          />
    </form>
  );
}

export default SearchBar;
