import GoogleButton from "../shared/GoogleButton";

export default async function Signin(){
  return (
    <div className="w-screen h-screen flex items-center justify-center flex-col">
      <div className="bg-neutral-600 p-6 rounded-lg flex items-center justify-center flex-col">
        <h1 className="text-white text-4xl mb-4">Conectare</h1>
        <GoogleButton />
      </div>
    </div>
  )
}