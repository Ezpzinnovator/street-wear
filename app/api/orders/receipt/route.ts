import { createAdminClient } from "@/lib/supabase-admin";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("order") ?? "";
  const token = url.searchParams.get("token") ?? "";
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret || !/^\\d+$/.test(orderNumber) || !/^[a-f0-9]{64}$/i.test(token)) {
    return NextResponse.json({ error: "Invalid receipt request." }, { status: 400 });
  }

  const expected = createHmac("sha256", secret)
    .update(`akura-order-receipt:${orderNumber}`)
    .digest("hex");
  if (!timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"))) {
    return NextResponse.json({ error: "Receipt could not be verified." }, { status: 403 });
  }

  try {
    const admin = createAdminClient();
    const { data: order, error } = await admin
      .from("orders")
      .select("order_number,status,payment_status,currency,total_paise,order_items(product_name,size,color,quantity,unit_price_paise,line_total_paise)")
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (error) throw error;
    if (!order || order.status !== "placed" || order.payment_status !== "paid") {
      return NextResponse.json({ error: "This order is not confirmed as paid." }, { status: 404 });
    }

    return NextResponse.json({
      receipt: {
        orderNumber: String(order.order_number),
        currency: order.currency,
        totalPaise: Number(order.total_paise),
        items: (order.order_items ?? []).map((item: {
          product_name: string;
          size: string | null;
          color: string | null;
          quantity: number;
          unit_price_paise: number;
          line_total_paise: number;
        }) => ({
          product_name: item.product_name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unit_price_paise: Number(item.unit_price_paise),
          line_total_paise: Number(item.line_total_paise),
        })),
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Order receipt lookup failed:", error instanceof Error ? error.message : JSON.stringify(error));
    return NextResponse.json({ error: "Unable to load this order receipt." }, { status: 500 });
  }
}
