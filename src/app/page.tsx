"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { authClient } from "@/lib/auth-client"; //import the auth client

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");




  const { data: session, } = authClient.useSession()




  const handleSubmit = async () => {
    authClient.signUp.email({
      name,
      email,
      password,
    }, {
      onSuccess: () => {
        window.alert("Success")
      },
      onError: () => {
        window.alert("something error occured")
      },
    });
  }

  if (session) {
    return (
      <>
        <div>
          <p>
            Logged in as {session.user.name}
          </p>
          <Button onClick={() => { authClient.signOut() }}>Sign out</Button>
        </div>
      </>
    )
  }

  const onhandleLogin = () => {
    authClient.signIn.email({
      email,
      password
    }, {
      onSuccess: () => {
        window.alert("Login Success")
      }, onError: () => {
        window.alert("something went wrong")
      }
    })
  }
  return (
    <>

      <input type="text" name="name" placeholder="enter name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="text" name="email" placeholder="enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="text" name="password" placeholder="enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={handleSubmit}>Create User</Button>


      <input type="text" name="email" placeholder="enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="text" name="password" placeholder="enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={onhandleLogin}>Login</Button>

    </>
  );
}