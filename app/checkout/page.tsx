
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

type CustomerDetails = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

type CartItem = {
  key: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
};

type SavedAddress = {
  id: string;
  label: "Home" | "Work" | "Other";
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at?: string;
};

const initialDetails: CustomerDetails = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const fallbackImage =
  "https://placehold.co/400x500/DBEAFE/102A43?text=Akura";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatAddress(address: SavedAddress) {
  const line2 = address.address_line2?.trim();
  return [
    address.address_line1,
    line2,
    `${address.city}, ${address.state} ${address.postal_code}`,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function CheckoutPage() {
  const [details, setDetails] = useState<CustomerDetails>(initialDetails);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressLoading, setAddressLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCheckout() {
      try {
        let savedCart: CartItem[] = [];

        try {
          const buyNowMode = sessionStorage.getItem("akura-checkout-mode") === "buy-now";
          if (buyNowMode) {
            const buyNowItem: unknown = JSON.parse(localStorage.getItem("akura-buy-now") || "null");
            savedCart = buyNowItem && typeof buyNowItem === "object" && "productId" in buyNowItem
              ? [buyNowItem as CartItem]
              : [];
          } else {
            const parsed: unknown = JSON.parse(localStorage.getItem("akura-cart") || "[]");
            if (Array.isArray(parsed)) savedCart = parsed as CartItem[];
          }
        } catch {
          savedCart = [];
        }

        if (!active) return;
        setCart(savedCart);

        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Could not load product prices.");
        }

        const data = await response.json();
        const productList = Array.isArray(data) ? data : data?.products;

        if (!Array.isArray(productList)) {
          throw new Error("The product list could not be read.");
        }

        if (!active) return;
        setProducts(productList as Product[]);
      } catch (error) {
        console.error("Checkout loading error:", error);
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Something went wrong while loading checkout."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    async function loadSavedAddresses() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!active) return;

        if (!user) {
          setSignedIn(false);
          return;
        }

        setSignedIn(true);

        const { data, error: addressError } = await supabase
          .from("customer_addresses")
          .select(
            "id,label,recipient_name,phone,address_line1,address_line2,city,state,postal_code,country,is_default,created_at"
          )
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false });

        if (addressError) throw addressError;
        if (!active) return;

        const addresses = (data ?? []) as SavedAddress[];
        setSavedAddresses(addresses);

        const defaultAddress =
          addresses.find((address) => address.is_default) ?? addresses[0];

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setDetails((current) => ({
            ...current,
            fullName: defaultAddress.recipient_name,
            phone: defaultAddress.phone,
            address: [defaultAddress.address_line1, defaultAddress.address_line2]
              .filter((part) => part && part.trim())
              .join(", ")
              .slice(0, 200),
            city: defaultAddress.city,
            state: defaultAddress.state,
            pincode: defaultAddress.postal_code,
          }));
        }

        setDetails((current) => ({
          ...current,
          email: user.email ?? current.email,
          fullName:
            current.fullName ||
            (typeof user.user_metadata?.full_name === "string"
              ? user.user_metadata.full_name
              : ""),
        }));
      } catch (error) {
        console.error("Could not load saved checkout addresses:", error);
        if (active) {
          setMessage(
            "We couldn't load your saved addresses. You can still enter your delivery details manually."
          );
        }
      } finally {
        if (active) setAddressLoading(false);
      }
    }

    void loadCheckout();
    void loadSavedAddresses();

    return () => {
      active = false;
    };
  }, []);

  function selectSavedAddress(address: SavedAddress) {
    setSelectedAddressId(address.id);
    setDetails((current) => ({
      ...current,
      fullName: address.recipient_name,
      phone: address.phone,
      address: [address.address_line1, address.address_line2]
        .filter((part) => part && part.trim())
        .join(", ")
        .slice(0, 200),
      city: address.city,
      state: address.state,
      pincode: address.postal_code,
    }));
    setMessage("");
  }

  function useNewAddress() {
    setSelectedAddressId("");
    setDetails((current) => ({
      ...current,
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    }));
    setMessage("");
  }

  function updateField(field: keyof CustomerDetails, value: string) {
    const maxLengths: Record<keyof CustomerDetails, number> = {
      fullName: 60,
      email: 100,
      phone: 10,
      address: 200,
      city: 60,
      state: 60,
      pincode: 6,
    };

    let cleanedValue = value;

    if (field === "fullName") {
      cleanedValue = value
        .replace(/[^\p{L}\p{M} .'-]/gu, "")
        .replace(/([-'])\1+/g, "$1")
        .replace(/\.{2,}/g, ".")
        .replace(/\s{2,}/g, " ");
    } else if (field === "email") {
      cleanedValue = value
        .replace(/\s/g, "")
        .replace(/-{2,}/g, "-")
        .replace(/\.{2,}/g, ".")
        .slice(0, 100);
    } else if (field === "phone" || field === "pincode") {
      cleanedValue = value.replace(/\D/g, "");
    } else if (field === "address") {
      cleanedValue = value
        .replace(/[^\p{L}\p{M}\p{N}\s,./#'()-]/gu, "")
        .replace(/([,./#'()-])\1+/g, "$1")
        .replace(/\s{2,}/g, " ");
    } else if (field === "city" || field === "state") {
      cleanedValue = value
        .replace(/[^\p{L}\p{M} .'-]/gu, "")
        .replace(/([-'])\1+/g, "$1")
        .replace(/\.{2,}/g, ".")
        .replace(/\s{2,}/g, " ");
    }

    cleanedValue = cleanedValue.slice(0, maxLengths[field]);

    setDetails((current) => ({
      ...current,
      [field]: cleanedValue,
    }));

    if (field !== "email") setSelectedAddressId("");
    setMessage("");
  }

  const checkoutItems = cart.map((item) => ({
    ...item,
    product: products.find((product) => product.id === item.productId),
  }));

  const itemCount = cart.reduce(
    (total, item) =>
      total +
      (Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 0),
    0
  );

  const subtotal = checkoutItems.reduce((total, item) => {
    if (!item.product) return total;

    const price = Number(item.product.price);
    const quantity = Number(item.quantity);

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return total;
    }

    return total + price * quantity;
  }, 0);

  const hasUnavailableProducts = checkoutItems.some((item) => !item.product);

  const hasInvalidQuantities = checkoutItems.some(
    (item) => !Number.isInteger(item.quantity) || item.quantity < 1
  );

  const hasStockIssues = checkoutItems.some(
    (item) => item.product && item.quantity > Number(item.product.stock)
  );

  const canContinue =
    !loading &&
    !loadError &&
    cart.length > 0 &&
    !hasUnavailableProducts &&
    !hasInvalidQuantities &&
    !hasStockIssues;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const fullName = details.fullName.trim();
    const email = details.email.trim();
    const phone = details.phone.trim();
    const address = details.address.trim();
    const city = details.city.trim();
    const state = details.state.trim();
    const pincode = details.pincode.trim();

    const namePattern = /^[\p{L}\p{M}]+(?:[ .'-][\p{L}\p{M}]+)*$/u;
    const locationPattern = /^[\p{L}\p{M}]+(?:[ .'-][\p{L}\p{M}]+)*$/u;
    const emailPattern =
      /^[A-Za-z0-9]+(?:[._%+-][A-Za-z0-9]+)*@[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*(\.[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)+$/;

    if (fullName.length > 60 || !namePattern.test(fullName)) {
      setMessage("Enter a valid name using letters and single separators.");
      return;
    }

    if (email.length > 100 || !emailPattern.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setMessage(
        "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9."
      );
      return;
    }

    if (
      address.length < 5 ||
      address.length > 200 ||
      !/[\p{L}\p{N}]/u.test(address) ||
      /([,./#'()-])\1+/.test(address)
    ) {
      setMessage(
        "Enter a valid delivery address between 5 and 200 characters."
      );
      return;
    }

    if (
      city.length > 60 ||
      state.length > 60 ||
      !locationPattern.test(city) ||
      !locationPattern.test(state)
    ) {
      setMessage("Enter a valid city and state.");
      return;
    }

    if (!/^[1-9]\d{5}$/.test(pincode)) {
      setMessage("Enter a valid 6-digit Indian PIN code.");
      return;
    }

    if (cart.length === 0) {
      setMessage("Your bag is empty. Add a product before continuing.");
      return;
    }

    if (hasUnavailableProducts) {
      setMessage(
        "One or more products are unavailable. Please return to your bag and review your items."
      );
      return;
    }

    if (hasInvalidQuantities) {
      setMessage("Please check the quantities in your bag.");
      return;
    }

    if (hasStockIssues) {
      setMessage(
        "One or more items exceed the available stock. Please update your bag."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/razorpay/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          customer: {
            name: fullName,
            email,
            phone,
            address,
            city,
            state,
            pincode,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok || typeof result.paymentUrl !== "string") {
        setMessage(result.error || "Could not start payment. Please try again.");
        return;
      }
      window.location.assign(result.paymentUrl);
    } catch {
      setMessage("Could not connect to payment. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#090909] text-[#F5F5F5]">
      <header className="border-b border-[#333333]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-[0.18em]"
          >
            AKURA<span className="text-[#F5F5F5]">.</span>
          </Link>

          <Link
            href="/cart"
            className="text-xs font-semibold tracking-[0.12em] hover:text-[#F5F5F5]"
          >
            ← BACK TO BAG
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 sm:py-16 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-[#F5F5F5]">
            SECURE CHECKOUT
          </p>

          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">
            Delivery details
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#A3A3A3]">
            Select a saved address or enter new delivery details.
          </p>

          {!addressLoading && savedAddresses.length > 0 && (
            <section className="mt-8 border border-[#333333] bg-white p-5 sm:p-8">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold">Your saved addresses</h2>
                  <p className="mt-1 text-sm text-[#A3A3A3]">
                    Choose where you want this order delivered.
                  </p>
                </div>
                <Link
                  href="/account"
                  className="text-xs font-semibold text-[#D4D4D4] underline underline-offset-4"
                >
                  MANAGE ADDRESSES
                </Link>
              </div>

              <div className="mt-5 grid gap-3">
                {savedAddresses.map((address) => {
                  const selected = selectedAddressId === address.id;

                  return (
                    <article
                      key={address.id}
                      className={`border p-4 transition ${
                        selected
                          ? "border-[#F5F5F5] bg-[#090909]"
                          : "border-[#171717] bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="savedAddress"
                          aria-label={`Select ${address.label} address`}
                          checked={selected}
                          onChange={() => selectSavedAddress(address)}
                          className="mt-1 h-4 w-4 accent-[#F5F5F5]"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold">
                              {address.label}
                            </h3>
                            {address.is_default && (
                              <span className="bg-[#171717] px-2 py-1 text-[10px] font-semibold text-[#A3A3A3]">
                                DEFAULT
                              </span>
                            )}
                            {selected && (
                              <span className="text-[10px] font-semibold text-[#D4D4D4]">
                                SELECTED
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm font-medium">
                            {address.recipient_name}
                          </p>
                          <p className="mt-1 text-xs text-[#A3A3A3]">
                            {address.phone}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#B5B5B5]">
                            {formatAddress(address)}
                          </p>
                          <button
                            type="button"
                            onClick={() => selectSavedAddress(address)}
                            className="mt-3 text-xs font-semibold text-[#D4D4D4] underline underline-offset-4"
                          >
                            DELIVER TO THIS ADDRESS
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={useNewAddress}
                className="mt-4 border border-[#333333] px-4 py-3 text-xs font-semibold hover:border-[#F5F5F5]"
              >
                + ENTER A DIFFERENT ADDRESS
              </button>
            </section>
          )}

          {!addressLoading && !signedIn && (
            <p className="mt-5 text-sm text-[#A3A3A3]">
              <Link
                href="/login?next=%2Fcheckout"
                className="font-semibold text-[#D4D4D4] underline underline-offset-4"
              >
                Sign in
              </Link>{" "}
              to use saved delivery addresses, or enter your details below.
            </p>
          )}

          {addressLoading && (
            <p className="mt-5 text-sm text-[#A3A3A3]">
              Checking for saved delivery addresses...
            </p>
          )}

          {!addressLoading && signedIn && savedAddresses.length === 0 && (
            <p className="mt-5 text-sm text-[#A3A3A3]">
              You have no saved addresses yet. Enter your delivery details below
              or add an address from{" "}
              <Link
                href="/account"
                className="font-semibold text-[#D4D4D4] underline underline-offset-4"
              >
                My Account
              </Link>
              .
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6 border border-[#333333] bg-white p-5 sm:p-8"
          >
            <div>
              <h2 className="text-lg font-semibold">Contact details</h2>
              <p className="mt-1 text-sm text-[#A3A3A3]">
                Check these details before continuing.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Full name"
                value={details.fullName}
                maxLength={60}
                onChange={(value) => updateField("fullName", value)}
                required
                autoComplete="name"
              />

              <Field
                label="Email address"
                type="email"
                value={details.email}
                maxLength={100}
                onChange={(value) => updateField("email", value)}
                required
                autoComplete="email"
              />

              <Field
                label="Phone number"
                type="tel"
                value={details.phone}
                maxLength={10}
                onChange={(value) => updateField("phone", value)}
                required
                autoComplete="tel"
                pattern="[0-9]{10}"
                hint="Enter your 10-digit Indian mobile number."
              />
            </div>

            <div className="border-t border-[#171717] pt-6">
              <h2 className="text-lg font-semibold">Shipping address</h2>

              <div className="mt-5 space-y-5">
                <Field
                  label="House number, street and area"
                  value={details.address}
                  maxLength={200}
                  onChange={(value) => updateField("address", value)}
                  required
                  autoComplete="street-address"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="City"
                    value={details.city}
                    maxLength={60}
                    onChange={(value) => updateField("city", value)}
                    required
                    autoComplete="address-level2"
                  />

                  <Field
                    label="State"
                    value={details.state}
                    maxLength={60}
                    onChange={(value) => updateField("state", value)}
                    required
                    autoComplete="address-level1"
                  />

                  <Field
                    label="PIN code"
                    value={details.pincode}
                    maxLength={6}
                    onChange={(value) => updateField("pincode", value)}
                    required
                    pattern="[0-9]{6}"
                    autoComplete="postal-code"
                  />
                </div>
              </div>
            </div>

            {message && (
              <p
                role="status"
                className="border border-[#333333] bg-[#090909] p-4 text-sm leading-6"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={!canContinue || isSubmitting}
              className="w-full bg-[#F5F5F5] px-6 py-4 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-[#A3A3A3] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "REDIRECTING TO RAZORPAY..." : "PAY SECURELY WITH RAZORPAY"}
            </button>

            <p className="text-center text-xs leading-5 text-[#A3A3A3]">
              You will be redirected to Razorpay to complete payment securely.
            </p>
          </form>
        </div>

        <aside className="h-fit border border-[#333333] bg-white p-5 sm:p-6">
          <p className="text-[10px] font-bold tracking-[0.25em] text-[#F5F5F5]">
            ORDER SUMMARY
          </p>

          {loading ? (
            <p className="mt-6 text-sm text-[#A3A3A3]">
              Loading your products and prices...
            </p>
          ) : loadError ? (
            <p role="alert" className="mt-6 text-sm leading-6 text-red-600">
              {loadError}
            </p>
          ) : cart.length === 0 ? (
            <div className="mt-6">
              <p className="text-sm text-[#A3A3A3]">Your bag is empty.</p>
              <Link
                href="/"
                className="mt-4 inline-block text-xs font-semibold text-[#F5F5F5]"
              >
                SHOP PRODUCTS →
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-5 space-y-5">
                {checkoutItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex gap-4 border-b border-[#171717] pb-5"
                  >
                    <div className="w-20 shrink-0">
                      <img
                        src={item.product?.image_url || fallbackImage}
                        alt={item.product?.name || "Product unavailable"}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = fallbackImage;
                        }}
                        className="aspect-[4/5] w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold">
                        {item.product?.name || "Product unavailable"}
                      </h3>

                      <p className="mt-1 text-xs text-[#A3A3A3]">
                        Size: {item.size || "Not selected"}
                      </p>

                      <p className="text-xs text-[#A3A3A3]">
                        Colour: {item.color || "Not selected"}
                      </p>

                      <p className="mt-1 text-xs text-[#A3A3A3]">
                        Qty: {item.quantity}
                      </p>

                      {item.product ? (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-[#A3A3A3]">
                            {formatPrice(Number(item.product.price))} each
                          </span>

                          <span className="text-sm font-semibold">
                            {formatPrice(
                              Number(item.product.price) * item.quantity
                            )}
                          </span>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-red-600">
                          Please remove this item from your bag.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {hasStockIssues && (
                <p className="mt-4 text-xs leading-5 text-red-600">
                  Some quantities exceed available stock. Please update your
                  bag.
                </p>
              )}

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#A3A3A3]">Items ({itemCount})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#A3A3A3]">Shipping</span>
                  <span className="font-medium">FREE</span>
                </div>

                <div className="flex justify-between gap-3 border-t border-[#171717] pt-4 text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-[#A3A3A3]">
                Prices are loaded from the product API. The final order amount
                must be recalculated and verified on the server before payment.
              </p>
            </>
          )}

          <Link
            href="/cart"
            className="mt-6 inline-block text-xs font-semibold tracking-[0.12em] text-[#F5F5F5] hover:text-[#A3A3A3]"
          >
            EDIT YOUR BAG →
          </Link>
        </aside>
      </section>

      <footer className="bg-[#F5F5F5] px-5 py-8 text-center text-xs text-white/60">
        AKURA — Wear your own story.
      </footer>
    </main>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  pattern?: string;
  hint?: string;
  maxLength?: number;
};

function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  autoComplete,
  pattern,
  hint,
  maxLength,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold">{label}</span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        autoComplete={autoComplete}
        pattern={pattern}
        maxLength={maxLength}
        title={hint}
        className="w-full border border-[#333333] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#F5F5F5] focus:ring-2 focus:ring-[#171717]"
      />

      {hint && (
        <span className="mt-2 block text-xs text-[#A3A3A3]">{hint}</span>
      )}
    </label>
  );
}
