"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url: string | null;
  image_urls?: string[] | null;
  sizes: string[];
  colors: string[];
  stock: number;
  is_active: boolean;
  created_at: string;
  fit_type?: "standard" | "oversized" | null;
  material?: string | null;
  care_instructions?: string | null;
  product_details?: {
    size_chart?: Array<{
      size: string;
      chest_cm?: number | null;
      length_cm?: number | null;
      shoulder_cm?: number | null;
      waist_cm?: number | null;
      hip_cm?: number | null;
    }>;
    [key: string]: unknown;
  } | null;
};

type CartItem = {
  key: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

const fallbackImage =
  "https://placehold.co/800x1000/171717/F5F5F5?text=AKURA";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [bagMessage, setBagMessage] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    function syncCartCount() {
      try {
        const items: CartItem[] = JSON.parse(localStorage.getItem("akura-cart") || "[]");
        setCartCount(items.reduce((total, item) => total + Math.max(0, Number(item.quantity) || 0), 0));
      } catch {
        setCartCount(0);
      }
    }

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener("akura-cart-updated", syncCartCount);
    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("akura-cart-updated", syncCartCount);
    };
  }, []);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Could not load products.");
        }

        const products: Product[] = await response.json();
        setAllProducts(products.filter((item) => item.is_active !== false));
        const foundProduct = products.find((item) => item.id === id);

        if (!foundProduct) {
          throw new Error("Product not found.");
        }

        setProduct(foundProduct);
        setSelectedSize(foundProduct.sizes?.includes("S") ? "S" : (foundProduct.sizes?.[0] ?? ""));
        setSelectedColor("");
        setActiveImageIndex(0);
        setQuantity(1);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  const galleryImages = product
    ? Array.from(
        new Set(
          [
            product.image_url,
            ...(Array.isArray(product.image_urls) ? product.image_urls : []),
          ].filter((url): url is string => Boolean(url))
        )
      )
    : [];

  const currentImage = galleryImages[activeImageIndex] || fallbackImage;

  // Generic reference chart for tops and bottom wear. Values are in cm;
  // the UI also shows the inch conversion alongside each measurement.
  const topSizeChart = [
    { size: "S", standardChest: 96, standardLength: 68, standardShoulder: 42, oversizedChest: 108, oversizedLength: 70, oversizedShoulder: 48 },
    { size: "M", standardChest: 102, standardLength: 70, standardShoulder: 44, oversizedChest: 114, oversizedLength: 72, oversizedShoulder: 50 },
    { size: "L", standardChest: 108, standardLength: 72, standardShoulder: 46, oversizedChest: 120, oversizedLength: 74, oversizedShoulder: 52 },
    { size: "XL", standardChest: 114, standardLength: 74, standardShoulder: 48, oversizedChest: 126, oversizedLength: 76, oversizedShoulder: 54 },
    { size: "XXL", standardChest: 120, standardLength: 76, standardShoulder: 50, oversizedChest: 132, oversizedLength: 78, oversizedShoulder: 56 },
  ];
  const bottomSizeChart = [
    { size: "S", waist: 76, hip: 96, length: 98 },
    { size: "M", waist: 81, hip: 101, length: 100 },
    { size: "L", waist: 86, hip: 106, length: 102 },
    { size: "XL", waist: 91, hip: 111, length: 104 },
    { size: "XXL", waist: 96, hip: 116, length: 106 },
  ];

  function formatDualMeasurement(cm: number) {
    return `${cm} cm / ${(cm / 2.54).toFixed(1)} in`;
  }

  function showPreviousImage() {
    setActiveImageIndex((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1
    );
  }

  function showNextImage() {
    setActiveImageIndex((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1
    );
  }

  function addToBag() {
    if (!product) return;

    setBagMessage("");
    if (product.stock <= 0) {
      setBagMessage("This product is out of stock.");
      return;
    }

    if (product.sizes.length > 0 && !selectedSize) {
      setBagMessage("Please select a size.");
      return;
    }

    if (false) {
      setBagMessage("");
      return;
    }

    const cartItem: CartItem = {
      key: `${product.id}__${selectedSize}__`,
      productId: product.id,
      size: selectedSize,
      color: "",
      quantity,
    };

    const existingCart: CartItem[] = JSON.parse(
      localStorage.getItem("akura-cart") || "[]"
    );

    const existingIndex = existingCart.findIndex(
      (item) => item.key === cartItem.key
    );

    if (existingIndex >= 0) {
      existingCart[existingIndex].quantity = Math.min(
        existingCart[existingIndex].quantity + quantity,
        product.stock
      );
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem("akura-cart", JSON.stringify(existingCart));
    setCartCount(existingCart.reduce((total, item) => total + Math.max(0, Number(item.quantity) || 0), 0));
    window.dispatchEvent(new Event("akura-cart-updated"));
    setBagMessage(`${product.name} added to your bag.`);
    window.setTimeout(() => setBagMessage(""), 3200);
  }

  function buyNow() {
    if (!product || product.stock <= 0) return;
    if (product.sizes.length > 0 && !selectedSize) {
      setBagMessage("Please select a size.");
      return;
    }
    if (product.colors.length > 0 && !selectedColor) {
      setBagMessage("Please select a color.");
      return;
    }
    const item: CartItem = {
      key: `${product.id}__${selectedSize}__${selectedColor}`,
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      quantity,
    };
    localStorage.setItem("akura-buy-now", JSON.stringify(item));
    sessionStorage.setItem("akura-checkout-mode", "buy-now");
    router.push("/checkout");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090909] text-[#F5F5F5]">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-[#B5B5B5]">Loading product...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#090909] text-[#F5F5F5]">
        <header className="border-b border-[#333333] bg-[#090909]">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
            <Link
              href="/"
              className="text-2xl font-black tracking-[0.18em]"
            >
              AKURA<span className="text-[#F5F5F5]">.</span>
            </Link>

          </div>
        </header>

        <section className="flex min-h-[70vh] items-center justify-center px-5">
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#F5F5F5]">
              AKURA
            </p>

            <h1 className="mt-4 text-3xl font-semibold">
              Product not found
            </h1>

            <p className="mt-3 text-sm text-[#B5B5B5]">
              {error || "This product may no longer be available."}
            </p>

            <Link
              href="/"
              className="mt-7 inline-block bg-white px-7 py-3.5 text-xs font-semibold tracking-[0.15em] text-black transition hover:bg-[#A3A3A3]"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const subtotal = product.price * quantity;
  const relatedProducts = allProducts
    .filter((item) => item.id !== product.id)
    .sort((a, b) => {
      const aSameCategory = a.category?.trim().toLowerCase() === product.category?.trim().toLowerCase();
      const bSameCategory = b.category?.trim().toLowerCase() === product.category?.trim().toLowerCase();
      return Number(bSameCategory) - Number(aSameCategory);
    })
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#090909] text-[#F5F5F5]">
      <div className="border-b border-[#333333] bg-[#090909] px-4 py-2 text-center text-[9px] font-medium tracking-[0.18em] text-white/80 sm:text-[10px] sm:tracking-[0.22em]">
        FREE SHIPPING ON ORDERS ABOVE ₹1,999
      </div>
      <header className="sticky top-0 z-30 border-b border-[#333333] bg-[#0D0D0D]/95 text-[#F5F5F5] backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3 sm:px-8 sm:py-4">
          <div className="flex items-center justify-start">
            <Link href="/" aria-label="Akura home" className="inline-flex h-10 items-center text-xs font-semibold tracking-[0.12em] transition hover:text-[#D4D4D4]">HOME</Link>
          </div>
          <Link href="/" aria-label="Akura home" className="justify-self-center whitespace-nowrap text-xl font-black tracking-[0.16em] text-[#F5F5F5] sm:text-2xl sm:tracking-[0.2em]">
            AKURA<span className="text-[#F5F5F5]">.</span>
          </Link>
          <div className="flex items-center justify-end gap-2 sm:gap-4">
            <Link href="/account" aria-label="My account" title="My account" className="inline-flex h-10 w-9 items-center justify-center transition hover:text-[#D4D4D4]">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7.5" r="3.5" /><path d="M4.5 20c.4-4 3.2-6.2 7.5-6.2s7.1 2.2 7.5 6.2" /></svg>
            </Link>
            <Link href="/cart" aria-label={`Shopping bag, ${cartCount} items`} title="Shopping bag" className="relative inline-flex h-10 w-9 items-center justify-center transition hover:text-[#D4D4D4]">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 8.5h13l1 12h-15l1-12Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>
              {cartCount > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 translate-x-0 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[9px] font-bold text-white">{cartCount > 99 ? "99+" : cartCount}</span>}
            </Link>
          </div>
        </div>
        <nav aria-label="Main navigation" className="border-t border-[#292929]">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 overflow-x-auto px-4 py-2.5 sm:gap-9 sm:px-8">
            <Link href="/" className="shrink-0 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.12em] transition hover:text-[#D4D4D4] sm:text-[11px]">All Products</Link>
            <Link href="/#shop" className="shrink-0 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.12em] transition hover:text-[#D4D4D4] sm:text-[11px]">Categories</Link>
            <Link href="/account" className="shrink-0 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.12em] transition hover:text-[#D4D4D4] sm:text-[11px]">My Account</Link>
            <Link href="/cart" className="shrink-0 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.12em] transition hover:text-[#D4D4D4] sm:text-[11px]">Shopping Bag</Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {/* Product image gallery */}
          <div className="min-w-0">
            <div className="group relative overflow-hidden bg-[#171717]">
              <button
                type="button"
                onClick={() => setShowImageZoom(true)}
                aria-label="Zoom product image"
                className="block aspect-[4/5] w-full cursor-zoom-in bg-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
              >
                <img
                  key={currentImage}
                  src={currentImage}
                  alt={`${product.name} - image ${activeImageIndex + 1}`}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fallbackImage;
                  }}
                  className="h-full w-full object-contain"
                />
              </button>
              <div className="pointer-events-none absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-black/90 text-white shadow-lg" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5M10.8 7.5v6.6M7.5 10.8h6.6"/></svg>
              </div>

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    aria-label="Previous product image"
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl shadow transition hover:bg-white"
                  >
                    &#8249;
                  </button>

                  <button
                    type="button"
                    onClick={showNextImage}
                    aria-label="Next product image"
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl shadow transition hover:bg-white"
                  >
                    &#8250;
                  </button>

                  <span className="absolute bottom-3 right-3 rounded-full border border-white/30 bg-black/85 px-3 py-1.5 text-xs font-semibold text-white">
                    {activeImageIndex + 1} / {galleryImages.length}
                  </span>
                </>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div
                className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5"
                aria-label="Product image thumbnails"
              >
                {galleryImages.map((image, index) => (
                  <button
                    type="button"
                    key={image}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={activeImageIndex === index}
                    className={`overflow-hidden border-2 transition ${
                      activeImageIndex === index
                        ? "border-[#F5F5F5]"
                        : "border-transparent hover:border-[#555555]"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackImage;
                      }}
                      className="aspect-[3/4] w-full bg-[#111111] object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product details */}
          <div className="flex flex-col justify-center">
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#F5F5F5]">
              {product.category}
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 text-xl font-semibold">
              ₹{product.price.toLocaleString("en-IN")}
            </p>


            {product.description && (
              <p className="mt-6 max-w-xl text-sm leading-7 text-[#B5B5B5]">
                {product.description}
              </p>
            )}

            {(product.material || product.care_instructions) && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {product.material && (
                  <div className="border border-[#333333] p-4">
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#B5B5B5]">MATERIAL</p>
                    <p className="mt-2 text-sm">{product.material}</p>
                  </div>
                )}
                {product.care_instructions && (
                  <div className="border border-[#333333] p-4">
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#B5B5B5]">CARE INSTRUCTIONS</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6">{product.care_instructions}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6">
              {product.stock <= 0 ? (
                <p className="text-xs font-semibold tracking-[0.12em] text-red-600">
                  OUT OF STOCK
                </p>
              ) : product.stock <= 5 ? (
                <p className="text-xs font-semibold tracking-[0.12em] text-[#B45309]">
                  ONLY {product.stock} LEFT
                </p>
              ) : (
                <p className="text-xs font-medium text-green-700">
                  IN STOCK
                </p>
              )}
            </div>

            {product.sizes.length > 0 && (
              <div className="mt-8">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[10px] font-bold tracking-[0.16em]">
                    SIZE
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide((open) => !open)}
                    className="text-xs font-semibold text-[#B5B5B5] underline underline-offset-4"
                    aria-expanded={showSizeGuide}
                  >
                    {showSizeGuide ? "Hide Size Chart" : "Size Chart"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={`min-w-12 border px-4 py-3 text-xs font-medium transition ${
                        selectedSize === size
                          ? "border-[#F5F5F5] bg-[#F5F5F5] text-black"
                          : "border-[#333333] hover:border-[#F5F5F5]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {showSizeGuide && (
                  <div className="mt-4 space-y-5 border border-[#333333] bg-[#111111] p-4 text-[#F5F5F5] sm:p-5">
                    <div>
                      <h2 className="text-sm font-semibold">Size Chart</h2>
                      <p className="mt-1 text-xs leading-5 text-[#B5B5B5]">
                        Reference measurements for T-shirts, oversized T-shirts, hoodies and bottom wear. Each measurement shows centimetres and inches.
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-2 text-xs font-bold tracking-[0.12em]">STANDARD FIT — T-SHIRTS & HOODIES</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[480px] border-collapse text-left text-xs">
                          <thead><tr className="border-b border-[#333333] text-[#B5B5B5]"><th className="px-2 py-3">Size</th><th className="px-2 py-3">Chest</th><th className="px-2 py-3">Length</th><th className="px-2 py-3">Shoulder</th></tr></thead>
                          <tbody>{topSizeChart.map((row) => <tr key={`standard-${row.size}`} className="border-b border-[#171717] last:border-0"><td className="px-2 py-3 font-semibold">{row.size}</td><td className="px-2 py-3">{formatDualMeasurement(row.standardChest)}</td><td className="px-2 py-3">{formatDualMeasurement(row.standardLength)}</td><td className="px-2 py-3">{formatDualMeasurement(row.standardShoulder)}</td></tr>)}</tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 text-xs font-bold tracking-[0.12em]">OVERSIZED FIT — T-SHIRTS & HOODIES</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[480px] border-collapse text-left text-xs">
                          <thead><tr className="border-b border-[#333333] text-[#B5B5B5]"><th className="px-2 py-3">Size</th><th className="px-2 py-3">Chest</th><th className="px-2 py-3">Length</th><th className="px-2 py-3">Shoulder</th></tr></thead>
                          <tbody>{topSizeChart.map((row) => <tr key={`oversized-${row.size}`} className="border-b border-[#171717] last:border-0"><td className="px-2 py-3 font-semibold">{row.size}</td><td className="px-2 py-3">{formatDualMeasurement(row.oversizedChest)}</td><td className="px-2 py-3">{formatDualMeasurement(row.oversizedLength)}</td><td className="px-2 py-3">{formatDualMeasurement(row.oversizedShoulder)}</td></tr>)}</tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 text-xs font-bold tracking-[0.12em]">BOTTOM WEAR — PANTS & JOGGERS</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[420px] border-collapse text-left text-xs">
                          <thead><tr className="border-b border-[#333333] text-[#B5B5B5]"><th className="px-2 py-3">Size</th><th className="px-2 py-3">Waist</th><th className="px-2 py-3">Hip</th><th className="px-2 py-3">Length</th></tr></thead>
                          <tbody>{bottomSizeChart.map((row) => <tr key={`bottom-${row.size}`} className="border-b border-[#171717] last:border-0"><td className="px-2 py-3 font-semibold">{row.size}</td><td className="px-2 py-3">{formatDualMeasurement(row.waist)}</td><td className="px-2 py-3">{formatDualMeasurement(row.hip)}</td><td className="px-2 py-3">{formatDualMeasurement(row.length)}</td></tr>)}</tbody>
                        </table>
                      </div>
                    </div>
                    <p className="text-[11px] leading-5 text-[#B5B5B5]">This is a generic reference chart. Actual fit and measurements can vary by design and manufacturer; use the product details when available.</p>
                  </div>
                )}
              </div>
            )}

            {product.stock > 0 && (
              <div className="mt-7">
                <span className="mb-3 block text-[10px] font-bold tracking-[0.16em]">
                  QUANTITY
                </span>

                <div className="flex w-fit items-center border border-[#333333]">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() =>
                      setQuantity((current) => Math.max(current - 1, 1))
                    }
                    className="px-5 py-3 text-lg hover:bg-[#171717]"
                  >
                    −
                  </button>

                  <span className="min-w-12 text-center text-sm">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(current + 1, product.stock)
                      )
                    }
                    className="px-5 py-3 text-lg hover:bg-[#171717]"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={addToBag}
              disabled={product.stock <= 0}
              className="mt-8 w-full bg-[#F5F5F5] py-4 text-xs font-semibold tracking-[0.2em] text-black transition hover:bg-[#A3A3A3] disabled:cursor-not-allowed disabled:bg-gray-500"
            >
              {product.stock <= 0 ? "OUT OF STOCK" : "ADD TO BAG +"}
            </button>
            <button
              type="button"
              onClick={buyNow}
              disabled={product.stock <= 0}
              className="mt-3 w-full bg-[#F5F5F5] px-6 py-4 text-xs font-semibold tracking-[0.18em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              BUY NOW
            </button>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                aria-label={`Share ${product.name}`}
                title="Share product"
                onClick={async () => {
                  const url = window.location.href;
                  setShareMessage("");
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: product.name, text: `Check out ${product.name} at Akura.`, url });
                      setShareMessage("Share options opened.");
                    } else if (navigator.clipboard?.writeText) {
                      await navigator.clipboard.writeText(url);
                      setShareMessage("Product link copied.");
                    } else {
                      window.prompt("Copy this product link:", url);
                      setShareMessage("Copy the product link to share it.");
                    }
                  } catch (error) {
                    if (error instanceof Error && error.name !== "AbortError") {
                      setShareMessage("Could not open sharing. You can copy the product URL from your browser.");
                    }
                  }
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#555555] text-[#D4D4D4] transition hover:border-white hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.6 6.6-4.2M8.7 13.4l6.6 4.2"/></svg>
              </button>
              <span className="text-[11px] text-[#A3A3A3]">Share</span>
            </div>
            {shareMessage && <p role="status" aria-live="polite" className="mt-2 text-xs text-[#D4D4D4]">{shareMessage}</p>}
            {bagMessage && !bagMessage.includes("select") && !bagMessage.includes("stock") && (
              <div role="status" aria-live="polite" className="pointer-events-none fixed right-4 top-24 z-[60] flex max-w-[calc(100vw-2rem)] items-center gap-3 border border-[#333333] bg-[#111111] px-5 py-4 text-sm text-white shadow-2xl sm:right-8 sm:top-28">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-black" aria-hidden="true">✓</span>
                <span>{bagMessage}</span>
              </div>
            )}
            {bagMessage && (bagMessage.includes("select") || bagMessage.includes("stock")) && (
              <p role="alert" className="mt-3 text-sm text-red-400">{bagMessage}</p>
            )}

            <div className="mt-8 border-t border-[#333333] pt-6">
              <div className="flex justify-between py-3 text-xs">
                <span className="text-[#B5B5B5]">Product</span>
                <span>{product.category}</span>
              </div>

              <div className="flex justify-between border-t border-[#333333] py-3 text-xs">
                <span className="text-[#B5B5B5]">Availability</span>
                <span>
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Sold out"}
                </span>
              </div>

              <div className="flex justify-between border-t border-[#333333] py-3 text-xs">
                <span className="text-[#B5B5B5]">Subtotal</span>
                <span className="font-semibold">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showImageZoom && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Zoomed image of ${product.name}`}
          onClick={() => setShowImageZoom(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setShowImageZoom(false);
            if (event.key === "ArrowLeft" && galleryImages.length > 1) showPreviousImage();
            if (event.key === "ArrowRight" && galleryImages.length > 1) showNextImage();
          }}
          tabIndex={-1}
        >
          <button type="button" onClick={() => setShowImageZoom(false)} aria-label="Close image zoom" className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-black text-3xl text-white hover:bg-white hover:text-black">×</button>
          {galleryImages.length > 1 && <button type="button" onClick={(event) => { event.stopPropagation(); showPreviousImage(); }} aria-label="Previous zoomed image" className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-3xl text-black shadow-lg sm:left-8">‹</button>}
          <img src={currentImage} alt={`${product.name} - enlarged image ${activeImageIndex + 1}`} onClick={(event) => event.stopPropagation()} className="max-h-[90vh] max-w-[92vw] object-contain" />
          {galleryImages.length > 1 && <button type="button" onClick={(event) => { event.stopPropagation(); showNextImage(); }} aria-label="Next zoomed image" className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-3xl text-black shadow-lg sm:right-8">›</button>}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/30 bg-black/80 px-4 py-2 text-xs font-semibold text-white">
            {galleryImages.length > 1 ? `${activeImageIndex + 1} / ${galleryImages.length} · Click outside to close` : "Click outside to close"}
          </p>
        </div>
      )}

      {relatedProducts.length > 0 && (
        <section className="border-t border-[#333333] bg-[#090909] px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
              <div>
                <p className="text-[10px] font-bold tracking-[0.28em] text-[#B5B5B5]">KEEP EXPLORING</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">You may also like</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#B5B5B5]">More pieces to match your style, starting with products from the same category.</p>
              </div>
              <Link href="/" className="text-xs font-semibold tracking-[0.14em] text-[#F5F5F5] underline underline-offset-4 transition hover:text-[#B5B5B5]">VIEW ALL PRODUCTS</Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <Link key={related.id} href={`/products/${encodeURIComponent(related.id)}`} className="group min-w-0">
                  <div className="relative overflow-hidden bg-[#171717]">
                    <img
                      src={related.image_url || fallbackImage}
                      alt={related.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackImage;
                      }}
                      className="aspect-[4/5] w-full bg-[#111111] object-contain transition duration-300"
                    />
                    {related.stock <= 0 && (
                      <span className="absolute left-2 top-2 bg-black/80 px-2 py-1 text-[9px] font-semibold tracking-[0.12em] text-white sm:left-3 sm:top-3">SOLD OUT</span>
                    )}
                  </div>
                  <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#B5B5B5]">{related.category}</p>
                  <h3 className="mt-2 line-clamp-2 text-sm font-medium transition group-hover:text-[#B5B5B5] sm:text-base">{related.name}</h3>
                  <p className="mt-2 text-sm font-semibold">₹{Number(related.price).toLocaleString("en-IN")}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="mt-10 bg-[#050505] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/"
              className="text-2xl font-black tracking-[0.18em]"
            >
              AKURA<span className="text-[#60A5FA]">.</span>
            </Link>

            <p className="mt-2 text-xs text-white/60">
              Wear your own story.
            </p>
          </div>

        </div>
      </footer>
    </main>
  );
}