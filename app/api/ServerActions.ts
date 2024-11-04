"use server"

import axios from "axios";
import { redirect } from "next/navigation";

export async function verifyCaptcha(token: string | null) {
  const res = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
  )
  if (res.data.success) {
    return true
  } else {
    throw new Error("Failed Captcha")
  }
}

export async function verifyUsername(username: string | null) {
  let regex = /^[a-zA-Z0-9_ăîșțâĂÎȘȚÂ]+$/;
  if (username!.length > 28 || username!.length < 3){
    return ("Porecla trebuie să fie între 3 și 28 de simboluri");
  } else if (!regex.test(username!)){
    return ("Porecla nu trebuie să conțină simboluri speciale");
  } else {
    return true;
  }
}

export async function navigate() {
  redirect("/");
}

interface myWord{
  word: string;
  definition: string;
  exampleOfUsing: string;
  username: string | null | undefined;
  userEmail: string | null | undefined;
  likes: number;
  date: string;
}


export async function verifyDefinition(data: myWord) {
  const errors = {
    word: "",
    definition: "",
    exampleOfUsing: ""
  };
  
  const validateText = (text: string, minLength: number, maxLength: number, errorMessage: string) => {
    if (text.trim().length < minLength) {
      return errorMessage + " nu poate conține mai puțin de " + minLength + " simboluri";
    } else if (text.trim().length > maxLength) {
      return errorMessage + " nu poate conține mai mult de " + maxLength + " simboluri";
    } else if (!/^[a-zA-Z0-9_ăîșțâĂÎȘȚÂéÉêÊœŒûÛïÏàÀèÈçÇäÄüÜöÖ(){}\[\]\"':;,.\/\\~`„”?\-_=+!*]+\s*$/.test(text.replace(/\s/g, ''))) {
      return errorMessage + " nu poate conține simboluri speciale";
    }
    return "";
  };

  errors.word = validateText(data.word, 2, 40, "*Expresia sau cuvântul");
  errors.definition = validateText(data.definition, 40, 460, "*Definiția");
  errors.exampleOfUsing = validateText(data.exampleOfUsing, 20, 250, "*Exemplul de folosire");

  return errors;
}

export async function getWords(query: string) {
  try {
    const res = await fetch(`https://dexurban.md/api/definition/?word=${query}`, {cache: "no-store"});
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}
