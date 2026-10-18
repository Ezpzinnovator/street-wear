"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function CustomerRegister() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Your name must be 100 characters or fewer.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        setSuccess("Your account has been created. Redirecting...");
        router.replace("/account");
        router.refresh();
        return;
      }

      setSuccess(
        "Your registration was received. If email confirmation is enabled, check your inbox to verify your address before signing in."
      );
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Customer registration error:", err);
      setError("Unable to create your account right now. Please try again.");
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
          Create your account
        </h1>
        <p className="mt-2 text-center text-sm text-[#627D98]">
          Join Akura and make your style your own.
        </p>

        <form onSubmit={handleRegister} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="full-name"
              className="mb-2 block text-sm font-medium"
            >
              Full name
            </label>
            <input
              id="full-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full border border-[#BFDBFE] px-4 py-3 text-sm outline-none focus:border-[#3B82F6]"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="mb-2 block text-sm font-medium"
            >
              Email address
            </label>
            <input
              id="register-email"
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
              htmlFor="register-password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="w-full border border-[#BFDBFE] px-4 py-3 text-sm outline-none focus:border-[#3B82F6]"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-medium"
            >
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              className="w-full border border-[#BFDBFE] px-4 py-3 text-sm outline-none focus:border-[#3B82F6]"
              placeholder="Enter your password again"
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

          {success && (
            <p
              role="status"
              className="border border-green-200 bg-green-50 p-3 text-sm text-green-800"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B82F6] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#627D98]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#2563EB] underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>


      </div>
    </main>
  );
}