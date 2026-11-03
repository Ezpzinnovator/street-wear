"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ReceiptItem = {
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price_paise: number;
  line_total_paise: number;
};

type Receipt = {
  orderNumber: string;
  currency: string;
  totalPaise: number;
  items: ReceiptItem[];
};

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

export default function PaymentReturnPage() {
  const [status, setStatus] = useState("Checking verified payment status...");
  const [orderNumber, setOrderNumber] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReceipt() {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get("status") || "unverified";
      const order = params.get("order") || "";
      const receiptToken = params.get("receipt") || "";

      if (paymentStatus === "success" && order && receiptToken) {
        setStatus("Verifying your order...");
        try {
          const response = await fetch(
            `/api/orders/receipt?order=${encodeURIComponent(order)}&token=${encodeURIComponent(receiptToken)}`,
            { cache: "no-store" }
          );
          const result = await response.json();
          if (!response.ok || !result.receipt) {
            throw new Error(result.error || "Receipt verification failed.");
          }
          if (!active) return;
          setReceipt(result.receipt as Receipt);
          setOrderNumber(String(result.receipt.orderNumber));
          setConfirmed(true);
          setStatus("Payment received and verified. Your AKURA order has been confirmed.");
          localStorage.removeItem("akura-cart");
          localStorage.removeItem("akura-buy-now");
          sessionStorage.removeItem("akura-checkout-mode");
        } catch {
          if (!active) return;
          setStatus("We couldn't securely retrieve your order details. Please contact support before making another payment.");
        }
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
    }

    void loadReceipt();
    return () => { active = false; };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-5 py-10 text-[#F5F5F5]">
      <section className="w-full max-w-lg border border-[#333333] p-6 text-center sm:p-8">
        <p className="text-xs font-bold tracking-[0.25em]">AKURA</p>
        <h1 className="mt-5 text-3xl font-semibold">
          {confirmed ? "Order confirmed" : "Payment update"}
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#B5B5B5]">{status}</p>

        {confirmed && receipt && (
          <div className="mt-6 text-left">
            <p className="border border-[#333333] px-4 py-3 text-center text-sm">
              Order reference: <strong>{orderNumber}</strong>
            </p>
            <div className="mt-5 space-y-4">
              {receipt.items.map((item, index) => (
                <div key={index} className="border-b border-[#333333] pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold">{item.product_name}</h2>
                      <p className="mt-1 text-xs leading-5 text-[#A3A3A3]">
                        {[item.size && `Size: ${item.size}`, item.color && `Colour: ${item.color}`, `Qty: ${item.quantity}`].filter(Boolean).join(" · ")}
                      </p>
                      <p className="mt-1 text-xs text-[#A3A3A3]">{formatPrice(item.unit_price_paise)} each</p>
                    </div>
                    <p className="shrink-0 text-sm font-medium">{formatPrice(item.line_total_paise)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-between gap-4 text-sm font-semibold">
              <span>Total paid</span>
              <span>{formatPrice(receipt.totalPaise)}</span>
            </div>
          </div>
        )}

        <Link href="/" className="mt-8 inline-block bg-white px-6 py-3 text-xs font-semibold tracking-[0.15em] text-black">
          RETURN TO SHOP
        </Link>
      </section>
    </main>
  );
}
