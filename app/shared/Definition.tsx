import React from "react";
import { getWords } from "../api/ServerActions";
import Actions from "./Actions";
import PaginationControls from "./PaginationControls";
import Filters from "./Filters";
import Share from "./Share";

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

interface wordModel {
  word: string,
  definition: string,
  exampleOfUsing: string,
  username: string,
  userEmail: string,
  likes: number,
  date: string,
  _id: string
}


export default async function Definition({query, page, popularity}: { query: string, page: string, popularity: string }){
  const words = await getWords(query);

  let sortedWords = [...words];
  if (popularity === "2") {
    sortedWords = sortedWords.sort((a, b) => b.likes - a.likes);
  } else if (popularity === "3") {
    sortedWords = sortedWords.sort((a, b) => a.likes - b.likes);
  }

  const start = (Number(page) - 1) * 7;
  const end = start + 7;
  const displayableWord = sortedWords.slice(start, end);
  return (
    <>
      {displayableWord.length === 0 ? (
        <div className="text-center text-xl font-bold my-24 px-3">Astea au fost toate definițiile `(*&gt;﹏&lt;*)`</div>
      ) : (
        <>
          <Filters/>
          {displayableWord.map((word: wordModel) => (
            <div className="px-3 md:px-0" key={word._id}>
              <div key={word._id} className="mx-auto mybigdropshadowrounded md:mybigdropshadowrounded relative font-Spacegrotesc text-mygray break-words bg-mywhite rounded-md border-2 border-mygray w-full md:w-[720px] p-3 md:p-8 mb-4 md:mb-6">
                <div className="flex justify-between relative w-full mb-2 items-center">
                  <h1 className="text-2xl md:text-3xl break-all text-myorange font-bold">{word.word}</h1>
                  <Share query={word.word}/>
                </div>
                <p className="text-base md:text-lg">{word.definition}</p>
                <p className="text-base md:text-lg italic my-4">„{text(word.exampleOfUsing, word.word)}”</p>
                <p className="text-base md:text-lg font-bold">de <span className="text-myorange mr-2">{word.username}</span>{word.date}</p>
                <Actions id={word._id} likes={word.likes} />
              </div>
            </div>
          ))}
        </>
      )}
      <PaginationControls hasNextPage={end < words.length} hasPrevPage={start > 0} end={end} />
    </>
  );
  }
  


