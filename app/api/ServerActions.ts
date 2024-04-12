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
  //TODO: Regex de testat sa fie doar simbolurile corecte si sa verifice daca deja exista in db
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