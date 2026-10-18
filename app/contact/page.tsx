import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-[#F5F5F5]">
      {/* Header */}
      <header className="border-b border-[#333333] bg-[#111111]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-[0.18em]"
          >
            AKURA<span className="text-[#F5F5F5]">.</span>
          </Link>

          <Link
            href="/"
            className="text-sm font-semibold transition hover:text-[#F5F5F5]"
          >
            Back to Shop
          </Link>
        </div>
      </header>

      {/* Contact Content */}
      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#F5F5F5]">
          We're here to help
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
          Contact Us
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-8 text-[#A3A3A3] sm:text-lg">
          Have a question about an order, a product, sizing, or your shopping
          experience? We'd love to hear from you.
        </p>

        {/* Contact Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#333333] bg-[#111111] p-6">
            <h2 className="text-lg font-bold">Email Us</h2>

            <p className="mt-3 text-sm leading-6 text-[#A3A3A3]">
              Send us your questions and we'll get back to you.
            </p>

            <a
              href="mailto:arunayanar1997@gmail.com"
              className="mt-5 inline-block break-all font-semibold text-[#F5F5F5] hover:underline"
            >
              arunayanar1997@gmail.com
            </a>
          </div>

          <div className="rounded-2xl border border-[#333333] bg-[#111111] p-6">
            <h2 className="text-lg font-bold">Shopping Help</h2>

            <p className="mt-3 text-sm leading-6 text-[#A3A3A3]">
              Need help choosing a product or finding the right size? Contact
              us by email and include your question.
            </p>
          </div>
        </div>

        {/* Our Story Link */}
        <div className="mt-10 rounded-2xl bg-[#050505] p-8 text-white">
          <h2 className="text-xl font-bold">Wear your own story.</h2>

          <p className="mt-3 leading-7 text-white/75">
            Akura is about expressing yourself through the things you love.
            Thank you for being part of our journey.
          </p>

          <Link
            href="/our-story"
            className="mt-6 inline-block rounded-full bg-[#F5F5F5] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#111111]"
          >
            Read Our Story
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#333333] px-6 py-6 text-center text-sm text-[#A3A3A3]">
        © {new Date().getFullYear()} Akura. All rights reserved.
      </footer>
    </main>
  );
}