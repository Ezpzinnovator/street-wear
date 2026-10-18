"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PaymentReturnPage() {
  const [status, setStatus] = useState("Checking Razorpay payment response...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkStatus = params.get("razorpay_payment_link_status");
    const signature = params.get("razorpay_signature");
    if (signature && linkStatus === "paid") {
      setStatus("Razorpay returned a paid status. Akura still needs server-side order reconciliation before this can be treated as a confirmed order.");
    } else if (linkStatus) {
      setStatus(`Razorpay reports payment status: ${linkStatus}. If you completed payment, please contact Akura with your payment details.`);
    } else {
      setStatus("We could not confirm a payment response. Please check your Razorpay payment status before trying again.");
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-5 text-[#F5F5F5]">
      <section className="w-full max-w-lg border border-[#333333] p-8 text-center">
        <p className="text-xs font-bold tracking-[0.25em]">AKURA</p>
        <h1 className="mt-5 text-3xl font-semibold">Payment update</h1>
        <p className="mt-4 text-sm leading-6 text-[#B5B5B5]">{status}</p>
        <Link href="/" className="mt-8 inline-block bg-white px-6 py-3 text-xs font-semibold tracking-[0.15em] text-black">RETURN TO SHOP</Link>
      </section>
    </main>
  );
}
