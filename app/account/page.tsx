import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AccountProfile from "./account-profile";
import AccountAddresses from "./account-addresses";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login?next=%2Faccount");

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "";

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id,order_number,status,payment_status,total_amount,currency,created_at,order_items(id,product_name,product_image_url,selected_size,selected_color,quantity,unit_price,line_total)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(25);

  return (
    <main className="min-h-screen bg-[#0D0D0D] px-4 py-10 text-[#F5F5F5] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link href="/" className="text-xs font-semibold tracking-[0.2em] text-[#D4D4D4]">AKURA</Link>
            <h1 className="mt-3 text-3xl font-semibold">My Account</h1>
            <p className="mt-2 text-sm text-[#A3A3A3]">Manage your profile, delivery addresses, and orders.</p>
          </div>
          <Link href="/" className="w-fit border border-[#333333] px-5 py-3 text-xs font-semibold hover:border-[#F5F5F5]">CONTINUE SHOPPING</Link>
        </header>

        <section className="border border-[#333333] bg-[#111111] p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Profile details</h2>
          <p className="mt-2 text-sm text-[#A3A3A3]">Update the name associated with your Akura account.</p>
          <div className="mt-6">
            <AccountProfile initialName={fullName} email={user.email ?? ""} />
          </div>
        </section>

        <AccountAddresses />

        <section className="mt-8 border border-[#333333] bg-[#111111] p-6 sm:p-8">
          <h2 className="text-xl font-semibold">My Orders</h2>
          <p className="mt-2 text-sm text-[#A3A3A3]">Your latest 25 orders and their payment status.</p>

          {ordersError ? (
            <p className="mt-5 border border-amber-700 p-4 text-sm">
              Order history is not available yet. The orders migration must be applied in Supabase.
            </p>
          ) : !orders?.length ? (
            <div className="mt-5 border border-[#333333] p-5">
              <p>No orders yet.</p>
              <Link href="/" className="mt-3 inline-block text-sm underline">Explore the collection</Link>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="border border-[#333333] p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{order.order_number}</h3>
                      <p className="mt-1 text-xs text-[#A3A3A3]">{new Date(order.created_at).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="border border-[#444444] px-3 py-1">Order: {order.status}</span>
                      <span className="border border-[#444444] px-3 py-1">Payment: {order.payment_status}</span>
                      <strong className="px-1 text-sm">
                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: order.currency || "INR" }).format(Number(order.total_amount))}
                      </strong>
                    </div>
                  </div>
                  {order.order_items?.length ? (
                    <ul className="mt-4 divide-y divide-[#333333]">
                      {order.order_items.map((item) => (
                        <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                          <div>
                            <p>{item.product_name} × {item.quantity}</p>
                            <p className="mt-1 text-xs text-[#A3A3A3]">
                              {[item.selected_size, item.selected_color].filter(Boolean).join(" / ") || "Standard"}
                            </p>
                          </div>
                          <span className="shrink-0">{new Intl.NumberFormat("en-IN", { style: "currency", currency: order.currency || "INR" }).format(Number(item.line_total))}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
