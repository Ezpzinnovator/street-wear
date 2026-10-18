
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AddProductForm from "./add-product-form";
import ProductManagement from "./product-management";
import AdminSignOutButton from "./sign-out-button";

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
    <main className="min-h-screen bg-[#090909]">
      <header className="flex items-center justify-between border-b border-[#333333] bg-[#111111] px-6 py-5">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-[#F5F5F5]">
            AKURA
          </h1>
          <p className="text-xs tracking-wide text-[#A3A3A3]">
            ADMIN DASHBOARD
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[#3B82F6]/50 bg-[#172554] px-4 py-2 text-sm font-semibold text-[#BFDBFE]">
            Administrator
          </span>
          <AdminSignOutButton />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <h2 className="text-2xl font-bold text-[#F5F5F5]">
          Welcome to Akura
        </h2>

        <p className="mt-2 text-sm text-[#A3A3A3]">
          Manage your clothing store from one place.
        </p>

        <section className="mt-7 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-[#333333] bg-[#111111] p-5 shadow-sm">
            <p className="text-sm text-[#A3A3A3]">Admin account</p>
            <p className="mt-2 break-all font-semibold text-[#F5F5F5]">
              {user.email}
            </p>
          </div>

          <div className="rounded-xl border border-[#333333] bg-[#111111] p-5 shadow-sm">
            <p className="text-sm text-[#A3A3A3]">Access level</p>
            <p className="mt-2 font-semibold text-[#D4D4D4]">
              Administrator
            </p>
          </div>

          <div className="rounded-xl border border-[#333333] bg-[#111111] p-5 shadow-sm">
            <p className="text-sm text-[#A3A3A3]">Store status</p>
            <p className="mt-2 font-semibold text-green-600">
              Connected
            </p>
          </div>
        </section>

        <section className="mt-7 rounded-xl border border-[#333333] bg-[#111111] p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-[#F5F5F5]">
            Add New Product
          </h2>

          <p className="mb-6 text-sm text-[#A3A3A3]">
            Add a product to your Akura Clothing inventory.
          </p>

          <AddProductForm />
        </section>

        {productsError ? (
          <section className="mt-7 rounded-xl border border-red-200 bg-[#111111] p-6 shadow-sm">
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
