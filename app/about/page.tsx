
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#102A43]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-[0.18em]"
          >
            AKURA<span className="text-[#3B82F6]">.</span>
          </Link>

          <Link
            href="/"
            className="text-sm font-semibold transition hover:text-[#3B82F6]"
          >
            Back to Shop
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#3B82F6]">
          About Akura
        </p>

        <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
          Wear What Makes You, You.
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
          Akura is a clothing brand built around personal expression. We believe
          what you wear can reflect your interests, your personality, and the
          things that inspire you.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">Our Identity</h2>
            <p className="mt-4 leading-7 text-slate-600">
              A space for people who want their clothing to express who they
              are, without following every trend.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">Our Inspiration</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Anime, movies, sports, gaming, street culture, and everyday
              creativity inspire the styles we explore.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">Our Purpose</h2>
            <p className="mt-4 leading-7 text-slate-600">
              To help you discover clothing that feels personal and gives you
              the confidence to express your own style.
            </p>
          </article>
        </div>

        <div className="mt-12 rounded-2xl bg-[#102A43] p-8 text-white sm:p-10">
          <h2 className="text-2xl font-black sm:text-3xl">
            Your style. Your interests. Your story.
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-white/75">
            Explore the collection and find pieces that match your personality.
            Akura is here to help you make your style your own.
          </p>

          <Link
            href="/#shop"
            className="mt-7 inline-block rounded-full bg-[#60A5FA] px-7 py-3 font-bold text-[#102A43] transition hover:bg-white"
          >
            Explore Collection
          </Link>

          <div className="mt-5">
            <Link
              href="/our-story"
              className="text-sm font-semibold text-white/80 underline underline-offset-4 hover:text-white"
            >
              Discover Our Story
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-6 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Akura. All rights reserved.
      </footer>
    </main>
  );
}