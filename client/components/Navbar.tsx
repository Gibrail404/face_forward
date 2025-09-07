"use client";

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

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
          <h6 className="text-lg font-semibold tracking-wide text-white">
            Face Forward
          </h6>
        </div>

        {/* Nav Links */}
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="text-white hover:text-indigo-300 transition font-medium"
          >
            Home
          </Link>

          {user ? (
            <>
              <span className="text-sm font-medium text-white px-3 py-1 rounded-lg">
                Hey, {user.name}
              </span>
              <button
                onClick={logout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-none border-none transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-white hover:text-indigo-300 transition font-medium"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
