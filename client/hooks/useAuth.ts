"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
}

export const useAuth = ({ redirectTo = "/login", verifyWithServer  = true } = {}) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

   useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // quick localStorage check (synchronous-ish)
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          // no token -> redirect
          if (mounted) {
            setIsAuthed(false);
            setChecking(false);
            router.replace(redirectTo);
          }
          return;
        }

        // we have a token locally — optimistically accept it
        if (mounted) setIsAuthed(true);

        // if (verifyWithServer) {
        //   // optional: verify token with backend (do not redirect until server responds)
        //   try {
        //     const res = await fetch("/api/auth/verify", {
        //       method: "POST",
        //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        //       body: JSON.stringify({}),
        //     });
        //     if (!res.ok) {
        //       // invalid token -> clear and redirect
        //       if (mounted) {
        //         localStorage.removeItem("token");
        //         setIsAuthed(false);
        //         router.replace(redirectTo);
        //       }
        //     }
        //   } catch (err) {
        //     console.warn("token verify failed:", err);
        //     // optionally treat as invalid; here we'll keep user logged in (to avoid bouncing)
        //   }
        // }
      } catch (err) {
        console.error("useAuth error:", err);
      } finally {
        if (mounted) setChecking(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router, redirectTo, verifyWithServer]);

  // 🔹 Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const verifyUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user); // ✅ user comes from backend
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  // 🔹 Login (store token + user)
  const login = (token: string, user: User) => {
    localStorage.setItem("token", token);
    setUser(user);
  };

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  const value = useMemo(() => ({ checking, isAuthed }), [checking, isAuthed]);
  return { user, loading, login, logout,value };
};
