import { createClient } from "@/lib/supabase-server";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

type RequestItem = { productId: string; quantity: number; size?: string; color?: string };
type Customer = { name: string; email: string; phone: string; address: string; city: string; state: string; pincode: string };

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay is not configured yet. Please try again later." }, { status: 503 });
    }

    const body = await request.json() as { items?: RequestItem[]; customer?: Customer };
    const items = body.items;
    const customer = body.customer;
    if (!Array.isArray(items) || items.length < 1 || items.length > 30 || !customer) {
      return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
    }

    const name = String(customer.name ?? "").trim();
    const email = String(customer.email ?? "").trim();
    const phone = String(customer.phone ?? "").trim();
    const address = String(customer.address ?? "").trim();
    const city = String(customer.city ?? "").trim();
    const state = String(customer.state ?? "").trim();
    const pincode = String(customer.pincode ?? "").trim();
    if (!name || name.length > 60 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[6-9]\d{9}$/.test(phone) || address.length < 5 || address.length > 200 || !city || !state || !/^[1-9]\d{5}$/.test(pincode)) {
      return NextResponse.json({ error: "Please provide valid customer and delivery details." }, { status: 400 });
    }

    const supabase = await createClient();
    const ids = [...new Set(items.map(item => String(item.productId ?? "")))];
    if (ids.some(id => !id) || items.some(item => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20)) {
      return NextResponse.json({ error: "Invalid product or quantity." }, { status: 400 });
    }

    const { data: products, error } = await supabase
      .from("products")
      .select("id,name,price,stock,is_active,sizes,colors")
      .in("id", ids);
    if (error || !products || products.length !== ids.length) {
      return NextResponse.json({ error: "Some products are no longer available." }, { status: 400 });
    }

    let total = 0;
    const descriptionParts: string[] = [];
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.is_active === false || Number(product.stock) < item.quantity) {
        return NextResponse.json({ error: "An item is unavailable or has insufficient stock." }, { status: 400 });
      }
      if (Array.isArray(product.sizes) && product.sizes.length && !product.sizes.includes(item.size ?? "")) {
        return NextResponse.json({ error: "Please select a valid size." }, { status: 400 });
      }
      const price = Number(product.price);
      if (!Number.isFinite(price) || price <= 0) return NextResponse.json({ error: "A product has an invalid price." }, { status: 400 });
      total += Math.round(price * 100) * item.quantity;
      descriptionParts.push(`${product.name} x${item.quantity}`);
    }

    if (!Number.isSafeInteger(total) || total < 100) {
      return NextResponse.json({ error: "The order total is invalid." }, { status: 400 });
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
    const referenceId = randomUUID();
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: total,
        currency: "INR",
        accept_partial: false,
        reference_id: referenceId,
        description: `Akura order: ${descriptionParts.join(", ")}`.slice(0, 200),
        customer: { name, email, contact: `+91${phone}` },
        notify: { email: false, sms: false },
        reminder_enable: false,
        callback_url: `${siteUrl}/payment/return`,
        callback_method: "get",
        notes: {
          shipping_address: `${address}, ${city}, ${state} ${pincode}`.slice(0, 256),
          order_reference: referenceId,
        },
      }),
      cache: "no-store",
    });

    const result = await razorpayResponse.json();
    if (!razorpayResponse.ok || typeof result.short_url !== "string") {
      console.error("Razorpay Payment Link creation failed:", result?.error?.code || razorpayResponse.status);
      return NextResponse.json({ error: "Razorpay could not create the payment link. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ paymentUrl: result.short_url });
  } catch (error) {
    console.error("Payment link route error:", error);
    return NextResponse.json({ error: "Unable to start payment right now." }, { status: 500 });
  }
}
