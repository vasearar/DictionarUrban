import { getServerSession } from "next-auth/next";
import { authConfig } from "../confings/auth";
import NavBar from "../shared/NavBar";

export default async function Profile() {
  const session = await getServerSession(authConfig);

  return(
    <>
      <NavBar />
      <h1>Nume utilizator: {session?.user?.name}</h1>
      {session?.user?.image && <img src={session.user.image} alt="profilePic" />}
    </>  
  )
}