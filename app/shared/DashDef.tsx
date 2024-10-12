'use client'
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import DefinitionEdit from './DefinitionEdit';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

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

const DashDef = () => {
  const Session = useSession();
  const email = Session?.data?.user?.email;
  const searchParams = useSearchParams();
  const [words, setWords] = useState([]);
  const [word, setWord] = useState<string | undefined>("");
  const [data, setData] = useState<wordModel>({
    word: '',
    definition: '',
    exampleOfUsing: '',
    username: '',
    userEmail: '',
    likes: 0,
    date: '',
    _id: ''
  });
  const [showDefinitionEdit, setShowDefinitionEdit] = useState(false);

  useEffect(() => {
  const query = searchParams.get('query');
  setWord(query ? query.toString() : "");
}, [searchParams]);

  async function getWordsByEmail(){
    try {
      const res = await fetch(`/api/definition?email=${email}&word=${word}`, {
        cache: "no-store", 
        method: "GET",
        headers: {"Content-Type": "application/json",}
      });
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
     setWords(await res.json());
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  }

  function confirmFunction(id: string) {
    let text = "Sunteți încrezut că doriți să ștergeți această definiție?";
    if (confirm(text) == true) {
      deleteById(id)
    } else {
      return;
    }
  }

  async function deleteById(id: string){
    try {
      const res = await fetch(`/api/definition`, {
        cache: "no-store", 
        method: "DELETE",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({id: id, email: email}),
      });
      if (!res.ok) {
        throw new Error('Failed to delete');
      }
      setWords(await res.json());
    } catch (error) {
      console.error('Deleting data error:', error);
      return [];
    }
  }

  useEffect(() => {
    if (email && word !== undefined) {
      getWordsByEmail();
    }
  }, [email, word]);

  function displayEdit(word: wordModel){
    setShowDefinitionEdit(!showDefinitionEdit);
    if(!showDefinitionEdit){
      document.body.style.overflow = "hidden";
    }
    setData(word);
  }

  return (
    <>
      {showDefinitionEdit && <DefinitionEdit word={data} close={setShowDefinitionEdit} />}
      <div className="min-h-screen h-fit mb-16">
      {words.length === 0 ? (
        <div className="text-center text-xl font-bold my-24 px-3">Tu n-ai adăugat nimic :[</div>
      ) : (
        <>
          {words.map((word: wordModel) => (
            <div className="px-3 md:px-0" key={word._id}>
              <div key={word._id} className="mx-auto mybigdropshadowrounded md:mybigdropshadowrounded relative font-Spacegrotesc text-mygray break-words bg-mywhite rounded-md border-2 border-mygray w-full md:w-[720px] p-3 md:p-8 mb-4 md:mb-6">
                <div className='flex justify-between items-center mb-3'>
                  <h1 className="text-2xl md:text-3xl text-myorange font-bold break-all">{word.word}</h1>
                  <div className='z-10 flex gap-5'>
                    <button className='px-4 tracking-wide relative h-fit py-2 text-mygray hover:text-myhovergray transition-all bg-mywhite font-bold border-mygray mydropshadow border-2' onClick={() => displayEdit(word)}>
                      <span className='md:block hidden'>Editează</span>
                      <span className='block md:hidden'>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 0H15V1H16V2H17V3H18V4H17V5H16V6H15V5H14V4H13V3H12V2H13V1H14M10 4H12V5H13V6H14V8H13V9H12V10H11V11H10V12H9V13H8V14H7V15H6V16H5V17H4V18H0V14H1V13H2V12H3V11H4V10H5V9H6V8H7V7H8V6H9V5H10" fill="#202020"/>
                        </svg>
                      </span>
                    </button>
                    <button className='px-4 tracking-wide relative h-fit py-2 text-white bg-red-600 hover:bg-red-400 transition-all font-bold border-mygray mydropshadow border-2' onClick={() => confirmFunction(word._id)}>
                      <span className='md:block hidden'>Șterge</span>
                      <span className='block md:hidden'>
                        <svg width="15" height="20" viewBox="0 0 60 86" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect y="8.59106" width="8.57124" height="8.57124" fill="white"/>
                          <rect y="25.7668" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="51.4297" y="25.7668" width="8.57124" height="8.57124" fill="white"/>
                          <rect y="34.3389" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="51.4297" y="34.3389" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="17.1484" y="34.3389" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="17.1484" y="42.9111" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="34.2793" y="42.9111" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="34.2793" y="34.3389" width="8.57124" height="8.57124" fill="white"/>
                          <rect y="42.9111" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="51.4297" y="42.9111" width="8.57124" height="8.57124" fill="white"/>
                          <rect y="51.4832" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="51.4297" y="51.4832" width="8.57124" height="8.57124" fill="white"/>
                          <rect y="60.0513" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="51.4297" y="60.0513" width="8.57124" height="8.57124" fill="white"/>
                          <rect y="68.6255" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="51.4297" y="68.6255" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="8.55664" y="8.59106" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="8.55664" y="77.1956" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="17.1484" y="77.1956" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="25.7227" y="77.1956" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="34.2793" y="77.1956" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="42.8555" y="77.1956" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="17.1484" y="8.59106" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="25.7227" y="8.59106" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="25.7734" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="34.2793" y="8.59106" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="42.8555" y="8.59106" width="8.57124" height="8.57124" fill="white"/>
                          <rect x="51.4297" y="8.59106" width="8.57124" height="8.57124" fill="white"/>
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
                <p className="text-base md:text-lg break-words">{word.definition}</p>
                <p className="text-base md:text-lg italic my-4">„{text(word.exampleOfUsing, word.word)}”</p>
                <div className="flex w-full justify-between items-center">
                  <p className="text-base md:text-lg font-bold">{word.date}</p>
                  <button className={`cursor-default border-2 border-mygray bg-stone-300 rounded-sm py-2 px-5 flex gap-1 items-center relative mydropshadow`}>
                    <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.5 0.5H4.5V2.5H2.5V4.5H0.5V9.5H2.5V11.5H4.5V13.5H6.5V15.5H8.5V17.5H10.5V19.5H11.5V17.5H13.5V15.5H15.5V13.5H17.5V11.5H19.5V9.5H21.5V4.5H19.5V2.5H17.5V0.5H14.5V2.5H12.5V4.5H9.5V2.5H7.5V0.5Z" fill="#E86842" stroke="#E86842"/>
                    </svg>
                    <span className={`transition-none font-bold`}>
                      {word.likes}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </> 
      )}
      </div>
    </>
  )
}

export default DashDef
  
