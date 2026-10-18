
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

          <nav aria-label="Main navigation" className="flex items-center gap-3 text-[9px] font-semibold tracking-[0.08em] sm:gap-6 sm:text-xs">
            <Link href="/" className="hover:text-[#A3A3A3]">SHOP</Link>
            <Link href="/account" className="hover:text-[#A3A3A3]">ACCOUNT</Link>
            <Link href="/cart" className="hover:text-[#A3A3A3]">BAG</Link>
            <Link href="/order-tracking" className="hover:text-[#A3A3A3]">TRACK ORDER</Link>
            <Link href="/contact" className="hover:text-[#A3A3A3]">CONTACT</Link>
          </nav>
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

            <div className="absolute inset-[5%] border border-white/60" aria-hidden="true" />

            <div className="relative mx-6 h-[82%] w-[78%] overflow-hidden border border-white/70 bg-[#050505] shadow-2xl">
              <img
                src="/images/akura-founder.jpg"
                alt="Akura founder seated outdoors in a blue hoodie"
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-4 pb-5 pt-16 sm:px-6 sm:pb-6">
                <p className="text-[10px] font-bold tracking-[0.3em] text-white/80">
                  AKURA ORIGINALS
                </p>
                <p className="mt-2 text-xl font-black tracking-[0.08em] text-white sm:text-2xl">
                  YOUR STYLE. YOUR STORY.
                </p>
              </div>
            </div>

            <span className="absolute bottom-5 right-5 text-[9px] font-bold tracking-[0.2em] text-[#111827] sm:text-[10px]">
              BUILT ON INDIVIDUALITY
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

      <section className="border-t border-[#333333] bg-[#090909] px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] font-bold tracking-[0.3em] text-[#A3A3A3]">THE PEOPLE BEHIND AKURA</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black sm:text-4xl">Made better together.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#B5B5B5]">
            A thank-you to the colleagues who helped bring this website to life. Add each person's name, role and a clear, high-resolution photo in the four slots below.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-6">
            {[
              { name: "Team member 01", role: "Website contributor", photoUrl: "" },
              { name: "Team member 02", role: "Website contributor", photoUrl: "" },
              { name: "Team member 03", role: "Website contributor", photoUrl: "" },
              { name: "Team member 04", role: "Website contributor", photoUrl: "" },
            ].map((person) => (
              <article key={person.name} className="min-w-0 max-w-[220px]">
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden border border-dashed border-[#555555] bg-[#111111]">
                  {person.photoUrl ? (
                    <img src={person.photoUrl} alt={person.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="px-3 text-center">
                      <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#555555] text-xl text-[#A3A3A3]">+</span>
                      <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#D4D4D4]">Add photo</p>
                      <p className="mt-1 text-[10px] text-[#A3A3A3]">High-resolution portrait</p>
                    </div>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[#F5F5F5]">{person.name}</h3>
                <p className="mt-1 text-xs text-[#A3A3A3]">{person.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#333333] bg-[#050505] px-5 py-12 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] font-bold tracking-[0.3em] text-[#A3A3A3]">MOBILE TESTING TEAM</p>
          <h2 className="mt-3 text-2xl font-black sm:text-3xl">Every screen, every detail.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#B5B5B5]">
            Thank you to the people who tested Akura on mobile devices, checked the layouts and helped catch issues. Add the names of everyone who contributed to mobile testing below. This section is text-only, with no photo slots.
          </p>
          <ul className="mt-6 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
            {["Mobile tester 01", "Mobile tester 02", "Mobile tester 03", "Mobile tester 04"].map((name) => (
              <li key={name} className="border border-[#333333] bg-[#111111] px-4 py-3 text-sm font-medium text-[#D4D4D4]">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-[#333333] bg-[#090909] px-5 py-12 text-[#F5F5F5] sm:px-8">
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
