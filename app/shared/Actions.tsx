import React from 'react'

const Actions = () => {
  return (
    <div className='flex justify-between mt-6'>
      <div className='z-10'>
        <button className='border-2 border-mygray bg-mywhite md:hover:bg-myhoverorange rounded-sm py-2 px-5 flex gap-1 items-center relative mydropshadow'>
          <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 0H4V2H2V4H0V10H2V12H4V14H6V16H8V18H10V20H12V18H14V16H16V14H18V12H20V10H22V4H20V2H18V0H14V2H12V4H10V2H8V0ZM8 2V4H10V6H12V4H14V2H18V4H20V10H18V12H16V14H14V16H12V18H10V16H8V14H6V12H4V10H2V4H4V2H8Z" fill="#E86842"/>
            <path d="M10 4V6H12V4H14V2H18V4H20V10H18V12H16V14H14V16H12V18H10V16H8V14H6V12H4V10H2V4H4V2H8V4H10Z" fill="#E86842"/>
          </svg>
          0
        </button>
      </div>  
      <div className='z-10'>
        <button className='border-2 border-mygray bg-mywhite md:hover:bg-myhoverorange relative rounded-sm py-2 px-5 mydropshadow'>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.71429 18.8571V17.1429H0V1.71429H1.71429V0H22.2857V1.71429H24V17.1429H22.2857V18.8571H12H10.2857V20.5714H8.57143V22.2857H6.85714V24H5.14286V22.2857V20.5714V18.8571H1.71429Z" fill="#E86842"/>
            <path d="M11 11.5714V3H13V11.5714H11Z" fill="#202020"/>
            <path d="M13 13.2857H11V15H13V13.2857Z" fill="#202020"/>
          </svg>
        </button> 
      </div>
      
    </div>
  )
}

export default Actions