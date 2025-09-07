// app/login/page.tsx
'use client';
import AddEmployee from "@/components/AddEmplyee";
import AllEmployees from "@/components/AllEmployees";
import FaceWidget from "@/components/face";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import aiImage from "@/public/static/ai.gif"

export default function Employee() {
  const [updateUser, setUpdateUser] = useState({});
  const { value } = useAuth({ redirectTo: "/login", verifyWithServer: true });
  const { checking, isAuthed } = value;

  if (checking) return <div className="min-h-screen flex items-center justify-center">Checking auth...</div>;

  if (!isAuthed) return null;
  return (
    <>
      <Navbar />

      <div className="flex flex-col items-center mt-22 space-y-10">
        {/* Add Employee Form */}
        <section className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden flex items-center p-16" 
        style={{ backgroundImage: "url('/static/ai.gif')" , backgroundRepeat: "no-repeat", backgroundSize:"cover" , backgroundPosition: "center"}}>
 <div className="w-full bg-slate-100/90 rounded-xl">
          <AddEmployee updateUser={updateUser} setUpdateUser={setUpdateUser} />
        </div>
        {/* <div className="min-w-[50%] relative">
          <img src="/static/ai.gif" alt="abc" />
        </div> */}
        </section>
       
         {/* <div className="w-full max-w-3xl">
          <FaceWidget />
        </div> */}
        

        {/* All Employees Table */}
        <div className="w-full max-w-6xl">
          <AllEmployees updateUser={updateUser} setUpdateUser={setUpdateUser} />
        </div>
      </div>
    </>
  );
}
