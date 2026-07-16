import React from "react";
import Actions from "./Actions";
import PaginationControls from "./PaginationControls";
import Filters from "./Filters";
import Share from "./Share";
import Link from "next/link";
import {
  slugify,
  getWordsPage,
  sortFromPopularity,
  WORDS_PER_PAGE,
  type WordDefinition,
} from "@/lib/words";

function text(aux: string, ver: string) {
  const transformToArr = aux.toLowerCase().split(ver.toLowerCase());
  const result = transformToArr.map((item, index) => {
    if (index !== transformToArr.length - 1) {
      return (
        <React.Fragment key={index}>
          {item}
          <span className="font-bold">{ver}</span>
        </React.Fragment>
      );
    } else {
      return item;
    }
  });
  return result;
}

export default async function Definition({query, page, popularity, showRandom = true}: { query: string, page: string, popularity: string, showRandom?: boolean }){
  // Sortarea și decuparea paginii se fac acum în Mongo: primim exact cele 7
  // definiții afișate, plus numărul total (pentru butoanele de paginare).
  const currentPage = Math.max(1, Number(page) || 1);
  const { items: displayableWord, total } = await getWordsPage({
    query,
    page: currentPage,
    sort: sortFromPopularity(popularity),
  });

  const totalPages = Math.ceil(total / WORDS_PER_PAGE);
  return (
    <>
      {displayableWord.length === 0 ? (
        <div className="text-center text-xl font-bold my-24 px-3">Astea au fost toate definițiile `(*&gt;﹏&lt;*)`</div>
      ) : (
        <>
          <Filters showRandom={showRandom} />
          {displayableWord.map((word: WordDefinition) => (
            <div className="px-3 md:px-0" key={word._id}>
              <div key={word._id} className="mx-auto mybigdropshadowrounded md:mybigdropshadowrounded relative font-Spacegrotesc text-mygray break-words bg-mywhite rounded-md border-2 border-mygray w-full md:w-[720px] p-3 md:p-8 mb-4 md:mb-6">
                <div className="flex justify-between relative w-full mb-2 items-center">
                  <h2 className="text-2xl md:text-3xl break-words text-myorange font-bold">
                    <Link href={`/cuvant/${slugify(word.word)}`} className="hover:underline">
                      {word.word}
                    </Link>
                  </h2>
                  <Share query={word.word}/>
                </div>
                <p className="text-base md:text-lg">{word.definition}</p>
                <p className="text-base md:text-lg italic my-4">„{text(word.exampleOfUsing, word.word)}”</p>
                <p className="text-base md:text-lg font-bold">de <Link href={`/profil/${encodeURIComponent(word.username)}`} className="text-myorange mr-2">{word.username}</Link>{word.date}</p>
                <Actions id={word._id} likes={word.likes} />
              </div>
            </div>
          ))}
        </>
      )}
      <PaginationControls hasNextPage={currentPage < totalPages} hasPrevPage={currentPage > 1} end={totalPages} />
    </>
  );
  }
  


