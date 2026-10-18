
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
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-4 py-10 text-[#F5F5F5]">
      <div className="w-full max-w-md border border-[#333333] bg-[#111111] p-7 shadow-xl sm:p-9">
        <Link
          href="/"
          className="block text-center text-3xl font-black tracking-[0.2em]"
        >
          AKURA<span className="text-[#F5F5F5]">.</span>
        </Link>

        <h1 className="mt-8 text-center text-2xl font-semibold">
          Welcome back
        </h1>

        <p className="mt-2 text-center text-sm text-[#A3A3A3]">
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
              className="w-full border border-[#333333] bg-[#090909] px-4 py-3 text-sm text-[#F5F5F5] outline-none placeholder:text-[#777777] focus:border-[#F5F5F5]"
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
              className="w-full border border-[#333333] bg-[#090909] px-4 py-3 text-sm text-[#F5F5F5] outline-none placeholder:text-[#777777] focus:border-[#F5F5F5]"
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
            className="w-full bg-[#F5F5F5] px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-[#D4D4D4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "SIGN IN"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#A3A3A3]">
          New to Akura?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#F5F5F5] underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>


      </div>
    </main>
  );
}

export default function CustomerLogin() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#090909] px-4 text-[#F5F5F5]">
          <p className="text-sm text-[#A3A3A3]">Loading sign-in page...</p>
        </main>
      }
    >
      <CustomerLoginForm />
    </Suspense>
  );
}
