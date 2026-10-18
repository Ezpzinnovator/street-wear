"use client";

import Link from "next/link";
import { useState } from "react";

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  const supportSubject = encodeURIComponent(`Order tracking request: ${orderNumber.trim()}`);
  const supportBody = encodeURIComponent(`Hello Akura,\n\nPlease help me check the status of my order.\nOrder number: ${orderNumber.trim()}\nEmail used at checkout: ${email.trim()}\n\nThank you.`);

  return (
    <main className="min-h-screen bg-[#090909] text-[#F5F5F5]">
      <header className="sticky top-0 z-30 border-b border-[#333333] bg-[#090909]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="shrink-0 text-2xl font-black tracking-[0.18em]">AKURA<span>.</span></Link>
          <nav aria-label="Main navigation" className="flex items-center gap-3 text-[9px] font-semibold tracking-[0.08em] sm:gap-6 sm:text-xs sm:tracking-[0.1em]">
            <Link href="/" className="hover:text-[#A3A3A3]">SHOP</Link>
            <Link href="/account" className="hover:text-[#A3A3A3]">ACCOUNT</Link>
            <Link href="/cart" className="hover:text-[#A3A3A3]">BAG</Link>
            <Link href="/order-tracking" aria-current="page" className="hover:text-[#A3A3A3]">TRACK ORDER</Link>
            <Link href="/contact" className="hover:text-[#A3A3A3]">CONTACT</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-xs font-bold tracking-[0.25em] text-[#A3A3A3]">ORDER SUPPORT</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Track your order.</h1>
        <p className="mt-6 max-w-2xl leading-7 text-[#A3A3A3]">Enter your order number and the email address used at checkout. Live status lookup is not connected yet, so this form prepares a request for our support team instead of showing an unverified delivery status.</p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6 border border-[#333333] bg-[#111111] p-6 sm:p-8">
          <div>
            <label htmlFor="order-number" className="mb-2 block text-xs font-semibold tracking-wide">ORDER NUMBER</label>
            <input id="order-number" required value={orderNumber} onChange={(event) => { setOrderNumber(event.target.value); setSubmitted(false); }} placeholder="e.g. AK-12345" className="w-full border border-[#444444] bg-[#090909] px-4 py-3 text-sm text-white outline-none focus:border-[#60A5FA]" />
          </div>
          <div>
            <label htmlFor="order-email" className="mb-2 block text-xs font-semibold tracking-wide">EMAIL USED AT CHECKOUT</label>
            <input id="order-email" required type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSubmitted(false); }} placeholder="you@example.com" className="w-full border border-[#444444] bg-[#090909] px-4 py-3 text-sm text-white outline-none focus:border-[#60A5FA]" />
          </div>
          <button type="submit" className="w-full bg-white px-5 py-4 text-xs font-bold tracking-[0.16em] text-black transition hover:bg-[#D4D4D4]">PREPARE TRACKING REQUEST</button>
          {submitted && (
            <div role="status" className="border border-[#444444] bg-[#090909] p-4 text-sm leading-6 text-[#D4D4D4]">
              Live tracking is not available on the website yet. Send your details to our support email so we can help check your order.
              <a className="mt-3 inline-block font-semibold text-white underline underline-offset-4" href={`mailto:arunayanar1997@gmail.com?subject=${supportSubject}&body=${supportBody}`}>Email Akura support</a>
            </div>
          )}
        </form>
        <p className="mt-6 text-sm text-[#A3A3A3]">Need help with something else? <Link href="/contact" className="text-white underline underline-offset-4">Contact us</Link>.</p>
      </section>

      <footer className="border-t border-[#333333] bg-[#090909] px-6 py-12 text-[#F5F5F5] sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div><Link href="/" className="text-3xl font-black tracking-[0.18em]">AKURA<span className="text-[#60A5FA]">.</span></Link><p className="mt-3 max-w-xs text-sm leading-6 text-[#A3A3A3]">Everyday essentials. Bold identities. Wear what tells your story.</p></div>
          <div><h2 className="mb-4 text-[10px] font-bold tracking-[0.24em] text-[#A3A3A3]">EXPLORE</h2><div className="flex flex-col gap-3 text-sm text-[#D4D4D4]"><Link href="/">Shop all</Link><Link href="/about">About Akura</Link><Link href="/our-story">Our story</Link></div></div>
          <div><h2 className="mb-4 text-[10px] font-bold tracking-[0.24em] text-[#A3A3A3]">HELP & CONTACT</h2><div className="flex flex-col gap-3 text-sm text-[#D4D4D4]"><Link href="/contact">Contact us</Link><Link href="/account">My account</Link><Link href="/cart">Shopping bag</Link><Link href="/order-tracking">Order tracking</Link></div></div>
          <div><h2 className="mb-4 text-[10px] font-bold tracking-[0.24em] text-[#A3A3A3]">STAY CONNECTED</h2><p className="text-sm leading-6 text-[#A3A3A3]">Follow Akura for new drops, collections, and updates.</p><div className="mt-4 flex flex-wrap gap-4 text-sm text-[#D4D4D4]"><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://x.com/" target="_blank" rel="noreferrer">X / Twitter</a></div></div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-[10px] tracking-[0.12em] text-slate-400">© {new Date().getFullYear()} AKURA CLOTHING. ALL RIGHTS RESERVED.</div>
      </footer>
    </main>
  );
}
