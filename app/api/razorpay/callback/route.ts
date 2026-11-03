import { createAdminClient } from "@/lib/supabase-admin";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqualHex(actual: string, expected: string) {
  if (!/^[a-f0-9]{64}$/i.test(actual) || !/^[a-f0-9]{64}$/i.test(expected)) return false;
  return timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paymentLinkId = url.searchParams.get("razorpay_payment_link_id") ?? "";
  const referenceId = url.searchParams.get("razorpay_payment_link_reference_id") ?? "";
  const linkStatus = url.searchParams.get("razorpay_payment_link_status") ?? "";
  const paymentId = url.searchParams.get("razorpay_payment_id") ?? "";
  const signature = url.searchParams.get("razorpay_signature") ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || url.origin).replace(/\/$/, "");

  if (!keySecret || !paymentLinkId || !referenceId || !linkStatus || !signature) {
    return NextResponse.redirect(new URL("/payment/return?status=unverified", siteUrl));
  }

  const expected = createHmac("sha256", keySecret)
    .update(`${paymentLinkId}|${referenceId}|${linkStatus}`)
    .digest("hex");
  if (!safeEqualHex(signature, expected)) {
    return NextResponse.redirect(new URL("/payment/return?status=unverified", siteUrl));
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) throw new Error("Razorpay credentials unavailable");
    const response = await fetch(`https://api.razorpay.com/v1/payment_links/${encodeURIComponent(paymentLinkId)}`, {
      headers: { Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64") },
      cache: "no-store",
    });
    const link = await response.json();
    if (!response.ok || link.reference_id !== referenceId) {
      throw new Error("Payment link could not be verified");
    }

    const admin = createAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("id,order_number,total_paise")
      .eq("razorpay_payment_link_id", paymentLinkId)
      .eq("razorpay_payment_link_reference_id", referenceId)
      .maybeSingle();

    if (!order) {
      return NextResponse.redirect(new URL("/payment/return?status=unmatched", siteUrl));
    }

    if (link.amount !== Number(order.total_paise)) {
      throw new Error("Payment-link amount does not match the stored order");
    }

    if (link.status === "paid" && link.amount_paid >= link.amount) {
      const { error } = await admin.from("orders").update({
        status: "placed",
        payment_status: "paid",
        razorpay_payment_id: paymentId || null,
        updated_at: new Date().toISOString(),
      }).eq("id", order.id);
      if (error) throw new Error("Could not update paid order");
      return NextResponse.redirect(new URL(`/payment/return?status=success&order=${encodeURIComponent(order.order_number)}`, siteUrl));
    }

    const paymentStatus = link.status === "cancelled" ? "cancelled" : "pending";
    await admin.from("orders").update({
      status: paymentStatus === "cancelled" ? "cancelled" : "pending_payment",
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    }).eq("id", order.id);

    return NextResponse.redirect(new URL(`/payment/return?status=${encodeURIComponent(paymentStatus)}&order=${encodeURIComponent(order.order_number)}`, siteUrl));
  } catch (error) {
    console.error("Razorpay callback verification failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.redirect(new URL("/payment/return?status=verification_error", siteUrl));
  }
}
