'use client'
import React from 'react'
import { FC } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationControlsProps {
  hasNextPage: boolean
  hasPrevPage: boolean
  end: number
}

const PaginationControls: FC<PaginationControlsProps> = (
  {
    hasNextPage,
    hasPrevPage,
    end,
  }
) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page') ?? '1')

  const numButtons = 5;
  const halfNumButtons = Math.floor(numButtons / 2);
  let startPage = Math.max(1, currentPage - halfNumButtons);
  let endPage = Math.min(end, currentPage + halfNumButtons);

  if (currentPage - halfNumButtons < 1) {
    endPage = Math.min(numButtons, end);
  }
  if (currentPage + halfNumButtons > end) {
    startPage = Math.max(1, end - numButtons + 1);
  }

  return (
    <>
      <div className='flex gap-2 justify-center mt-2'>     
        {[...Array(5)].map((_, index) => {
          const page = startPage + index;
          if (page > end) return null;
          return (
            <button
              key={page}
              className={`size-8 border-[1px] flex items-center justify-center border-mygray md:hover:bg-myhoverorange transition-all ${page === currentPage ? 'bg-myorange' : ''}`}
              onClick={() => {
                router.push(`/?page=${page}`)
              }}
            >
              {page}
            </button>
          );
        })}
      </div>
      <div className='flex gap-2 mt-2 justify-center items-center'>
        <button className='size-8 border-[1px] flex items-center justify-center border-mygray md:hover:bg-myhoverorange transition-all'
          disabled={!hasPrevPage}
          onClick={() => {
            router.push(`/?page=1`)
          }}>
          <span className="hidden">To first</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 17L8 17L8 15L10 15L10 17ZM10 17L12 17L12 19L10 19L10 17ZM10 7L8 7L8 9L10 9L10 7ZM10 7L12 7L12 5L10 5L10 7Z" fill="#202020"/>
            <path d="M8 13L8 15L6 15L6 13L4 13L4 11L6 11L6 9L8 9L8 11L6 11L6 13L8 13Z" fill="#202020"/>
            <path d="M17 17L15 17L15 15L17 15L17 17ZM17 17L19 17L19 19L17 19L17 17ZM17 7L15 7L15 9L17 9L17 7ZM17 7L19 7L19 5L17 5L17 7Z" fill="#202020"/>
            <path d="M15 13L15 15L13 15L13 13L11 13L11 11L13 11L13 9L15 9L15 11L13 11L13 13L15 13Z" fill="#202020"/>
          </svg>
        </button>

        <button className='size-8 border-[1px] flex items-center justify-center border-mygray md:hover:bg-myhoverorange transition-all'
          disabled={!hasPrevPage}
          onClick={() => {
            router.push(`/?page=${Math.max(currentPage - 1, 1)}`)
          }}>
          <span className="hidden">one to the back</span>  
          <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 8L16 6L4 6L4 4L2 4L2 6L1.04907e-06 6L7.86805e-07 8L2 8L2 10L4 10L4 8L16 8ZM6 12L4 12L4 10L6 10L6 12ZM6 12L8 12L8 14L6 14L6 12ZM6 2L4 2L4 4L6 4L6 2ZM6 2L8 2L8 -8.58275e-07L6 -1.12054e-06L6 2Z" fill="#202020"/>
          </svg>
        </button>

        <button className='size-8 border-[1px] flex items-center justify-center border-mygray md:hover:bg-myhoverorange transition-all'
          disabled={!hasNextPage}
          onClick={() => {
            router.push(`/?page=${Math.min(currentPage + 1, end)}`)
          }}>
          <span className="hidden">Next one</span>  
          <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg" className='rotate-180'>
            <path d="M16 8L16 6L4 6L4 4L2 4L2 6L1.04907e-06 6L7.86805e-07 8L2 8L2 10L4 10L4 8L16 8ZM6 12L4 12L4 10L6 10L6 12ZM6 12L8 12L8 14L6 14L6 12ZM6 2L4 2L4 4L6 4L6 2ZM6 2L8 2L8 -8.58275e-07L6 -1.12054e-06L6 2Z" fill="#202020"/>
          </svg>
        </button>

        <button className='size-8 border-[1px] flex items-center justify-center border-mygray md:hover:bg-myhoverorange transition-all'
          disabled={!hasNextPage}
          onClick={() => {
            router.push(`/?page=${end - 3}`)
          }}>
          <span className="hidden">To the end</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='rotate-180'>
            <path d="M10 17L8 17L8 15L10 15L10 17ZM10 17L12 17L12 19L10 19L10 17ZM10 7L8 7L8 9L10 9L10 7ZM10 7L12 7L12 5L10 5L10 7Z" fill="#202020"/>
            <path d="M8 13L8 15L6 15L6 13L4 13L4 11L6 11L6 9L8 9L8 11L6 11L6 13L8 13Z" fill="#202020"/>
            <path d="M17 17L15 17L15 15L17 15L17 17ZM17 17L19 17L19 19L17 19L17 17ZM17 7L15 7L15 9L17 9L17 7ZM17 7L19 7L19 5L17 5L17 7Z" fill="#202020"/>
            <path d="M15 13L15 15L13 15L13 13L11 13L11 11L13 11L13 9L15 9L15 11L13 11L13 13L15 13Z" fill="#202020"/>
          </svg>
        </button>
      </div>
    </>
  )
}

export default PaginationControls
