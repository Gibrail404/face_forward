"use client";

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function Navbar() {
  const { user, logout } = useAuth();
   const pathname = usePathname();
   const isLightRoute = pathname === "/";


  return (
    <nav className="fixed w-full top-0 left-0 z-50 bg-transparent">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img
            src="/static/icon3.png"
            alt="logo"
            className="w-9 drop-shadow-md"
          />
          <h6 
          // className=" text-white"
          className={clsx(
              "text-lg font-semibold tracking-wide",
              isLightRoute ? "text-white" : "text-blue-950"
            )}
          >
            Face Forward
          </h6>
        </div>

        {/* Nav Links */}
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            // className="text-white hover:text-indigo-300 transition font-medium"
            className={clsx(
              "hover:text-blue-800 transition font-medium",
              isLightRoute ? "text-white" : "text-blue-950"
            )}
          >
            Home
          </Link>

          {user ? (
            <>
              <span 
              // className="text-sm font-medium text-white px-3 py-1 rounded-lg"
              className={clsx(
              "hover:text-blue-800 transition font-medium",
              isLightRoute ? "text-white" : "text-blue-950"
            )}
              >
                Hey, {user.name}
              </span>
              <button
                onClick={logout}
                className="bg-blue-950 flex gap-2 items-center hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-blue-700 shadow-2xs border-none transition"
              >
                <FaArrowLeft />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-blue-950 flex gap-2 items-center hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-blue-700 shadow-2xs border-none transition"
              >
                 <FaArrowRight />
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
