'use client'
import React, { useState } from 'react'
import { verifyDefinition } from '../api/ServerActions';

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

interface DefinitionEditProps {
  word: wordModel;
  close: React.Dispatch<React.SetStateAction<boolean>>;
}

const DefinitionEdit: React.FC<DefinitionEditProps> = ({ word, close }) => {
  const [id, setId] = useState(word._id);
  const [wordInput, setWordInput] = useState(word.word);
  const [definitionInput, setDefinitionInput] = useState(word.definition);
  const [exampleInput, setExampleInput] = useState(word.exampleOfUsing);
  const [error, setError] = useState<{ word?: string; definition?: string; exampleOfUsing?: string }>({});

  const handleWordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWordInput(event.target.value);
  };

  const handleDefinitionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDefinitionInput(event.target.value);
  };

  const handleExampleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExampleInput(event.target.value);
  };


  const resetForm = () => {
		close(false);
    document.body.style.overflow = "auto";
	}

  async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const target = e.target as HTMLFormElement;
		const wordCorrected = target?.elements.namedItem("word") as HTMLInputElement;
		const definition = target?.elements.namedItem("definition") as HTMLInputElement;
		const exampleOfUsing = target?.elements.namedItem("exampleOfUsing") as HTMLInputElement;
    
    const data = {
      word: wordCorrected?.value.toLowerCase(),
			definition: definition.value,
			exampleOfUsing: exampleOfUsing.value,
      username: "",
			userEmail: "",
			likes: 0,
			date: ""
    };

    const tests = await verifyDefinition(data);
		setError(error => ({
      ...error,
      ...setError
    }));
		setError(tests);
		if (tests.definition == "" && tests.exampleOfUsing == "" && tests.word == ""){
      try {
        const response = await fetch(`/api/edit`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({wordid: id, data: data}),
        });
        if (!response.ok) {
          throw new Error("HTTP error! status: " + response.status);
        }
        location.reload();
      } catch (error) {
        console.log(
          "There was a problem with the fetch operation: ", error
        );
        }
			}
		}

  return (
    <div className={`h-screen w-screen bg-black bg-opacity-70 z-50 fixed top-0 left-0 flex justify-center items-center font-Spacegrotesc`}>
      <div className='h-fit max-w-[720px] w-full mx-3 bg-mywhite p-6 im:p-8'>
        <h1 className='text-center font-bold text-3xl'>Modifică definiția ta</h1>
        {/* TODO: Modifica in reguli reale */}
        <p className='text-center'>Aici menționez ceva despre reguli.</p>
        <form id="edit" onSubmit={handleSubmit} className='flex-col flex gap-4 mt-2 relative'>
          <input className={`${error.word ? 'myred' : ''} text-2xl px-4 py-2 w-full outline-none border-mygray border-2 rounded-sm`} title="fără simboluri speciale și maxim 40" type="text" name="word" id="word" value={wordInput} onChange={handleWordChange} />
          <textarea className={`${error.definition ? 'myred' : ''} text-xl px-4 py-2 resize-none w-full h-36 outline-none border-mygray border-2 rounded-sm' title="fără simboluri speciale și maxim 460`} name="definition" id="definition" value={definitionInput} onChange={handleDefinitionChange}></textarea>
          <textarea className={`${error.exampleOfUsing ? 'myred' : ''} text-xl px-4 py-2 resize-none w-full outline-none border-mygray border-2 rounded-sm' title="fără simboluri speciale și maxim 250`} name='exampleOfUsing' id="exampleOfUsing" value={exampleInput} onChange={handleExampleChange}></textarea>
        </form>
        <div className="w-full flex flex-row justify-end mt-6 gap-4 im:gap-6 relative z-10">
          <button className={`flex items-center justify-center gap-2 hover:bg-myhoverorange font-Spacegrotesc relative w-fit h-fit border-2 border-mygray font-bold rounded-sm rounded-br-none text-mywhite bg-myorange px-3 im:px-4 py-2 mydropshadow`} form="edit" type="submit">Confirmă</button>
				  <button className={`hover:text-myhovergray w-fit text-mygray h-fit px-3 im:px-4 py-2 font-bold text-nowrap relative font-Spacegrotesc rounded-sm bg-mywhite rounded-br-none border-2 border-mygray mydropshadow`} onClick={resetForm}>M-am răzgândit</button>
			</div>
      </div>
    </div>
  )
}

export default DefinitionEdit