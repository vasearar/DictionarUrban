"use server"

import axios from "axios"

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
  if (username!.length > 28 || username!.length < 3){
    return false;
  } else {
    return true;
  }
}