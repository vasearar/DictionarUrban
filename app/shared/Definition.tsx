import React from "react";
import { getWords } from "../api/ServerActions";

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

export default async function Definition(){
  const words = await getWords();
  return (
    <>
      { words.map((word: wordModel) => (
        <div className="px-3 md:px-0" key={word._id}>
          <div key={word._id} className="mx-auto mydropshadowrounded md:mybigdropshadowrounded relative font-Spacegrotesc text-mygray break-words bg-mywhite rounded-md border-2 border-mygray w-full md:w-[720px] p-3 md:p-8 mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl text-myorange font-bold mb-2">{word.word}</h1>
            <p className="text-base md:text-lg">{word.definition}</p>
            <p className="text-base md:text-lg italic my-4">„{text(word.exampleOfUsing, word.word)}”</p>
            <p className="text-base md:text-lg font-bold">de <span className="text-myorange mr-2">{word.username}</span>{word.date}</p>
          </div>
        </div>
      ))}
    </>
  )
  }
  


