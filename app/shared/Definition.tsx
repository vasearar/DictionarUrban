import React from "react";
import Link from "next/link";
async function getServerSideProps() {
  const res = await fetch(`http://localhost:3000/api/definition`, {cache: "no-store"});
  return res.json();
}

function text(aux, ver) {
  const transformToArr = aux.split(ver);
  const result = transformToArr.map((item, index) => {
    if (index !== transformToArr.length - 1) {
      return (
        <React.Fragment key={index}>
          {item}
          <span className="font-bold not-italic">{ver}</span>
        </React.Fragment>
      );
    } else {
      return item;
    }
  });
  return result;
}

export default async function Definition(){
  const words = await getServerSideProps();
  return (
    <>
      
      { words.map((word) => (
        <div key={word._id} className="text-white bg-neutral-600 shadow rounded-lg mb-6 py-6 px-7 max-w-[780px] mx-auto">
          <h1 className="text-4xl mb-1 capitalize">{word.word}</h1>
          <p className="text-lg">{word.definition}</p>
          <p className="text-lg italic my-4">„{text(word.exampleOfUsing, word.word)}”</p>
          <p className="text-lg">de <span className="text-blue-400 mr-2">{word.username}</span>{word.date}</p>
        </div>
      ))}
    </>
  )
  }
  


