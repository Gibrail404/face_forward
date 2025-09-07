// app/signup/page.tsx
'use client';

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    name: "",
    email: "",
    password: "",
    password2: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: formData.id,
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password2: formData.password2,
        }),
      });

      const data = await res.json();
     if (res.ok) {
  toast.success("🎉 Registration successful!", { position: "top-right" });
  
  setTimeout(() => {
    window.location.href = "/"; // redirect after success
  }, 2000);
} else {
  toast.error(data.message || "❌ Registration failed", { position: "top-right" });
}
    } catch (err) {
      toast.error("🚨 Server error. Please try again later.", { position: "top-right" });
    }
  };

  return (
    <section className="min-h-screen bg-gray-100 flex items-center justify-center bg-cover" style={{ backgroundImage: "url('/static/bg.jpg')" }}>
       {/* <Navbar /> */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-4xl">
        <div className="flex flex-col lg:flex-row">
          {/* Form */}
          <div className="w-full lg:w-1/2 p-8">
           {/* button for home */}
            <Link href="/" passHref>
              <button
                className="bg-white text-center w-48 rounded-2xl h-10 relative text-black text-lg font-semibold group mb-6"
                type="button"

              >
                <div
                  className="bg-blue-950 rounded-xl h-8 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[184px] z-10 duration-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1024 1024"
                    height="25px"
                    width="25px"
                  >
                    <path
                      d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                      fill="#ffffff"
                    ></path>
                    <path
                      d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                      fill="#ffffff"
                    ></path>
                  </svg>
                </div>
                <p className="translate-x-2">Go Home</p>
              </button>
            </Link>
            <h2 className="text-4xl font-bold leading-0.5 text-blue-950 text-center mt-8 mb-4">Sign Up</h2>

            {/* {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>} */}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Owner ID</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  pattern="owner[0-9]{2}"
                  title="Invalid ID"
                  required
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password (at least 8 characters)</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  pattern=".{8,}"
                  title="8 characters at least"
                  required
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Repeat Password</label>
                <input
                  type="password"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  pattern=".{8,}"
                  title="8 characters at least"
                  required
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-950 text-white py-2  hover:bg-blue-700 transition rounded-lg shadow-blue-700 shadow-2xs"
              >
                Register
              </button>
            </form>
          </div>

          {/* Image */}
          <div className="hidden lg:block max-w-[50%] ">
            <img
              src="/static/side-image.jpg"
              alt="Sample"
              className="object-cover h-full w-full bg-blend-hard-light"
            />
          </div>
        </div>
      </div>
          {/* Toast container */}
      <ToastContainer />
    </section>
  );
}
