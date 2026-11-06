import Link from "next/link";

const faqs = [
  {
    category: "Products & sizing",
    items: [
      {
        question: "How do I choose the right size?",
        answer: "Check the size options shown on the individual product page before adding an item to your bag. If you are unsure, contact us with the product name and the size you usually wear. We can help you review the available information.",
      },
      {
        question: "Are the colours exactly as they appear on screen?",
        answer: "Product colours can look slightly different depending on your screen and display settings. Please use the product photographs and description together when choosing.",
      },
      {
        question: "Will an item come back in stock?",
        answer: "Availability can change. If a product or size is out of stock, check the product page again later or contact us to ask about its availability. We do not currently publish restock dates.",
      },
    ],
  },
  {
    category: "Orders & payment",
    items: [
      {
        question: "How do I place an order?",
        answer: "Choose an available product, select the required size and colour where offered, add it to your bag, and continue to checkout. Review your delivery details and order summary before proceeding to payment.",
      },
      {
        question: "Which payment methods are accepted?",
        answer: "Online payments are handled through the payment options presented by Razorpay at checkout. The options available to you are determined by Razorpay and your payment method.",
      },
      {
        question: "When is my order confirmed?",
        answer: "An order is confirmed only after the payment has been successfully verified. A checkout attempt or an unverified payment return does not by itself mean that an order is confirmed.",
      },
      {
        question: "Can I cancel an order?",
        answer: "Under our standard store policy, an order cannot be cancelled once it has been shipped. Please contact us as soon as possible if you need help with an order that has not shipped. This does not limit rights that apply under law.",
      },
    ],
  },
  {
    category: "Shipping & tracking",
    items: [
      {
        question: "How long will delivery take?",
        answer: "Delivery time depends on your location, product availability, courier service and circumstances outside our reasonable control. We do not currently publish a guaranteed delivery timeframe. Any delivery information shown for your order should be treated as the most relevant estimate.",
      },
      {
        question: "Are there shipping charges?",
        answer: "Any applicable delivery charges will be communicated where relevant during the order process. Please review the checkout summary before paying.",
      },
      {
        question: "How can I track my order?",
        answer: "Our website's live tracking lookup is not currently connected. For help checking an order, use the Order Tracking page to prepare a request or email us with your order number and the email address used at checkout.",
      },
      {
        question: "What if my delivery address is incorrect?",
        answer: "Contact us as soon as possible with your order number and the corrected address. Changes may not be possible after an order has been handed to the courier.",
      },
    ],
  },
  {
    category: "Returns, exchanges & refunds",
    items: [
      {
        question: "Can I return an item for a refund?",
        answer: "Under our standard store policy, products are non-refundable. This does not exclude any rights or remedies that cannot lawfully be excluded. Please read the Return & Refund Policy for the full terms.",
      },
      {
        question: "When can I request an exchange?",
        answer: "An exchange may be requested for a product damaged during transit or with a manufacturing defect. Requests are subject to verification, product availability, and the original-condition requirements in our policy.",
      },
      {
        question: "Can I exchange a size?",
        answer: "Size exchanges may be requested subject to availability and approval. An additional ₹100 courier charge applies. The product must meet the condition requirements in our Return & Refund Policy.",
      },
      {
        question: "How soon should I report a damaged or defective item?",
        answer: "Contact us within 48 hours of delivery. Include your order details and clear photographs of the product and packaging so we can review your request.",
      },
      {
        question: "What condition must an exchanged item be in?",
        answer: "The product must be unused and in its original condition, with original tags and packaging intact. Requests are reviewed under the full Return & Refund Policy.",
      },
    ],
  },
  {
    category: "Account & support",
    items: [
      {
        question: "Do I need an account to shop?",
        answer: "You can browse the store without signing in. Account features are available for customers who register or sign in; the checkout options shown on the website will guide you through placing an order.",
      },
      {
        question: "How do I contact AKURA?",
        answer: "Email arunayanar1997@gmail.com with your question. For order-related requests, include your order number and the email address used at checkout. Do not send passwords or full payment credentials.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-[#F5F5F5]">
      <header className="sticky top-0 z-30 border-b border-[#333333] bg-[#090909]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="shrink-0 text-2xl font-black tracking-[0.18em]">AKURA<span>.</span></Link>
          <nav aria-label="Main navigation" className="flex items-center gap-3 text-[9px] font-semibold tracking-[0.08em] sm:gap-6 sm:text-xs sm:tracking-[0.1em]">
            <Link href="/">SHOP</Link>
            <Link href="/account">ACCOUNT</Link>
            <Link href="/cart">BAG</Link>
            <Link href="/order-tracking">TRACK ORDER</Link>
            <Link href="/contact">CONTACT</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A3A3A3]">Need a hand?</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Frequently asked questions.</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[#A3A3A3] sm:text-lg">
          Straightforward answers about products, orders, delivery and exchanges. If you cannot find what you need, get in touch and we will help.
        </p>

        <div className="mt-12 space-y-12">
          {faqs.map((group, groupIndex) => (
            <section key={group.category} aria-labelledby={`faq-group-${groupIndex}`}>
              <h2 id={`faq-group-${groupIndex}`} className="border-b border-[#444444] pb-4 text-xl font-bold uppercase tracking-[0.12em] sm:text-2xl">
                {group.category}
              </h2>
              <div className="divide-y divide-[#333333]">
                {group.items.map((item, index) => (
                  <details key={item.question} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-5 text-base font-semibold sm:text-lg">
                      <span>{item.question}</span>
                      <span aria-hidden="true" className="shrink-0 text-xl text-[#A3A3A3] transition-transform duration-300 group-open:rotate-45">+</span>
                    </summary>
                    <p className="max-w-3xl pt-4 text-sm leading-7 text-[#A3A3A3] sm:text-base">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 border border-[#333333] bg-[#111111] p-6 sm:p-8">
          <p className="text-xs font-bold tracking-[0.22em] text-[#A3A3A3]">STILL NEED HELP?</p>
          <h2 className="mt-3 text-2xl font-bold">Talk to the AKURA team.</h2>
          <p className="mt-3 text-sm leading-7 text-[#A3A3A3]">For order support, include your order number and checkout email. Please do not send passwords or full payment credentials.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="mailto:arunayanar1997@gmail.com" className="inline-flex bg-white px-5 py-3 text-xs font-bold tracking-[0.12em] text-black transition hover:bg-[#D4D4D4]">EMAIL SUPPORT</a>
            <Link href="/order-tracking" className="inline-flex border border-white/40 px-5 py-3 text-xs font-bold tracking-[0.12em] transition hover:bg-white hover:text-black">ORDER TRACKING</Link>
            <Link href="/refund-policy" className="inline-flex border border-white/40 px-5 py-3 text-xs font-bold tracking-[0.12em] transition hover:bg-white hover:text-black">RETURN POLICY</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#333333] px-6 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 text-sm text-[#A3A3A3]">
          <Link href="/" className="font-black tracking-[0.18em] text-white">AKURA.</Link>
          <div className="flex flex-wrap gap-5">
            <Link href="/about">About</Link>
            <Link href="/our-story">Our story</Link>
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/terms-and-conditions">Terms</Link>
            <Link href="/refund-policy">Returns</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
