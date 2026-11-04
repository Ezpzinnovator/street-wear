import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

const FULFILLMENT_STATUSES = ["new", "processing", "packed", "shipped", "delivered", "cancelled"] as const;

async function authorizeAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { response: NextResponse.json({ error: "You must be logged in." }, { status: 401 }) };
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || admin?.role !== "admin") {
    return { response: NextResponse.json({ error: "Administrator access required." }, { status: 403 }) };
  }

  return { response: null };
}

export async function GET() {
  const auth = await authorizeAdmin();
  if (auth.response) return auth.response;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("orders")
      .select("id,order_number,status,payment_status,fulfillment_status,currency,subtotal_paise,shipping_paise,total_paise,customer_name,customer_email,customer_phone,shipping_address,created_at,updated_at,razorpay_payment_id,inventory_deducted,inventory_issue,order_items(id,product_name,size,color,quantity,unit_price_paise,line_total_paise)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ orders: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin orders lookup failed:", error instanceof Error ? error.message : JSON.stringify(error));
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await authorizeAdmin();
  if (auth.response) return auth.response;

  try {
    const body = await request.json() as { id?: unknown; fulfillment_status?: unknown };
    if (typeof body.id !== "string" || typeof body.fulfillment_status !== "string" ||
        !FULFILLMENT_STATUSES.includes(body.fulfillment_status as typeof FULFILLMENT_STATUSES[number])) {
      return NextResponse.json({ error: "A valid order and fulfillment status are required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const update: Record<string, string | null> = {
      fulfillment_status: body.fulfillment_status,
      updated_at: new Date().toISOString(),
    };
    if (body.fulfillment_status === "shipped") update.shipped_at = new Date().toISOString();
    if (body.fulfillment_status === "delivered") update.delivered_at = new Date().toISOString();

    const { data, error } = await admin
      .from("orders")
      .update(update)
      .eq("id", body.id)
      .select("id,order_number,fulfillment_status,shipped_at,delivered_at")
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    return NextResponse.json({ order: data });
  } catch (error) {
    console.error("Admin order update failed:", error instanceof Error ? error.message : JSON.stringify(error));
    return NextResponse.json({ error: "Could not update order." }, { status: 500 });
  }
}
