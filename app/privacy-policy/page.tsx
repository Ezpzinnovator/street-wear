
import Link from "next/link";

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
      <div className="mt-3 space-y-3 text-sm leading-7 text-[#486581]">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
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
          YOUR PRIVACY MATTERS
        </p>

        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
          Privacy Policy
        </h1>

        <p className="mt-4 text-xs text-[#627D98]">
          Last updated: October 11, 2026
        </p>

        <p className="mt-6 leading-7 text-[#486581]">
          Welcome to <strong>Akura</strong>. This Privacy Policy explains
          how we may collect, use, store, and disclose your personal
          information when you visit our website, browse our products,
          contact us, or make a purchase.
        </p>

        <p className="mt-3 leading-7 text-[#486581]">
          Please read this policy carefully. By using our website, you
          acknowledge that your information may be handled as described
          here, subject to applicable law.
        </p>

        <div className="mt-10 space-y-8">
          <PolicySection title="1. Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy when our business
              practices, website features, or legal requirements change.
              Any revised version will be published on this page along
              with an updated revision date.
            </p>
            <p>
              We encourage you to review this page periodically.
            </p>
          </PolicySection>

          <PolicySection title="2. Personal Information We May Collect">
            <p>
              The information we collect depends on how you interact
              with Akura. It may include the following categories:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Contact details:</strong> name, email address,
                phone number, and delivery address that you provide.
              </li>
              <li>
                <strong>Order information:</strong> products ordered,
                sizes, colours, quantities, delivery details, and
                transaction or payment status where available to us.
              </li>
              <li>
                <strong>Account information:</strong> information
                associated with an account if account registration or
                sign-in features are enabled.
              </li>
              <li>
                <strong>Customer support information:</strong> details
                and messages you send to us when requesting help.
              </li>
              <li>
                <strong>Technical information:</strong> certain
                information about your browser, device, connection, or
                website activity may be processed by our hosting or
                security infrastructure.
              </li>
            </ul>

            <p>
              Please provide only the information necessary to use the
              relevant website feature or complete your request.
            </p>
          </PolicySection>

          <PolicySection title="3. How We Use Your Information">
            <p>Depending on the features you use, we may process your information to:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>Process and manage orders and delivery details.</li>
              <li>Communicate with you about purchases or support requests.</li>
              <li>Maintain website functionality and product information.</li>
              <li>Help protect the website against fraud, misuse, and unauthorised access.</li>
              <li>Maintain business records and meet applicable legal obligations.</li>
              <li>Improve the website and customer experience where appropriate.</li>
            </ul>

            <p>
              We will handle personal information for legitimate purposes
              and in accordance with applicable law.
            </p>
          </PolicySection>

          <PolicySection title="4. Website Technology and Supabase">
            <p>
              Akura's website is built using Next.js and uses Supabase
              for backend services. Depending on the features enabled,
              information you submit may be processed or stored in
              Supabase databases or related services.
            </p>

            <p>
              Where authentication features are enabled, Supabase may
              also process information required to manage sign-in and
              account security.
            </p>

            <p>
              We aim to limit access to personal information to
              authorised systems and people who need it for legitimate
              business purposes.
            </p>
          </PolicySection>

          <PolicySection title="5. Cookies and Similar Technologies">
            <p>
              Our website or its hosting and supporting services may use
              cookies or similar technologies where necessary for
              functionality, security, or remembering preferences.
            </p>

            <p>
              The technologies actually used depend on the features
              enabled on the website. We do not represent that every
              category of analytics or advertising tracker is in use.
            </p>

            <p>
              You can manage cookies through your browser settings.
              Blocking certain cookies may affect some website features.
            </p>
          </PolicySection>

          <PolicySection title="6. When Information May Be Shared">
            <p>
              We do not disclose personal information indiscriminately.
              Information may be shared when reasonably necessary for
              operating the store or fulfilling your request, including
              with:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Technology providers:</strong> services that
                host, secure, or support the website and its database.
              </li>
              <li>
                <strong>Delivery partners:</strong> where needed to
                deliver an order.
              </li>
              <li>
                <strong>Payment providers:</strong> if an external
                payment service is used to process a transaction.
              </li>
              <li>
                <strong>Professional or legal authorities:</strong>{" "}
                where disclosure is required by law or necessary to
                protect legal rights.
              </li>
            </ul>

            <p>
              Third-party providers may process information under their
              own terms and privacy policies. The providers involved
              depend on the services actually used for your transaction.
            </p>
          </PolicySection>

          <PolicySection title="7. Third-Party Websites">
            <p>
              Our website may contain links to external websites or
              services. These websites are operated independently and
              may have their own privacy policies and practices.
            </p>

            <p>
              We encourage you to review the privacy policy of any
              external website before sharing personal information.
              Akura is not responsible for the privacy practices of
              third-party websites outside our control.
            </p>
          </PolicySection>

          <PolicySection title="8. Data Security">
            <p>
              We take reasonable measures to help protect personal
              information against unauthorised access, loss, misuse, or
              alteration.
            </p>

            <p>
              However, no website, storage system, or internet
              transmission can be guaranteed to be completely secure.
              Please avoid sending passwords or sensitive financial
              information through ordinary email or other insecure
              communication channels.
            </p>
          </PolicySection>

          <PolicySection title="9. Data Retention">
            <p>
              We retain personal information only for as long as
              reasonably necessary for the purpose for which it was
              collected, including order management, customer support,
              record keeping, resolving disputes, and meeting legal
              obligations.
            </p>

            <p>
              The retention period depends on the type of information
              and the circumstances. Information may be deleted or
              anonymised when it is no longer required, subject to
              applicable law.
            </p>
          </PolicySection>

          <PolicySection title="10. Your Privacy Rights">
            <p>
              Subject to applicable law, you may be able to request
              access to personal information we hold about you, ask for
              inaccurate information to be corrected, or request
              deletion where appropriate.
            </p>

            <p>
              You may also raise concerns about how your information is
              handled. We may need to verify your identity before
              responding to a request.
            </p>

            <p>
              Some information may need to be retained where required
              by law or for legitimate record-keeping purposes.
            </p>
          </PolicySection>

          <PolicySection title="11. Children's Privacy">
            <p>
              Our website is not intended to encourage children to
              provide personal information without appropriate
              authorisation. If you believe a child has submitted
              personal information inappropriately, please contact us
              so we can review the matter and take appropriate action
              in accordance with applicable law.
            </p>
          </PolicySection>

          <PolicySection title="12. Complaints and Privacy Requests">
            <p>
              If you have a question, concern, or request relating to
              your personal information, please contact us using the
              details below. We will review your request and respond
              in accordance with applicable requirements.
            </p>
          </PolicySection>

          <PolicySection title="13. Contact Akura">
            <p>
              For privacy questions, access requests, correction
              requests, or other concerns, contact:
            </p>

            <p>
              <strong>Akura Customer Support</strong>
            </p>

            <p>
              Email:{" "}
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
