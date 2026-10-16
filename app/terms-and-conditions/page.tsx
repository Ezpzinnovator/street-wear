
import Link from "next/link";

function TermsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[#BFDBFE] pb-7">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-[#486581]">
        {children}
      </div>
    </section>
  );
}

export default function TermsAndConditionsPage() {
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
          PLEASE READ CAREFULLY
        </p>

        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
          Terms &amp; Conditions
        </h1>

        <p className="mt-4 text-xs text-[#627D98]">
          Last updated: October 11, 2026
        </p>

        <p className="mt-6 leading-7 text-[#486581]">
          Welcome to <strong>Akura</strong>. These Terms &amp; Conditions
          explain the rules for accessing our website and purchasing
          products from our online clothing store.
        </p>

        <p className="mt-3 leading-7 text-[#486581]">
          Please read these terms together with our Privacy Policy and
          Return &amp; Refund Policy. Nothing in these terms removes
          rights or remedies that cannot lawfully be excluded.
        </p>

        <div className="mt-10 space-y-8">
          <TermsSection title="1. About Akura">
            <p>
              Akura is an online clothing store offering apparel and
              designs inspired by personal style, pop culture, anime,
              movies, sports, and other creative themes.
            </p>
            <p>
              Product descriptions, availability, and prices are
              displayed on the website and may be updated when needed.
            </p>
          </TermsSection>

          <TermsSection title="2. Website Use and Eligibility">
            <p>
              You agree to use the website for lawful purposes and to
              provide accurate information when placing orders or
              contacting us.
            </p>
            <p>
              You must not misuse the website, attempt unauthorised
              access, interfere with its operation, or use it for
              fraudulent or unlawful activities.
            </p>
            <p>
              If account features are provided, you are responsible
              for taking reasonable steps to protect your credentials.
            </p>
          </TermsSection>

          <TermsSection title="3. Products, Colours and Availability">
            <p>
              We aim to display product details, sizes, colours,
              photographs, and prices as accurately as possible.
              Colours may look different depending on your screen.
            </p>
            <p>
              Product availability may change. If a listing contains
              an error or a product becomes unavailable, we may need
              to correct the listing or contact you about an affected
              order, subject to applicable law.
            </p>
          </TermsSection>

          <TermsSection title="4. Prices and Payments">
            <p>
              Prices are displayed in Indian Rupees (INR), unless
              stated otherwise. Any applicable delivery charges or
              other charges will be communicated where relevant.
            </p>
            <p>
              Orders requiring payment are subject to the applicable
              payment process and confirmation. Never share passwords
              or sensitive payment credentials through ordinary email
              or customer support messages.
            </p>
          </TermsSection>

          <TermsSection title="5. Orders and Cancellation">
            <p>
              Please review your selected products, sizes, colours,
              quantities, and delivery details before placing an order.
            </p>
            <p>
              Order processing depends on product availability and
              successful completion of the applicable checkout process.
            </p>
            <p>
              Under our standard store policy, orders cannot be
              cancelled once shipped. This does not override any
              cancellation rights or remedies required by applicable law.
            </p>
          </TermsSection>

          <TermsSection title="6. Shipping and Delivery">
            <p>
              Delivery times may depend on your location, courier
              service, product availability, and circumstances outside
              our reasonable control.
            </p>
            <p>
              Please provide an accurate delivery address, phone number,
              and other required information. We use the information
              provided to help fulfil your order.
            </p>
          </TermsSection>

          <TermsSection title="7. Returns, Exchanges and Refunds">
            <p>
              Returns, exchanges, and refunds are governed by our
              Return &amp; Refund Policy, which should be read together
              with these terms.
            </p>
            <p>
              Under our standard policy, eligible exchanges may be
              requested for qualifying transit damage or manufacturing
              defects, subject to verification and the stated conditions.
            </p>
            <p>
              A ₹100 courier charge applies to a size exchange. Our
              standard exchange request deadline is 48 hours after
              delivery. Please review the full policy for eligibility
              and product-condition requirements.
            </p>
            <Link
              href="/refund-policy"
              className="inline-block font-semibold text-[#2563EB] underline underline-offset-4"
            >
              Read the Return &amp; Refund Policy
            </Link>
          </TermsSection>

          <TermsSection title="8. Intellectual Property">
            <p>
              Akura's website content, including its branding, text,
              graphics, product photographs, and original designs, may
              be protected by intellectual property laws.
            </p>
            <p>
              You may not reproduce, modify, distribute, sell, or
              commercially reuse Akura content without the necessary
              permission, except where permitted by law.
            </p>
            <p>
              Third-party trademarks, names, characters, and logos
              remain the property of their respective owners. Mentioning
              a third-party property does not itself imply endorsement
              or affiliation.
            </p>
          </TermsSection>

          <TermsSection title="9. Fan-Created Artwork Disclaimer">
            <p>
              Akura aims to feature artwork and designs created by fans
              and independent artists rather than images copied directly
              from publications or websites.
            </p>
            <p>
              Unless expressly stated, our products are not represented
              as official merchandise or as endorsed by any third-party
              studio, publisher, production company, or rights holder.
            </p>
            <p>
              Fan-created artwork may still involve third-party
              intellectual property. This statement does not grant
              permission to use copyrighted characters, trademarks,
              or other protected material. We will review credible
              intellectual property concerns submitted to us.
            </p>
          </TermsSection>

          <TermsSection title="10. User Submissions">
            <p>
              If the website allows you to submit reviews, images,
              messages, or other content, you are responsible for
              ensuring that you have the rights and permissions needed
              to submit it.
            </p>
            <p>
              You must not submit unlawful, misleading, abusive, or
              infringing content. This section applies only to
              submission features actually available on the website.
            </p>
          </TermsSection>

          <TermsSection title="11. Prohibited Activities and Website Security">
            <p>You must not:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Attempt unauthorised access to accounts, systems, or data.</li>
              <li>Probe, scan, or test website security without permission.</li>
              <li>Upload malicious code or attempt to disrupt the website.</li>
              <li>Send spam or use the website for fraudulent activities.</li>
              <li>
                Use automated tools to scrape, overload, or interfere
                with the website in an unauthorised manner.
              </li>
            </ul>
            <p>
              We may investigate suspected misuse and take reasonable
              protective measures in accordance with applicable law.
            </p>
          </TermsSection>

          <TermsSection title="12. Payment Failures and Suspected Fraud">
            <p>
              If a payment is declined, remains unconfirmed, or appears
              suspicious, we may pause order processing while the
              transaction is reviewed.
            </p>
            <p>
              Where there are reasonable grounds to suspect fraud, we
              may reject or cancel an affected transaction, subject
              to applicable law and any refund obligations that apply.
            </p>
          </TermsSection>

          <TermsSection title="13. Suspension and Termination">
            <p>
              We may restrict or suspend access to website features
              where reasonably necessary to investigate suspected fraud,
              unlawful activity, security risks, or serious violations
              of these terms.
            </p>
            <p>
              Any action affecting an order or customer account will
              remain subject to applicable law and relevant consumer
              rights.
            </p>
          </TermsSection>

          <TermsSection title="14. Third-Party Services and Websites">
            <p>
              Our website uses third-party technology providers for
              some of its infrastructure and may use other providers
              for payments, delivery, or additional services depending
              on the features enabled.
            </p>
            <p>
              External websites and services may have their own terms
              and privacy policies. We are not responsible for services
              outside our control, subject to applicable law.
            </p>
          </TermsSection>

          <TermsSection title="15. Website Availability and Disclaimer">
            <p>
              We aim to keep the website available and information
              accurate, but temporary interruptions, technical errors,
              maintenance, or service-provider issues may occur.
            </p>
            <p>
              We cannot guarantee uninterrupted or error-free website
              operation. Nothing in this section excludes product
              guarantees, consumer remedies, or other rights that
              cannot lawfully be excluded.
            </p>
          </TermsSection>

          <TermsSection title="16. Limitation of Liability">
            <p>
              To the extent permitted by applicable law, Akura will
              not be liable for indirect losses arising from temporary
              website interruptions or events outside its reasonable
              control.
            </p>
            <p>
              Nothing in these terms excludes or limits liability,
              consumer rights, or remedies that cannot legally be
              excluded or limited.
            </p>
          </TermsSection>

          <TermsSection title="17. Privacy">
            <p>
              Personal information is handled in accordance with our
              Privacy Policy. Please read it to understand how
              information may be collected, used, and protected.
            </p>
            <Link
              href="/privacy-policy"
              className="inline-block font-semibold text-[#2563EB] underline underline-offset-4"
            >
              Read the Privacy Policy
            </Link>
          </TermsSection>

          <TermsSection title="18. Entire Agreement and Severability">
            <p>
              These terms should be read with the Privacy Policy and
              Return &amp; Refund Policy. Additional terms may apply to
              specific services when clearly communicated.
            </p>
            <p>
              If a provision is found unenforceable, the remaining
              provisions will continue to apply to the extent permitted
              by law.
            </p>
          </TermsSection>

          <TermsSection title="19. Changes to These Terms">
            <p>
              We may update these terms to reflect changes to our
              website, operations, or legal requirements. The revised
              version will be published on this page with an updated
              date.
            </p>
          </TermsSection>

          <TermsSection title="20. Governing Law">
            <p>
              These terms are subject to applicable laws of India.
              Disputes will be handled by the appropriate forum in
              accordance with applicable law and consumer rights.
            </p>
          </TermsSection>

          <TermsSection title="21. Contact Us">
            <p>
              For questions about these terms or intellectual property
              concerns, contact Akura Customer Support:
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:arunayanar1997@gmail.com"
                className="font-semibold text-[#2563EB] underline underline-offset-4"
              >
                arunayanar1997@gmail.com
              </a>
            </p>
          </TermsSection>
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
