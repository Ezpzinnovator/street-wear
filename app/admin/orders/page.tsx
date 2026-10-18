import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminSignOutButton from "../sign-out-button";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/admin/login");

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || admin?.role !== "admin") redirect("/");

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id,order_number,customer_name,customer_email,status,payment_status,total_amount,currency,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="min-h-screen bg-[#090909] p-5 text-[#F5F5F5] sm:p-8">
      <header className="flex items-center justify-between border-b border-[#333333] pb-5">
        <div>
          <Link href="/admin" className="font-bold tracking-widest">AKURA</Link>
          <p className="text-xs text-[#A3A3A3]">ORDER MANAGEMENT</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin" className="text-sm underline">Products</Link>
          <AdminSignOutButton />
        </div>
      </header>
      <h1 className="mt-8 text-3xl font-semibold">Orders</h1>
      <p className="mt-2 text-sm text-[#A3A3A3]">Recent customer orders and payment status.</p>
      {error ? (
        <p className="mt-6 border border-amber-700 p-4 text-sm">
          Orders could not be loaded. Apply the orders migration in Supabase before using this page.
        </p>
      ) : !orders?.length ? (
        <p className="mt-6 border border-[#333333] p-5">
          No orders yet. Orders will appear here once order creation is connected.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="border border-[#333333] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div>
                  <h2 className="font-semibold">{order.order_number}</h2>
                  <p className="mt-1 text-sm">{order.customer_name}</p>
                  <p className="break-all text-xs text-[#A3A3A3]">{order.customer_email}</p>
                  <p className="mt-2 text-xs text-[#A3A3A3]">{new Date(order.created_at).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="border border-[#444444] px-3 py-1">{order.status}</span>
                  <span className="border border-[#444444] px-3 py-1">Payment: {order.payment_status}</span>
                  <strong className="text-base">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: order.currency || "INR" }).format(Number(order.total_amount))}
                  </strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
