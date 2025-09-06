// app/page.tsx
'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  username: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const verifyUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser({ username: data.username });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    verifyUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <img src="/static/icon3.png" alt="logo" className="w-9 drop-shadow-md" />
          <h6 className="text-lg font-semibold tracking-wide">
            Face Recognition Attendance Logger
          </h6>
        </div>

        <div className="flex items-center space-x-6">
          <Link href="/" className="hover:text-gray-300 transition">Home</Link>
          {!user ? (
            <>
              <a href="/login" className="hover:text-gray-300 transition">Login</a>
              <a href="/signup" className="hover:text-gray-300 transition">Register</a>
            </>
          ) : (
            <>
              <button
                onClick={handleLogout}
                className="hover:text-gray-300 transition"
              >
                Logout
              </button>
              <span className="text-sm font-medium bg-gray-700 px-3 py-1 rounded-lg shadow-md">
                Hey, {user.username}
              </span>
            </>
          )}
        </div>
      </nav>

      {/* Actions Section */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-10 text-center drop-shadow-sm">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <a href="/employee/add" className="btn-card">
            <i className="fa fa-user-plus text-xl mr-2"></i> Add New Employee
          </a>
          <a href="/recognizer" className="btn-card">
            <i className="fa fa-camera text-xl mr-2"></i> Recognizer
          </a>
          <a href="/attendance" className="btn-card">
            <i className="fa fa-file-invoice text-xl mr-2"></i> Attendance Sheet
          </a>
          <a href="/statistics" className="btn-card">
            <i className="fa fa-chart-line text-xl mr-2"></i> Statistics
          </a>
          <a href="/helpBot" className="btn-card">
            <i className="fa fa-info-circle text-xl mr-2"></i> Help
          </a>
        </div>
      </div>
    </div>
  );
}
