
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AccountProfile from "./account-profile";
import AccountAddresses from "./account-addresses";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?next=%2Faccount");
  }

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "";

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-10 text-[#172B4D] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/"
              className="text-xs font-semibold tracking-[0.2em] text-[#2563EB]"
            >
              AKURA
            </Link>

            <h1 className="mt-3 text-3xl font-semibold">
              My Account
            </h1>

            <p className="mt-2 text-sm text-[#627D98]">
              Manage your profile, delivery addresses, and orders.
            </p>
          </div>

          <Link
            href="/"
            className="w-fit border border-[#BFDBFE] px-5 py-3 text-xs font-semibold hover:border-[#3B82F6]"
          >
            CONTINUE SHOPPING
          </Link>
        </header>

        <section className="border border-[#BFDBFE] bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Profile details</h2>

          <p className="mt-2 text-sm text-[#627D98]">
            Update the name associated with your Akura account.
          </p>

          <div className="mt-6">
            <AccountProfile
              initialName={fullName}
              email={user.email ?? ""}
            />
          </div>
        </section>

        <AccountAddresses />

        <section className="mt-8 border border-[#BFDBFE] bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold">My Orders</h2>

          <p className="mt-2 text-sm text-[#627D98]">
            Your order history will appear here when order-history
            functionality is connected.
          </p>
        </section>
      </div>
    </main>
  );
}
