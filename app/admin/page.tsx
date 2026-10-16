
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AddProductForm from "./add-product-form";
import ProductManagement from "./product-management";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Verify the logged-in user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Verify administrator access
  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || admin?.role !== "admin") {
    redirect("/");
  }

  // Fetch all product fields needed by ProductManagement
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, name, category, description, price, stock, is_active, image_url, image_urls, sizes, colors, created_at"
    )
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-blue-100 bg-white px-6 py-5">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-blue-800">
            AKURA
          </h1>
          <p className="text-xs tracking-wide text-slate-500">
            ADMIN DASHBOARD
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          Administrator
        </span>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <h2 className="text-2xl font-bold text-slate-900">
          Welcome to Akura
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Manage your clothing store from one place.
        </p>

        <section className="mt-7 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Admin account</p>
            <p className="mt-2 break-all font-semibold text-slate-900">
              {user.email}
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Access level</p>
            <p className="mt-2 font-semibold text-blue-700">
              Administrator
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Store status</p>
            <p className="mt-2 font-semibold text-green-600">
              Connected
            </p>
          </div>
        </section>

        <section className="mt-7 rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-slate-900">
            Add New Product
          </h2>

          <p className="mb-6 text-sm text-slate-500">
            Add a product to your Akura Clothing inventory.
          </p>

          <AddProductForm />
        </section>

        {productsError ? (
          <section className="mt-7 rounded-xl border border-red-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-red-700">
              Could not load products: {productsError.message}
            </p>
          </section>
        ) : (
          <ProductManagement initialProducts={products ?? []} />
        )}
      </div>
    </main>
  );
}
