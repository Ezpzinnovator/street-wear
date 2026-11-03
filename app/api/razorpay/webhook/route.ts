import { createAdminClient } from "@/lib/supabase-admin";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidSignature(rawBody: string, supplied: string, secret: string) {
  if (!/^[a-f0-9]{64}$/i.test(supplied)) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqual(Buffer.from(supplied, "hex"), Buffer.from(expected, "hex"));
}

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  if (!isValidSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment_link?: { entity?: { id?: string; reference_id?: string; status?: string; amount?: number; amount_paid?: number } };
        payment?: { entity?: { id?: string; status?: string } };
      };
    };

    if (event.event !== "payment_link.paid") {
      return NextResponse.json({ received: true });
    }

    const link = event.payload?.payment_link?.entity;
    const payment = event.payload?.payment?.entity;
    if (!link?.id || !link.reference_id || link.status !== "paid" ||
        typeof link.amount !== "number" || typeof link.amount_paid !== "number" ||
        link.amount_paid < link.amount) {
      return NextResponse.json({ error: "Incomplete paid payment-link event." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: order, error: lookupError } = await admin
      .from("orders")
      .select("id,total_paise")
      .eq("razorpay_payment_link_id", link.id)
      .eq("razorpay_payment_link_reference_id", link.reference_id)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!order) {
      console.error("Razorpay webhook has no matching AKURA order:", link.reference_id);
      return NextResponse.json({ received: true, matched: false });
    }

    if (Number(order.total_paise) !== link.amount) {
      console.error("Razorpay webhook amount mismatch for order:", order.id);
      return NextResponse.json({ error: "Payment amount does not match the order." }, { status: 409 });
    }

    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: "placed",
        payment_status: "paid",
        razorpay_payment_id: payment?.id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) throw updateError;
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook processing failed:", error instanceof Error ? error.message : JSON.stringify(error));
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
