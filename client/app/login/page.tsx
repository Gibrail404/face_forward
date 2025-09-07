// app/login/page.tsx
'use client';
import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Authorization: `Bearer ${token}`, 
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Login successful !");
        setError("");
        // console.log("token", data)

        // Save token (optional)
        localStorage.setItem("token", data?.token);

        // Redirect (example)
        setTimeout(() => {
          window.location.href = "/"; // or dashboard
        }, 1500);
      } else {
        setError(data.message || "Invalid username or password");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    
    <section
      className="min-h-screen flex items-center justify-center bg-cover"
      style={{ backgroundImage: "url('/static/bg.jpg')" }}
    >
       {/* <Navbar /> */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Image */}
          <div className="hidden md:block md:w-1/2">
            <img
              src="/static/login.jpg"
              alt="Login"
              className="h-full w-full object-cover rounded-l-2xl"
            />
          </div>

          {/* Right Form */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            <h1 className="text-2xl font-bold mb-6">
              Face Recognition Based Employee Attendance Logger
            </h1>
            <h2 className="text-lg font-medium mb-4">Sign into your account</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
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
                <label className="block text-sm font-medium mb-1">
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
                className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-700 transition"
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
    </section>
  );
}
