import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestItem = {
  productId: string;
  quantity: number;
  size?: string;
};
type Customer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export async function POST(request: Request) {
  let orderId: string | null = null;
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Online payment is temporarily unavailable." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      items?: RequestItem[];
      customer?: Customer;
    };
    const items = body.items;
    const customer = body.customer;
    if (!Array.isArray(items) || items.length < 1 || items.length > 30 || !customer) {
      return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
    }

    const name = String(customer.name ?? "").trim();
    const email = String(customer.email ?? "").trim().toLowerCase();
    const phone = String(customer.phone ?? "").trim();
    const address = String(customer.address ?? "").trim();
    const city = String(customer.city ?? "").trim();
    const state = String(customer.state ?? "").trim();
    const pincode = String(customer.pincode ?? "").trim();
    if (
      !name || name.length > 60 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^[6-9]\d{9}$/.test(phone) ||
      address.length < 5 || address.length > 200 ||
      !city || city.length > 60 || !state || state.length > 60 ||
      !/^[1-9]\d{5}$/.test(pincode)
    ) {
      return NextResponse.json({ error: "Please provide valid delivery details." }, { status: 400 });
    }

    const ids = [...new Set(items.map((item) => String(item.productId ?? "")))];
    if (
      ids.some((id) => !id) ||
      items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20)
    ) {
      return NextResponse.json({ error: "Invalid product or quantity." }, { status: 400 });
    }

    const sessionClient = await createClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    const admin = createAdminClient();
    const { data: products, error: productError } = await admin
      .from("products")
      .select("id,name,price,stock,is_active,sizes,image_url")
      .in("id", ids);

    if (productError) {
      console.error("Razorpay product lookup database error:", {
        code: productError.code,
        message: productError.message,
        requestedProductCount: ids.length,
      });
      return NextResponse.json(
        { error: "We couldn't verify product inventory. Please try again later." },
        { status: 503 }
      );
    }

    if (!products || products.length !== ids.length) {
      const foundIds = new Set((products ?? []).map((product) => String(product.id)));
      const missingProductCount = ids.filter((id) => !foundIds.has(id)).length;
      console.error("Razorpay product ID mismatch:", {
        requestedProductCount: ids.length,
        returnedProductCount: products?.length ?? 0,
        missingProductCount,
      });
      return NextResponse.json(
        { error: "One or more bag items no longer match our product catalogue. Remove the item and add it again." },
        { status: 409 }
      );
    }

    const orderItems: Array<{
      product_id: string;
      product_name: string;
      product_image_url: string | null;
      selected_size: string | null;
      selected_color: string | null;
      quantity: number;
      unit_price: number;
      line_total: number;
    }> = [];
    let totalPaise = 0;

    for (const item of items) {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product || product.is_active === false || Number(product.stock) < item.quantity) {
        return NextResponse.json({ error: "An item is unavailable or has insufficient stock." }, { status: 400 });
      }
      if (Array.isArray(product.sizes) && product.sizes.length && !product.sizes.includes(item.size ?? "")) {
        return NextResponse.json({ error: "Please select a valid size for each item." }, { status: 400 });
      }
      const price = Number(product.price);
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ error: "A product has an invalid price." }, { status: 400 });
      }
      const lineTotal = Math.round(price * 100) * item.quantity;
      totalPaise += lineTotal;
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_image_url: product.image_url ?? null,
        selected_size: item.size || null,
        selected_color: null,
        quantity: item.quantity,
        unit_price: price,
        line_total: lineTotal / 100,
      });
    }

    if (!Number.isSafeInteger(totalPaise) || totalPaise < 100) {
      return NextResponse.json({ error: "The order total is invalid." }, { status: 400 });
    }

    const orderNumber = `AKR-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const referenceId = randomUUID();
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user?.id ?? null,
        status: "pending_payment",
        payment_status: "pending",
        currency: "INR",
        subtotal_amount: totalPaise / 100,
        shipping_amount: 0,
        total_amount: totalPaise / 100,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_address: { address, city, state, pincode, country: "India" },
        razorpay_payment_link_reference_id: referenceId,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order creation failed:", orderError?.code ?? "unknown");
      return NextResponse.json({ error: "We couldn't create your order. Please try again." }, { status: 500 });
    }
    orderId = order.id;

    const { error: itemsError } = await admin
      .from("order_items")
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
    if (itemsError) {
      await admin.from("orders").delete().eq("id", order.id);
      console.error("Order item creation failed:", itemsError.code);
      return NextResponse.json({ error: "We couldn't save your order items. Please try again." }, { status: 500 });
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: totalPaise,
        currency: "INR",
        accept_partial: false,
        reference_id: referenceId,
        description: `Akura order ${orderNumber}`,
        customer: { name, email, contact: `+91${phone}` },
        notify: { email: false, sms: false },
        reminder_enable: false,
        callback_url: `${siteUrl}/api/razorpay/callback`,
        callback_method: "get",
        notes: { order_id: order.id, order_number: orderNumber },
      }),
      cache: "no-store",
    });

    const razorpayResult = await razorpayResponse.json();
    if (!razorpayResponse.ok || typeof razorpayResult.short_url !== "string" || typeof razorpayResult.id !== "string") {
      await admin.from("orders").update({ status: "payment_link_failed", payment_status: "failed" }).eq("id", order.id);
      console.error("Razorpay link creation failed:", razorpayResult?.error?.code ?? razorpayResponse.status);
      return NextResponse.json({ error: "Razorpay couldn't start the payment. Your order was not charged; please try again." }, { status: 502 });
    }

    const { error: linkSaveError } = await admin
      .from("orders")
      .update({ razorpay_payment_link_id: razorpayResult.id })
      .eq("id", order.id);
    if (linkSaveError) {
      console.error("Payment link reference save failed:", linkSaveError.code);
      return NextResponse.json({ error: "Payment was created but could not be linked to the order. Please contact support before retrying." }, { status: 500 });
    }

    return NextResponse.json({ paymentUrl: razorpayResult.short_url, orderNumber });
  } catch (error) {
    console.error("Razorpay checkout error:", error instanceof Error ? error.message : "unknown");
    if (orderId) {
      try {
        const admin = createAdminClient();
        await admin.from("orders").update({ status: "checkout_error", payment_status: "failed" }).eq("id", orderId);
      } catch { /* preserve the original checkout response */ }
    }
    return NextResponse.json({ error: "Unable to start payment right now. Please try again." }, { status: 500 });
  }
}
