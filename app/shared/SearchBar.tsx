'use client'
import React, { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import Autocomplete, { Suggestion } from './Autocomplete';

const SearchBar = () => {
  const [placeholder, setPlaceholder] = useState("Caută un cuvânt sau o frază");

  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia("((min-width: 1024px) and (max-width: 1535px)), (max-width: 460px)").matches) {
        setPlaceholder("Caută");
      } else {
        setPlaceholder("Caută un cuvânt sau o frază");
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('query')?.toString() || "";
  const [term, setTerm] = useState(query);
  const { replace, push } = useRouter();

  useEffect(() => {
    setTerm(query);
  }, [query]);

  function runSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('query', value);
    } else {
      params.delete('query');
    }
    params.set('page', '1');
    // Pagina de profil nu are rezultate de căutare — căutările pornesc de pe home.
    const target = pathname.startsWith('/profil') ? '/' : pathname;
    replace(`${target}?${params.toString()}`);
  }

  async function fetchSuggestions(q: string, signal: AbortSignal): Promise<Suggestion[]> {
    const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`, { signal, cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.suggestions ?? [];
  }

  function onSelect(s: Suggestion) {
    // Utilizator → deschide profilul lui. Cuvânt/definiție → caută cuvântul.
    if (s.type === 'user') {
      setTerm(`@${s.label}`);
      push(`/profil/${encodeURIComponent(s.label)}`);
      return;
    }
    setTerm(s.label);
    runSearch(s.label);
  }

  return (
    <Autocomplete
      value={term}
      onChange={setTerm}
      onSelect={onSelect}
      onSubmit={runSearch}
      fetchSuggestions={fetchSuggestions}
      placeholder={placeholder}
      ariaLabel="Caută un cuvânt, o frază sau un utilizator"
      className={`mydropshadow my-auto rounded-sm border-mygray bg-mywhite border-solid border-2 flex items-center px-4 py-[10px] gap-2 h-8 md:h-[48px] w-full lg:w-44 2xl:w-[20vw] relative`}
      inputClassName='font-Spacegrotesc bg-transparent focus:outline-none w-full'
      leading={
        <button type='submit' aria-label="Submit form">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M1.82324 3.52173H0.125V8.61683H1.82337V10.3152H3.52173V12.0136H8.9565V10.3152H10.6549V12.0136H12.3532V13.7119H14.0516V15.4103H15.75V13.7119H14.0516V12.0136H12.3532V10.3152H10.6549V8.61683H12.3532V3.52173H10.6549V1.82337H8.9565V0.125H3.52173V1.8125H8.95638V3.51087H10.6547V8.60597H8.95638V10.3043H3.52161V8.60597H1.82324V3.52173ZM1.82337 3.51087H3.52161V1.82337H1.82337V3.51087Z" fill="#202020"/>
          </svg>
        </button>
      }
    />
  );
}

export default SearchBar;
