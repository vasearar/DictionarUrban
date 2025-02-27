'use server'
import React from 'react'
import Links from './Links';
import SearchBar from './SearchBar';
import Link from 'next/link';

export default async function NavBar() {
  return (
  <>
    <nav id='nav' className="flex text-base h-fit items-center lg:justify-between w-full px-3 lg:px-0 lg:w-fit relative mx-auto py-7">
      <div className='flex w-full lg:w-auto'>
        <Link href={"/"} id="logo" className="lg:flex hidden flex-col text-base font-Unbounded font-bold mr-8">
          <p className='text-myorange'>Dex</p>
          <p className=''>Urban.md</p>
        </Link>
        <Link href={"/"} id="logo" className="flex flex-col text-base justify-center lg:hidden font-Unbounded font-bold mr-8" aria-label="dicționar urban">
          <svg width="0" height="0" className='md:size-14 size-8' viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_344_737)">
            <rect x="0.25" y="0.25" width="31.5" height="31.5" rx="15.75" fill="#202020" stroke="#F1F1F1" strokeWidth="0.5"/>
            <path d="M8.72 11C9.16333 11 9.55167 11.0783 9.885 11.235C10.2217 11.3883 10.4817 11.6067 10.665 11.89C10.8517 12.17 10.945 12.4983 10.945 12.875C10.945 13.2517 10.8517 13.5817 10.665 13.865C10.4817 14.145 10.2217 14.3633 9.885 14.52C9.55167 14.6733 9.16333 14.75 8.72 14.75H6.85V11H8.72ZM7.88 14.315L7.385 13.83H8.8C9.02333 13.83 9.21667 13.7917 9.38 13.715C9.54667 13.635 9.675 13.5233 9.765 13.38C9.855 13.2367 9.9 13.0683 9.9 12.875C9.9 12.6783 9.855 12.51 9.765 12.37C9.675 12.2267 9.54667 12.1167 9.38 12.04C9.21667 11.96 9.02333 11.92 8.8 11.92H7.385L7.88 11.435V14.315ZM13.0644 14.83C12.7177 14.83 12.4077 14.7667 12.1344 14.64C11.8644 14.5133 11.651 14.3367 11.4944 14.11C11.3377 13.88 11.2594 13.6133 11.2594 13.31C11.2594 13.0133 11.3344 12.7533 11.4844 12.53C11.6344 12.3033 11.8394 12.1267 12.0994 12C12.3627 11.8733 12.6594 11.81 12.9894 11.81C13.3327 11.81 13.6244 11.885 13.8644 12.035C14.1077 12.1817 14.2944 12.39 14.4244 12.66C14.5577 12.93 14.6244 13.2483 14.6244 13.615H12.0844V13H14.0494L13.7144 13.215C13.701 13.0683 13.6644 12.945 13.6044 12.845C13.5444 12.7417 13.4644 12.6633 13.3644 12.61C13.2677 12.5567 13.151 12.53 13.0144 12.53C12.8644 12.53 12.736 12.56 12.6294 12.62C12.5227 12.68 12.4394 12.7633 12.3794 12.87C12.3194 12.9733 12.2894 13.095 12.2894 13.235C12.2894 13.415 12.3294 13.5683 12.4094 13.695C12.4927 13.8183 12.6127 13.9133 12.7694 13.98C12.9294 14.0467 13.1244 14.08 13.3544 14.08C13.5644 14.08 13.7727 14.0533 13.9794 14C14.1894 13.9433 14.3794 13.865 14.5494 13.765V14.415C14.3527 14.5483 14.1277 14.6517 13.8744 14.725C13.6244 14.795 13.3544 14.83 13.0644 14.83ZM14.6041 14.75L15.9291 13.15L15.9241 13.45L14.6791 11.895H15.8141L16.6191 12.88H16.3191L17.1241 11.895H18.2441L16.9541 13.46L16.9041 13.055L18.3241 14.75H17.1641L16.2891 13.695H16.6091L15.7441 14.75H14.6041Z" fill="#E86842"/>
            <path d="M7.835 19.075C7.835 19.245 7.86667 19.3933 7.93 19.52C7.99667 19.6433 8.09333 19.7383 8.22 19.805C8.35 19.8717 8.50833 19.905 8.695 19.905C8.885 19.905 9.04333 19.8717 9.17 19.805C9.29667 19.7383 9.39167 19.6433 9.455 19.52C9.51833 19.3933 9.55 19.245 9.55 19.075V17H10.59V19.125C10.59 19.4683 10.51 19.7683 10.35 20.025C10.1933 20.2783 9.97333 20.4767 9.69 20.62C9.40667 20.76 9.075 20.83 8.695 20.83C8.31833 20.83 7.98667 20.76 7.7 20.62C7.41667 20.4767 7.195 20.2783 7.035 20.025C6.87833 19.7683 6.8 19.4683 6.8 19.125V17H7.835V19.075ZM11.0005 17.895H12.0405L12.2105 18.915V20.75H11.1905V18.855L11.0005 17.895ZM13.5505 17.85V18.72C13.4505 18.7 13.3555 18.6867 13.2655 18.68C13.1788 18.67 13.0988 18.665 13.0255 18.665C12.8788 18.665 12.7438 18.695 12.6205 18.755C12.4971 18.8117 12.3971 18.9067 12.3205 19.04C12.2471 19.1733 12.2105 19.3517 12.2105 19.575L12.0155 19.335C12.0421 19.1283 12.0821 18.935 12.1355 18.755C12.1888 18.5717 12.2605 18.41 12.3505 18.27C12.4438 18.1267 12.5588 18.015 12.6955 17.935C12.8321 17.8517 12.9988 17.81 13.1955 17.81C13.2521 17.81 13.3105 17.8133 13.3705 17.82C13.4305 17.8267 13.4905 17.8367 13.5505 17.85ZM13.8991 16.9H14.9241V18.725L14.7891 18.985V19.705L14.9241 19.955V20.75H13.8991V16.9ZM14.5941 19.325C14.6408 19.015 14.7325 18.7483 14.8691 18.525C15.0058 18.2983 15.1808 18.1233 15.3941 18C15.6108 17.8733 15.8525 17.81 16.1191 17.81C16.3991 17.81 16.6441 17.8733 16.8541 18C17.0675 18.1267 17.2325 18.3033 17.3491 18.53C17.4691 18.7567 17.5291 19.0217 17.5291 19.325C17.5291 19.6217 17.4691 19.885 17.3491 20.115C17.2325 20.3417 17.0675 20.5183 16.8541 20.645C16.6441 20.7683 16.3991 20.83 16.1191 20.83C15.8491 20.83 15.6075 20.7683 15.3941 20.645C15.1808 20.5183 15.0058 20.3417 14.8691 20.115C14.7325 19.8883 14.6408 19.625 14.5941 19.325ZM16.4991 19.325C16.4991 19.1817 16.4691 19.055 16.4091 18.945C16.3525 18.835 16.2725 18.7483 16.1691 18.685C16.0658 18.6217 15.9458 18.59 15.8091 18.59C15.6725 18.59 15.5425 18.6217 15.4191 18.685C15.2958 18.7483 15.1875 18.835 15.0941 18.945C15.0008 19.055 14.9291 19.1817 14.8791 19.325C14.9291 19.465 15.0008 19.59 15.0941 19.7C15.1875 19.81 15.2958 19.8967 15.4191 19.96C15.5425 20.02 15.6725 20.05 15.8091 20.05C15.9458 20.05 16.0658 20.02 16.1691 19.96C16.2725 19.8967 16.3525 19.81 16.4091 19.7C16.4691 19.59 16.4991 19.465 16.4991 19.325ZM20.5514 20.75L20.4214 19.72L20.5564 19.325L20.4214 18.93L20.5514 17.895H21.6114L21.4314 19.32L21.6114 20.75H20.5514ZM20.7914 19.325C20.7447 19.625 20.6514 19.8883 20.5114 20.115C20.3747 20.3417 20.1997 20.5183 19.9864 20.645C19.7764 20.7683 19.5364 20.83 19.2664 20.83C18.9864 20.83 18.7397 20.7683 18.5264 20.645C18.3164 20.5183 18.1514 20.3417 18.0314 20.115C17.9114 19.885 17.8514 19.6217 17.8514 19.325C17.8514 19.0217 17.9114 18.7567 18.0314 18.53C18.1514 18.3033 18.3164 18.1267 18.5264 18C18.7397 17.8733 18.9864 17.81 19.2664 17.81C19.5364 17.81 19.7764 17.8733 19.9864 18C20.1997 18.1233 20.3764 18.2983 20.5164 18.525C20.6564 18.7483 20.7481 19.015 20.7914 19.325ZM18.8864 19.325C18.8864 19.465 18.9147 19.59 18.9714 19.7C19.0314 19.81 19.1131 19.8967 19.2164 19.96C19.3197 20.02 19.4381 20.05 19.5714 20.05C19.7114 20.05 19.8431 20.02 19.9664 19.96C20.0897 19.8967 20.1981 19.81 20.2914 19.7C20.3847 19.59 20.4547 19.465 20.5014 19.325C20.4547 19.1817 20.3847 19.055 20.2914 18.945C20.1981 18.835 20.0897 18.7483 19.9664 18.685C19.8431 18.6217 19.7114 18.59 19.5714 18.59C19.4381 18.59 19.3197 18.6217 19.2164 18.685C19.1131 18.7483 19.0314 18.835 18.9714 18.945C18.9147 19.055 18.8864 19.1817 18.8864 19.325ZM21.9673 17.895H22.9923L23.1773 19.035V20.75H22.1573V18.88L21.9673 17.895ZM24.2273 17.81C24.5006 17.81 24.7339 17.865 24.9273 17.975C25.1206 18.085 25.2673 18.24 25.3673 18.44C25.4706 18.64 25.5223 18.8767 25.5223 19.15V20.75H24.5023V19.3C24.5023 19.0867 24.4473 18.9233 24.3373 18.81C24.2306 18.6967 24.0756 18.64 23.8723 18.64C23.7323 18.64 23.6089 18.67 23.5023 18.73C23.3989 18.79 23.3189 18.875 23.2623 18.985C23.2056 19.095 23.1773 19.225 23.1773 19.375L22.8623 19.21C22.9023 18.9067 22.9873 18.6517 23.1173 18.445C23.2473 18.235 23.4073 18.0767 23.5973 17.97C23.7873 17.8633 23.9973 17.81 24.2273 17.81Z" fill="#F1F1F1"/>
            </g>
            <defs>
            <clipPath id="clip0_344_737">
            <rect width="32" height="32" fill="white"/>
            </clipPath>
            </defs>
            </svg>
        </Link>
        <SearchBar />
      </div>
      <Links />
    </nav>
  </>
  )
}