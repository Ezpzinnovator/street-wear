
"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        setError(
          loginError.message === "Invalid login credentials"
            ? "Email or password is incorrect."
            : loginError.message
        );
        return;
      }

      const requestedDestination = searchParams.get("next");
      const destination =
        requestedDestination?.startsWith("/") &&
        !requestedDestination.startsWith("//") &&
        !requestedDestination.startsWith("/admin")
          ? requestedDestination
          : "/account";

      router.replace(destination);
      router.refresh();
    } catch (err) {
      console.error("Customer login error:", err);
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EFF6FF] px-4 py-10 text-[#102A43]">
      <div className="w-full max-w-md border border-[#BFDBFE] bg-white p-7 shadow-xl sm:p-9">
        <Link
          href="/"
          className="block text-center text-3xl font-black tracking-[0.2em]"
        >
          AKURA<span className="text-[#3B82F6]">.</span>
        </Link>

        <h1 className="mt-8 text-center text-2xl font-semibold">
          Welcome back
        </h1>

        <p className="mt-2 text-center text-sm text-[#627D98]">
          Sign in to your Akura customer account.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="customer-email"
              className="mb-2 block text-sm font-medium"
            >
              Email address
            </label>

            <input
              id="customer-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={254}
              className="w-full border border-[#BFDBFE] px-4 py-3 text-sm outline-none focus:border-[#3B82F6]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="customer-password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="customer-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full border border-[#BFDBFE] px-4 py-3 text-sm outline-none focus:border-[#3B82F6]"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B82F6] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "SIGN IN"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#627D98]">
          New to Akura?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#2563EB] underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>

        <Link
          href="/"
          className="mt-6 block text-center text-xs font-medium text-[#627D98] hover:text-[#2563EB]"
        >
          ← Continue shopping
        </Link>
      </div>
    </main>
  );
}

export default function CustomerLogin() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#EFF6FF] px-4 text-[#102A43]">
          <p className="text-sm text-[#627D98]">Loading sign-in page...</p>
        </main>
      }
    >
      <CustomerLoginForm />
    </Suspense>
  );
}
