// app/signup/page.tsx
'use client';

import Navbar from "@/components/Navbar";
import { useState } from "react";

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
        setSuccess("Registration successful!");
        // Redirect (example)
        setTimeout(() => {
          window.location.href = "/"; // or dashboard
        }, 1500);
        setError("");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <section className="min-h-screen bg-gray-100 flex items-center justify-center bg-cover" style={{ backgroundImage: "url('/static/bg.jpg')" }}>
       {/* <Navbar /> */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-4xl">
        <div className="flex flex-col lg:flex-row">
          {/* Form */}
          <div className="w-full lg:w-1/2 p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}

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
                className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-700 transition"
              >
                Register
              </button>
            </form>
          </div>

          {/* Image */}
          <div className="hidden lg:block lg:w-1/2">
            <img
              src="static/login.jpg"
              alt="Sample"
              className="object-cover h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
