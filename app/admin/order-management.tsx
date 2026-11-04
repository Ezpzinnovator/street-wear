"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type OrderItem = {
  id: string;
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price_paise: number;
  line_total_paise: number;
};

type Order = {
  id: string;
  order_number: number | string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  currency: string;
  subtotal_paise: number;
  shipping_paise: number;
  total_paise: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Record<string, unknown> | null;
  created_at: string;
  razorpay_payment_id: string | null;
  inventory_deducted: boolean;
  inventory_issue: string | null;
  order_items: OrderItem[];
};

const statuses = [
  { value: "new", label: "New order" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function money(paise: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(paise || 0) / 100);
}

function addressText(address: Record<string, unknown> | null) {
  if (!address) return "No shipping address saved";
  return Object.values(address).filter((value) => typeof value === "string" && value.trim()).join(", ") || "Address details unavailable";
}

function dateText(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadOrders = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load orders.");
      setOrders(result.orders ?? []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
    const timer = window.setInterval(() => void loadOrders(true), 30000);
    return () => window.clearInterval(timer);
  }, [loadOrders]);

  const paidOrders = orders.filter((order) => order.payment_status === "paid");
  const newOrders = paidOrders.filter((order) => order.fulfillment_status === "new");
  const processingOrders = paidOrders.filter((order) => ["processing", "packed"].includes(order.fulfillment_status));
  const shippedOrders = paidOrders.filter((order) => order.fulfillment_status === "shipped");
  const visibleOrders = useMemo(() => orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "paid") return order.payment_status === "paid";
    if (filter === "pending") return order.payment_status !== "paid";
    return order.fulfillment_status === filter;
  }), [orders, filter]);

  async function updateStatus(order: Order, fulfillment_status: string) {
    setBusyId(order.id);
    setNotice("");
    setError("");
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, fulfillment_status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update order.");
      setOrders((current) => current.map((item) => item.id === order.id
        ? { ...item, fulfillment_status: result.order.fulfillment_status }
        : item));
      setNotice(`Order #${order.order_number} updated to ${statuses.find((item) => item.value === fulfillment_status)?.label}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update order.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section id="orders" className="mt-8 scroll-mt-8 rounded-xl border border-[#333333] bg-[#111111] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-[#F5F5F5]">Orders</h2>
            {newOrders.length > 0 && <span className="rounded-full bg-[#1E3A8A] px-2.5 py-1 text-xs font-semibold text-[#BFDBFE]">{newOrders.length} new</span>}
          </div>
          <p className="mt-1 text-sm text-[#A3A3A3]">Customer purchases, payment status and fulfilment tracking.</p>
        </div>
        <button type="button" onClick={() => void loadOrders(true)} disabled={refreshing} className="rounded-lg border border-[#444444] px-3 py-2 text-sm font-medium text-[#E5E5E5] hover:bg-[#222222] disabled:opacity-50">
          {refreshing ? "Refreshing..." : "Refresh orders"}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Paid orders", paidOrders.length],
          ["New to process", newOrders.length],
          ["Processing / packed", processingOrders.length],
          ["Shipped", shippedOrders.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[#292929] bg-[#090909] p-4">
            <p className="text-2xl font-semibold text-[#F5F5F5]">{value}</p>
            <p className="mt-1 text-xs text-[#A3A3A3]">{label}</p>
          </div>
        ))}
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-lg border border-green-900 bg-green-950/30 p-3 text-sm text-green-300">{notice}</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          ["all", "All orders"],
          ["paid", "Paid"],
          ["pending", "Payment pending"],
          ["new", "New"],
          ["processing", "Processing"],
          ["packed", "Packed"],
          ["shipped", "Shipped"],
          ["delivered", "Delivered"],
          ["cancelled", "Cancelled"],
        ].map(([value, label]) => (
          <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${filter === value ? "border-[#D4D4D4] bg-[#F5F5F5] text-black" : "border-[#3A3A3A] text-[#BDBDBD] hover:border-[#777777]"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {loading ? <p className="py-8 text-center text-sm text-[#A3A3A3]">Loading orders...</p>
          : visibleOrders.length === 0 ? <p className="rounded-lg border border-dashed border-[#3A3A3A] px-4 py-10 text-center text-sm text-[#A3A3A3]">No orders in this view yet.</p>
          : visibleOrders.map((order) => (
            <article key={order.id} className="rounded-xl border border-[#333333] bg-[#0D0D0D] p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[#F5F5F5]">Order #{order.order_number}</h3>
                  <p className="mt-1 text-xs text-[#8F8F8F]">{dateText(order.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${order.payment_status === "paid" ? "bg-green-950 text-green-300" : "bg-amber-950 text-amber-200"}`}>{order.payment_status === "paid" ? "Paid" : "Payment pending"}</span>
                  <span className="rounded-full border border-[#454545] px-2.5 py-1 text-xs text-[#D4D4D4]">{statuses.find((item) => item.value === order.fulfillment_status)?.label ?? order.fulfillment_status}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#858585]">Customer</p>
                  <p className="mt-1 text-sm font-medium text-[#F0F0F0]">{order.customer_name}</p>
                  <p className="text-sm text-[#B0B0B0]">{order.customer_email}</p>
                  <p className="text-sm text-[#B0B0B0]">{order.customer_phone}</p>
                  <p className="mt-2 text-xs leading-5 text-[#8F8F8F]">{addressText(order.shipping_address)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#858585]">Items</p>
                  <div className="mt-2 space-y-2">
                    {(order.order_items ?? []).map((item) => (
                      <div key={item.id} className="flex justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <p className="font-medium text-[#E5E5E5]">{item.product_name} × {item.quantity}</p>
                          <p className="text-xs text-[#929292]">{[item.size && `Size: ${item.size}`, item.color && `Colour: ${item.color}`].filter(Boolean).join(" · ")}</p>
                        </div>
                        <p className="shrink-0 text-[#D4D4D4]">{money(item.line_total_paise, order.currency)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between border-t border-[#292929] pt-3 text-sm font-semibold text-[#F5F5F5]">
                    <span>Total</span><span>{money(order.total_paise, order.currency)}</span>
                  </div>
                </div>
              </div>

              {order.inventory_issue && <p className="mt-3 rounded-lg border border-amber-900 bg-amber-950/30 p-3 text-xs text-amber-200">Inventory attention required: {order.inventory_issue}</p>}
              {order.payment_status === "paid" && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#292929] pt-4">
                  <p className="text-xs text-[#858585]">{order.razorpay_payment_id ? `Payment ID: ${order.razorpay_payment_id}` : "Payment verified"}</p>
                  <label className="flex items-center gap-2 text-xs text-[#BDBDBD]">
                    Update fulfilment
                    <select value={order.fulfillment_status} disabled={busyId === order.id} onChange={(event) => void updateStatus(order, event.target.value)} className="rounded-md border border-[#444444] bg-[#171717] px-2.5 py-2 text-sm text-white disabled:opacity-50">
                      {statuses.filter((item) => item.value !== "new" || order.fulfillment_status === "new").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </label>
                </div>
              )}
            </article>
          ))}
      </div>
      <p className="mt-4 text-center text-xs text-[#777777]">Automatically refreshes every 30 seconds while this page is open.</p>
    </section>
  );
}
