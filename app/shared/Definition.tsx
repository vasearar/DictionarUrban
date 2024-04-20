// import React from "react";
// import Link from "next/link";
// async function getServerSideProps() {
//   const res = await fetch(`http://localhost:3000/api/definition`, {cache: "no-store"});
//   return res.json();
// }

// function text(aux: string, ver: string) {
//   const transformToArr = aux.split(ver);
//   const result = transformToArr.map((item, index) => {
//     if (index !== transformToArr.length - 1) {
//       return (
//         <React.Fragment key={index}>
//           {item}
//           <span className="font-bold not-italic">{ver}</span>
//         </React.Fragment>
//       );
//     } else {
//       return item;
//     }
//   });
//   return result;
// }

// interface wordModel {
//   word: string,
//   definition: string,
//   exampleOfUsing: string,
//   username: string,
//   userEmail: string,
//   likes: number,
//   date: string,
//   _id: string
// }

// export default async function Definition(){
//   const words = await getServerSideProps();
//   return (
//     <>
//       { words.map((word: wordModel) => (
//         <div key={word._id} className="mx-auto relative font-Spacegrotesc text-mygray break-words bg-mywhite rounded-md border-2 border-mygray w-[720px] p-8 mb-6">
//           <h1 className="text-3xl text-myorange font-bold mb-2">{word.word}</h1>
//           <p className="text-lg">{word.definition}</p>
//           <p className="text-lg italic my-4">„{text(word.exampleOfUsing, word.word)}”</p>
//           <p className="text-lg font-bold">de <span className="text-myorange mr-2">{word.username}</span>{word.date}</p>
//         </div>
//       ))}
//     </>
//   )
//   }
  


