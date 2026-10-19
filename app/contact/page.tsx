import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-[#F5F5F5]">
      <header className="sticky top-0 z-30 border-b border-[#333333] bg-[#090909]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="shrink-0 text-2xl font-black tracking-[0.18em]">AKURA<span>.</span></Link>
          <nav aria-label="Main navigation" className="flex items-center gap-3 text-[9px] font-semibold tracking-[0.08em] sm:gap-6 sm:text-xs sm:tracking-[0.1em]">
            <Link href="/" className="hover:text-[#A3A3A3]">SHOP</Link>
            <Link href="/account" className="hover:text-[#A3A3A3]">ACCOUNT</Link>
            <Link href="/cart" className="hover:text-[#A3A3A3]">BAG</Link>
            <Link href="/order-tracking" className="hover:text-[#A3A3A3]">TRACK ORDER</Link>
            <Link href="/contact" aria-current="page" className="hover:text-[#A3A3A3]">CONTACT</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A3A3A3]">We're here to help</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Contact Us</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[#A3A3A3] sm:text-lg">Have a question about an order, a product, sizing, or your shopping experience? We'd love to hear from you.</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="border border-[#333333] bg-[#111111] p-6">
            <h2 className="text-lg font-bold">Email Us</h2>
            <p className="mt-3 text-sm leading-6 text-[#A3A3A3]">Send us your questions and we'll get back to you.</p>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=arunayanar1997%40gmail.com" target="_blank" rel="noreferrer" className="mt-5 inline-block break-all font-semibold text-white underline underline-offset-4 hover:text-[#D4D4D4]">arunayanar1997@gmail.com</a>
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=arunayanar1997%40gmail.com" target="_blank" rel="noreferrer" className="border border-white/30 px-4 py-2 font-semibold transition hover:bg-white hover:text-black">OPEN GMAIL ↗</a>
              <a href="mailto:arunayanar1997@gmail.com" className="px-1 py-2 text-[#A3A3A3] underline underline-offset-4 hover:text-white">Use email app</a>
            </div>
          </div>
          <div className="border border-[#333333] bg-[#111111] p-6">
            <h2 className="text-lg font-bold">Shopping Help</h2>
            <p className="mt-3 text-sm leading-6 text-[#A3A3A3]">Need help choosing a product or finding the right size? Email us with your question and we'll help you out.</p>
            <Link href="/order-tracking" className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">Order tracking information</Link>
          </div>
        </div>
        <div className="mt-10 border border-[#333333] bg-[#111111] p-8">
          <h2 className="text-xl font-bold">Wear your own story.</h2>
          <p className="mt-3 leading-7 text-[#A3A3A3]">Akura is about expressing yourself through the things you love. Thank you for being part of our journey.</p>
          <Link href="/our-story" className="mt-6 inline-flex bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-[#D4D4D4]">Read Our Story</Link>
        </div>
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
