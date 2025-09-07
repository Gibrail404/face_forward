// app/login/page.tsx
'use client';
import Chatbot from "@/app/help/page";
import AddEmployee from "@/components/AddEmplyee";
import AllEmployees from "@/components/AllEmployees";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";


export default function Employee() {
  const [updateUser, setUpdateUser] = useState({});
  const { value } = useAuth({ redirectTo: "/login", verifyWithServer: true });
  const { checking, isAuthed } = value;
  const [getListing,setGetListing] = useState<boolean>(false);

  const handleListing = (isTrue:boolean) =>{}

  if (checking) return <div className="min-h-screen flex items-center justify-center">Checking auth...</div>;

  if (!isAuthed) return null;
  return (
    <>
      <Navbar />

      <div className="flex flex-col items-center mt-22 space-y-10">
        {/* Add Employee Form */}
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden flex items-center p-16" >
          {/* <div className="w-full bg-slate-100/90 rounded-xl"> */}
            <AddEmployee updateUser={updateUser} setUpdateUser={setUpdateUser} setGetListing={setGetListing}/>
          {/* </div> */}
        </div>
        


        {/* All Employees Table */}
        <div className="w-full max-w-6xl">
          <AllEmployees updateUser={updateUser} setUpdateUser={setUpdateUser} did_update={getListing}/>
        </div>
         <Chatbot />
      </div>
    </>
  );
}
