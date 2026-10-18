"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase-browser";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#333333] bg-[#111111] p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-[0.25em] text-[#F5F5F5]">
            AKURA
          </h1>
          <p className="mt-3 text-sm text-[#A3A3A3]">Clothing Store</p>
          <h2 className="mt-6 text-2xl font-bold text-[#F5F5F5]">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-[#A3A3A3]">
            Sign in to manage your store
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#D4D4D4]">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-lg border border-[#444444] px-4 py-3 text-[#F5F5F5] outline-none focus:border-[#F5F5F5] focus:ring-2 focus:ring-white/10"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#D4D4D4]">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-[#444444] px-4 py-3 text-[#F5F5F5] outline-none focus:border-[#F5F5F5] focus:ring-2 focus:ring-white/10"
            />
          </div>

          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#F5F5F5] px-4 py-3 font-semibold text-black hover:bg-[#D4D4D4] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 border-t border-[#333333] pt-5 text-center">
          <p className="text-xs text-[#A3A3A3]">
            Akura Clothing Admin Portal
          </p>
        </div>
      </div>
    </main>
  );
}