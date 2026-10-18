
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

type AccountProfileProps = {
  initialName: string;
  email: string;
};

export default function AccountProfile({
  initialName,
  email,
}: AccountProfileProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState(initialName);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const trimmedName = fullName.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError("Your name must contain between 2 and 100 characters.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: trimmedName },
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setFullName(trimmedName);
      setMessage("Your profile has been updated.");
      router.refresh();
    } catch {
      setError("Unable to update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setError("");
    setSigningOut(true);

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setError(signOutError.message);
        setSigningOut(false);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Unable to sign out. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <section className="border border-[#333333] bg-[#111111] p-6 sm:p-8">
      <h2 className="text-xl font-semibold">Profile details</h2>

      <p className="mt-2 text-sm text-[#627D98]">
        Update the name associated with your account.
      </p>

      <form onSubmit={saveProfile} className="mt-7 space-y-5">
        <div>
          <label
            htmlFor="fullName"
            className="mb-2 block text-xs font-semibold"
          >
            Full name
          </label>

          <input
            id="fullName"
            name="fullName"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            minLength={2}
            maxLength={100}
            autoComplete="name"
            required
            className="w-full border border-[#333333] px-4 py-3 text-sm outline-none focus:border-[#3B82F6]"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-semibold"
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            readOnly
            className="w-full border border-[#333333] bg-[#090909] px-4 py-3 text-sm text-[#627D98]"
          />

          <p className="mt-2 text-xs text-[#627D98]">
            Email changes require a separate verification process.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="text-sm text-[#D4D4D4]">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || signingOut}
          className="w-full bg-[#F5F5F5] px-5 py-3.5 text-xs font-semibold tracking-wide text-white transition hover:bg-[#D4D4D4] disabled:opacity-60"
        >
          {saving ? "SAVING..." : "SAVE PROFILE"}
        </button>
      </form>

      <div className="mt-8 border-t border-[#DBEAFE] pt-6">
        <h3 className="font-semibold">Account access</h3>

        <p className="mt-2 text-sm text-[#627D98]">
          Sign out when you're finished using your account.
        </p>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={saving || signingOut}
          className="mt-4 border border-[#333333] px-5 py-3 text-xs font-semibold transition hover:border-[#3B82F6] disabled:opacity-60"
        >
          {signingOut ? "SIGNING OUT..." : "SIGN OUT"}
        </button>
      </div>

      <Link
        href="/"
        className="mt-6 inline-block text-xs text-[#F5F5F5] underline underline-offset-4"
      >
        Back to Akura
      </Link>
    </section>
  );
}
