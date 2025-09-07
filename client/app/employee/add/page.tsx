// app/login/page.tsx
'use client';
import AddEmployee from "@/components/AddEmplyee";
import AllEmployees from "@/components/AllEmployees";
import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function Employee() {
  return (
    <>
      <Navbar />

      <div className="flex flex-col items-center mt-6 space-y-10">
        {/* Add Employee Form */}
        <div className="w-full max-w-3xl">
          <AddEmployee />
        </div>

        {/* All Employees Table */}
        <div className="w-full max-w-6xl">
          <AllEmployees />
        </div>
      </div>
    </>
  );
}
