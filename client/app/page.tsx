'use client';

import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";
import Chatbot from "./help/page";
import { FaUsers, FaCamera, FaClipboardList, FaChartBar } from "react-icons/fa";

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen relative">
      <Navbar />

      {/* Full Screen Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/static/bg6.gif')",
          backgroundRepeat: "repeat",       // repeat the GIF
          backgroundSize: "contain",        // fit inside container
          backgroundAttachment: "fixed",    // fixed position while scrolling
          backgroundPosition: "left",      // align to the right
        }}
      ></div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col md:flex-row min-h-screen">
        {/* Left Spacer - optional for visual split */}
        <div className="hidden md:block md:w-1/2"></div>

        {/* Right Side - Text / Quick Actions */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-16">
          {!user ? (
            <div className="text-center space-y-6">

              <h1 className="text-4xl md:text-5xl font-bold text-white text leading-14">
                Welcome to Smart Attendance System
              </h1>
              <p className="text-lg md:text-xl text-gray-400">
                AI-powered Face Recognition for seamless attendance tracking
              </p>
              <Link
                href="/login"
                className="bg-blue-950 text-white px-6 py-3  font-medium hover:bg-blue-700 transition rounded-lg shadow-blue-700 shadow-2xs"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="w-full space-y-8">
              <h2 className="text-3xl font-bold text-white text-center mb-4">
                Quick Actions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-slate-800 rounded-xl">
                {[
            { href: "/employee/add", text: "Employees", icon: <FaUsers /> },
    { href: "/recognizer", text: "Recognizer", icon: <FaCamera /> },
    { href: "/attendance", text: "Attendance Sheet", icon: <FaClipboardList /> },
    { href: "/statistics", text: "Statistics", icon: <FaChartBar /> },
                ].map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="flex gap-2 text-center justify-center items-center bg-white border rounded-xl shadow-md hover:shadow-xl p-4 font-medium text-gray-700 hover:text-blue-950 transition"
                  >
                     <span className="text-xl">{item.icon}</span>
                    {item.text}
                  </Link>
                ))}
              </div>

              {/* <div className="text-center">
                <button
                  onClick={logout}
                  className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div> */}
            </div>
          )}
        </div>
      </div>
      <Chatbot />
    </div>
  );
}
