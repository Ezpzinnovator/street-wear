"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PaymentReturnPage() {
  const [status, setStatus] = useState("Checking verified payment status...");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("status") || "unverified";
    const order = params.get("order") || "";

    if (paymentStatus === "success" && order) {
      setOrderNumber(order);
      setStatus("Payment received and verified. Your AKURA order has been confirmed.");
      localStorage.removeItem("akura-cart");
      localStorage.removeItem("akura-buy-now");
      sessionStorage.removeItem("akura-checkout-mode");
    } else if (paymentStatus === "pending") {
      setStatus("Your payment is still pending. Please wait for the payment status to update before trying again.");
    } else if (paymentStatus === "cancelled") {
      setStatus("This payment link was cancelled. Your order has not been confirmed.");
    } else if (paymentStatus === "unmatched") {
      setStatus("We received a payment response, but could not match it to an AKURA order. Please contact support before making another payment.");
    } else if (paymentStatus === "verification_error") {
      setStatus("We couldn't complete payment verification just now. Please contact support with your Razorpay payment details before retrying.");
    } else {
      setStatus("We couldn't verify this payment response. Your order is not confirmed yet. Please contact support if money was deducted.");
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-5 text-[#F5F5F5]">
      <section className="w-full max-w-lg border border-[#333333] p-8 text-center">
        <p className="text-xs font-bold tracking-[0.25em]">AKURA</p>
        <h1 className="mt-5 text-3xl font-semibold">
          {orderNumber ? "Order confirmed" : "Payment update"}
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#B5B5B5]">{status}</p>
        {orderNumber && (
          <p className="mt-5 border border-[#333333] px-4 py-3 text-sm">
            Order reference: <strong>{orderNumber}</strong>
          </p>
        )}
        <Link href="/" className="mt-8 inline-block bg-white px-6 py-3 text-xs font-semibold tracking-[0.15em] text-black">
          RETURN TO SHOP
        </Link>
      </section>
    </main>
  );
}
