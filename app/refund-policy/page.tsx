
import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#EFF6FF] text-[#102A43]">
      <header className="border-b border-[#BFDBFE] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-[0.18em]"
          >
            AKURA<span className="text-[#3B82F6]">.</span>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold tracking-widest hover:text-[#3B82F6]"
          >
            BACK TO HOME
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-xs font-bold tracking-[0.3em] text-[#3B82F6]">
          CUSTOMER SUPPORT
        </p>

        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
          Return &amp; Refund Policy
        </h1>

        <p className="mt-6 leading-7 text-[#486581]">
          Thank you for shopping at <strong>Akura</strong>. We appreciate
          your trust in our brand and hope you love every purchase.
          Please review the following terms before placing your order.
        </p>

        <p className="mt-3 leading-7 text-[#486581]">
          By placing an order through Akura, you acknowledge this policy,
          subject to applicable law.
        </p>

        <div className="mt-10 space-y-8">
          <PolicySection title="1. Return & Refund Policy">
            <p>
              All products are non-refundable under our standard store
              policy. Exchanges may be requested only under the conditions
              listed below. This policy does not exclude any rights or
              remedies required by applicable law.
            </p>
          </PolicySection>

          <PolicySection title="2. Products Eligible for Exchange">
            <p>An exchange may be requested if:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>The product arrives damaged during transit.</li>
              <li>The product has a manufacturing defect.</li>
            </ul>
            <p className="mt-3">
              The product must be in its original condition, with its
              original tags and packaging intact. Exchange requests are
              subject to verification and product availability.
            </p>
          </PolicySection>

          <PolicySection title="3. Size Exchange & Courier Charges">
            <p>
              Size exchanges may be requested subject to availability
              and approval by Akura.
            </p>
            <div className="mt-4 border border-[#BFDBFE] bg-white p-5">
              <p className="text-xs font-bold tracking-widest text-[#3B82F6]">
                SIZE EXCHANGE COURIER CHARGE
              </p>
              <p className="mt-2 text-3xl font-bold">₹100</p>
              <p className="mt-2 text-sm leading-6 text-[#486581]">
                An additional ₹100 courier charge applies to a size
                exchange. This charge is separate from the original
                order amount.
              </p>
            </div>
          </PolicySection>

          <PolicySection title="4. Products Not Eligible for Exchange">
            <p>An exchange will generally not be accepted if:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                The request is not raised within 48 hours of delivery.
              </li>
              <li>
                The product has been used, altered, or damaged after
                delivery and is no longer in its original condition.
              </li>
              <li>Original tags or packaging are missing.</li>
              <li>
                The request does not meet the exchange conditions above.
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="5. Order Cancellation">
            <p>
              Orders cannot be cancelled once they have been shipped.
              Please review your order details carefully before placing
              an order.
            </p>
          </PolicySection>

          <PolicySection title="6. How to Request an Exchange">
            <p>
              Contact Akura within 48 hours of delivery for a damaged,
              defective, or otherwise eligible product. Include your
              order details and clear photographs of the product and
              packaging so our team can review your request.
            </p>
            <p className="mt-3">
              All requests are subject to verification and approval.
            </p>
          </PolicySection>

          <PolicySection title="7. Contact Us">
            <p>
              For exchange requests or questions about this policy,
              contact Akura Customer Support:
            </p>
            <p className="mt-3">
              <a
                href="mailto:arunayanar1997@gmail.com"
                className="font-semibold text-[#2563EB] underline underline-offset-4"
              >
                arunayanar1997@gmail.com
              </a>
            </p>
          </PolicySection>
        </div>

        <div className="mt-12 border-t border-[#BFDBFE] pt-6">
          <Link
            href="/"
            className="text-sm font-semibold text-[#2563EB] hover:underline"
          >
            ← Return to Akura
          </Link>
        </div>
      </section>

      <footer className="bg-[#102A43] px-5 py-8 text-center text-xs text-white/60">
        AKURA — Wear your own story.
      </footer>
    </main>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[#BFDBFE] pb-7">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-[#486581]">
        {children}
      </div>
    </section>
  );
}
