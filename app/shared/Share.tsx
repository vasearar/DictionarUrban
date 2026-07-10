'use client'
import React from 'react'
import { slugify } from '@/lib/search'
import { SITE_URL } from '@/lib/site'

interface ShareProps{
  query: string;
}

const Share:React.FC<ShareProps> = ({query}) => {

  // Distribuim URL-ul canonic al cuvântului (cu metadata + OG image proprie),
  // nu vechiul /?query= care ducea la o pagină fără preview.
  const shareData = {
    title: `${query} — ce înseamnă ${query}?`,
    text: `Vezi ce înseamnă „${query}” pe DexUrban.md`,
    url: `${SITE_URL}/cuvant/${slugify(query)}`,
  };

  async function handleClick(){
    try {
      await navigator.share(shareData);
    } catch (err) {
      return;
    }
  }

  return (
    <div className='z-10'>
      <button onClick={handleClick} aria-label="Distribuie definiția" className='border-2 border-mygray relative rounded-sm px-5 bg-mywhite hover:bg-myhoverorange py-2 mydropshadow'>
        <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_1121_26)">
            <path d="M11 17H13L13 4L15 4V2L13 2V0L11 0V2L9 2V4L11 4L11 17ZM7 6L7 4H9V6L7 6ZM7 6L7 8H5V6H7ZM17 6V4H15L15 6H17ZM17 6V8L19 8V6L17 6Z" fill="#202020"/>
            <path d="M1.59524 21.686H0.5L0.500004 13.5H1.59524L1.59524 21.686ZM21.4048 22.6859V23.5L2.59524 23.5V22.686L21.4048 22.6859ZM22.4048 21.6859L22.4048 13.5H23.5L23.5 21.6859H22.4048Z" fill="#202020" stroke="#202020"/>
          </g>
          <defs>
            <clipPath id="clip0_1121_26">
              <rect width="24" height="24" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      </button>
      </div>

  )
}

export default Share
