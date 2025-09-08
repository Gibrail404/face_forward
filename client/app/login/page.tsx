'use client';

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // useEffect(() => {
  //   // Redirect to home if token exists
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (token) {
  //       router.replace("/"); // replace so user can't go back to login with back button
  //     }
  //   } catch (e) {
  //     // localStorage might be unavailable in some envs — ignore
  //     console.warn("Could not access localStorage", e);
  //   }
  // }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Login successful!", { position: "top-right" });

        // Save token
        localStorage.setItem("token", data?.token);

        // Redirect to home (use router)
        router.replace("/");
      } else {
        toast.error(data.message || " Invalid username or password", { position: "top-right" });
      }
    } catch (err) {
      toast.error("🚨 Server error. Please try again later.", { position: "top-right" });
    }
  };

  return (
    <section
      className="min-h-screen flex items-center bg-black justify-center bg-cover"
    >
      {/* <Navbar /> */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Image */}
          <div className="hidden md:block md:w-1/2">
            <img
              src="/static/ai.gif"
              alt="Login"
              className="h-full w-full object-cover rounded-l-2xl"
            />
          </div>

          {/* Right Form */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
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

            <h1 className="text-4xl font-bold text-blue-950 text-center mt-3">
              Welcome Back!
            </h1>
            <h1 className="text-2xl font-bold mb-6 text-blue-950 text-center">
              Sign into your account
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Username
                </label>
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
                <label className="block text-sm font-medium mb-1 text-black">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-950 text-white py-2 hover:bg-blue-700 transition rounded-lg shadow-blue-700 shadow-2xs"
              >
                Login
              </button>
            </form>

            <div className="flex flex-col items-center mt-6 space-y-2">
              <a href="/reset_request" className="text-sm text-gray-500 hover:underline">
                Forgot password?
              </a>
              <p className="text-sm text-gray-600">
                Don’t have an account?{" "}
                <a href="/signup" className="text-gray-900 font-semibold hover:underline">
                  Register here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast container */}
      <ToastContainer />
    </section>
  );
}

