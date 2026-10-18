
import Link from "next/link";

export default function OurStoryPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-[#F5F5F5]">
      <header className="border-b border-[#333333]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-[0.18em]"
          >
            AKURA<span className="text-[#F5F5F5]">.</span>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold tracking-[0.12em] hover:text-[#F5F5F5]"
          >
            BACK TO SHOP
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-bold tracking-[0.3em] text-[#F5F5F5]">
            THE STORY OF AKURA
          </p>

          <h1 className="mt-5 text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
            WEAR
            <br />
            YOUR
            <br />
            <span className="text-[#F5F5F5]">OWN STORY.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-[#B5B5B5] sm:text-lg">
            Style is more than what you wear. It is how you express yourself,
            what inspires you, and the things that make you different.
            Akura is a clothing brand built around that idea.
          </p>

          <p className="mt-5 max-w-xl text-base leading-8 text-[#B5B5B5]">
            From everyday essentials to designs inspired by anime, movies,
            sports, and street culture, we bring together different influences
            for people who want their style to feel personal.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center bg-[#F5F5F5] px-7 py-4 text-xs font-bold tracking-[0.18em] text-black transition hover:bg-[#D4D4D4]"
          >
            EXPLORE THE COLLECTION
          </Link>
        </div>

        <div className="relative">
          <div className="absolute -right-3 -top-3 h-full w-full border-2 border-[#555555] sm:-right-5 sm:-top-5" />

          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#171717]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#BFDBFE] via-[#DBEAFE] to-[#93C5FD]" />

            <div className="relative mx-6 flex h-[82%] w-[78%] flex-col items-center justify-center border border-white/70 bg-[#050505] px-5 text-center text-white shadow-2xl">
              <p className="text-xs font-bold tracking-[0.35em] text-[#A3A3A3]">
                AKURA ORIGINALS
              </p>

              <p className="mt-8 text-6xl font-black tracking-[-0.08em] sm:text-8xl">
                A.
              </p>

              <div className="mt-8 h-px w-16 bg-[#F5F5F5]" />

              <p className="mt-6 text-center text-sm font-semibold leading-7 tracking-[0.18em]">
                YOUR STYLE.
                <br />
                YOUR WORLD.
                <br />
                YOUR STORY.
              </p>
            </div>

            <span className="absolute bottom-5 right-5 text-[10px] font-bold tracking-[0.25em] text-[#F5F5F5]">
              EST. IN YOUR IMAGINATION
            </span>
          </div>
        </div>
      </section>

      <section className="bg-[#050505] text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-xs font-bold tracking-[0.3em] text-[#A3A3A3]">
            WHAT WE BELIEVE
          </p>

          <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
            Your clothes should feel like you.
          </h2>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            <div className="border-t border-white/20 pt-6">
              <p className="text-2xl font-black text-[#A3A3A3]">01</p>
              <h3 className="mt-4 text-xl font-bold">Be yourself</h3>
              <p className="mt-3 text-sm leading-7 text-white/70">
                Personal style has no single rulebook. Choose pieces that
                reflect your personality, interests, and everyday life.
              </p>
            </div>

            <div className="border-t border-white/20 pt-6">
              <p className="text-2xl font-black text-[#A3A3A3]">02</p>
              <h3 className="mt-4 text-xl font-bold">Find your influence</h3>
              <p className="mt-3 text-sm leading-7 text-white/70">
                From pop culture and sport to minimal everyday looks, inspiration
                can come from anywhere. Your style brings it together.
              </p>
            </div>

            <div className="border-t border-white/20 pt-6">
              <p className="text-2xl font-black text-[#A3A3A3]">03</p>
              <h3 className="mt-4 text-xl font-bold">Keep it personal</h3>
              <p className="mt-3 text-sm leading-7 text-white/70">
                We want clothing to be part of your story, not a replacement
                for it. Wear what feels right to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 sm:py-20">
        <p className="text-xs font-bold tracking-[0.3em] text-[#F5F5F5]">
          THIS IS AKURA
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black sm:text-5xl">
          Different inspirations. One personal style.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#B5B5B5] sm:text-base">
          Discover clothing for everyday wear and explore designs influenced
          by the worlds, characters, teams, and ideas you love.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex bg-[#050505] px-7 py-4 text-xs font-bold tracking-[0.18em] text-white transition hover:bg-[#D4D4D4]"
        >
          FIND YOUR STYLE
        </Link>
      </section>

      <section className="border-t border-[#333333] bg-[#090909] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold tracking-[0.3em] text-[#A3A3A3]">THE PEOPLE BEHIND AKURA</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-black sm:text-5xl">Built by people who care about the details.</h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#B5B5B5] sm:text-base">Meet the colleagues who helped bring this website to life. These photo spaces are ready for your team pictures; replace the placeholder image URLs and names with your approved details.</p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { name: "Team member 01", role: "Website contributor", photoUrl: "" },
              { name: "Team member 02", role: "Website contributor", photoUrl: "" },
              { name: "Team member 03", role: "Website contributor", photoUrl: "" },
              { name: "Team member 04", role: "Website contributor", photoUrl: "" },
            ].map((person) => (
              <article key={person.name} className="min-w-0">
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden border border-dashed border-[#555555] bg-[#111111]">
                  {person.photoUrl ? <img src={person.photoUrl} alt={person.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : <div className="px-4 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#555555] text-2xl text-[#A3A3A3]">+</span><p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D4D4D4]">Add team photo</p><p className="mt-2 text-xs text-[#A3A3A3]">Portrait / workspace photo</p></div>}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#F5F5F5]">{person.name}</h3>
                <p className="mt-1 text-xs text-[#A3A3A3]">{person.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#333333] bg-[#050505] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold tracking-[0.3em] text-[#A3A3A3]">QUALITY CHECKS</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-black sm:text-5xl">Tested across devices. Refined together.</h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#B5B5B5] sm:text-base">A special thank-you to the mobile testers who checked the experience on phones and helped us spot issues before launch. Add their names and photos below.</p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { name: "Mobile tester 01", role: "Mobile testing", photoUrl: "" },
              { name: "Mobile tester 02", role: "Mobile testing", photoUrl: "" },
              { name: "Mobile tester 03", role: "Mobile testing", photoUrl: "" },
              { name: "Mobile tester 04", role: "Mobile testing", photoUrl: "" },
            ].map((tester) => (
              <article key={tester.name} className="min-w-0">
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden border border-dashed border-[#555555] bg-[#111111]">
                  {tester.photoUrl ? <img src={tester.photoUrl} alt={tester.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : <div className="px-4 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#555555] text-2xl text-[#A3A3A3]">+</span><p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D4D4D4]">Add tester photo</p><p className="mt-2 text-xs text-[#A3A3A3]">Mobile QA contributor</p></div>}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#F5F5F5]">{tester.name}</h3>
                <p className="mt-1 text-xs text-[#A3A3A3]">{tester.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#050505] px-5 py-8 text-center text-xs tracking-wide text-white/60">
        AKURA — Wear your own story.
      </footer>
    </main>
  );
}
