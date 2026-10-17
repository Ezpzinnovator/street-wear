"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url: string | null;
  sizes: string[];
  colors: string[];
  stock: number;
  is_active: boolean;
  created_at: string;
  tag?: string;
};

type CartItem = {
  key: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

type BrowseVibe =
  | "All"
  | "Anime & Manga"
  | "Movies & Series"
  | "Gaming"
  | "Sports & Teams"
  | "Everyday / Minimal"
  | "Oversized Fits";

type SortOption = "featured" | "newest" | "price-low" | "price-high" | "name";

const vibeKeywords: Record<Exclude<BrowseVibe, "All">, string[]> = {
  "Anime & Manga": [
    "anime", "manga", "naruto", "dragon ball", "one piece", "demon slayer",
    "attack on titan", "jujutsu", "pokemon", "my hero academia", "bleach",
    "chainsaw man", "studio ghibli", "solo leveling",
  ],
  "Movies & Series": [
    "movie", "movies", "series", "marvel", "dc comics", "spider-man", "spiderman",
    "batman", "superman", "star wars", "harry potter", "avengers", "stranger things",
    "breaking bad", "netflix", "cinema",
  ],
  Gaming: [
    "gaming", "game", "valorant", "minecraft", "fortnite", "elden ring",
    "playstation", "xbox", "pc gaming", "assassin's creed", "call of duty",
    "god of war", "cyberpunk", "league of legends", "genshin",
  ],
  "Sports & Teams": [
    "sport", "sports", "football", "basketball", "cricket", "chelsea", "real madrid",
    "barcelona", "manchester", "nba", "messi", "ronaldo", "formula 1", "f1", "racing",
    "lakers", "warriors",
  ],
  "Everyday / Minimal": [
    "minimal", "everyday", "basic", "essential", "plain", "casual", "simple",
  ],
  "Oversized Fits": ["oversized", "oversize", "relaxed fit", "baggy", "drop shoulder"],
};

const browseVibes: Exclude<BrowseVibe, "All">[] = [
  "Anime & Manga",
  "Movies & Series",
  "Gaming",
  "Sports & Teams",
  "Everyday / Minimal",
  "Oversized Fits",
];

const fallbackImage =
  "https://placehold.co/600x750/DBEAFE/102A43?text=AKURA";

const shopCategoryTiles: string[] = [
  "T-Shirts",
  "Oversized T-Shirts",
  "Hoodies",
  "Bottom Wear",
  "Accessories",
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [activeVibe, setActiveVibe] = useState<BrowseVibe>("All");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Could not load products.");
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Load the shared cart once, before allowing writes to localStorage.
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("akura-cart");
      if (savedCart) {
        const parsedCart: unknown = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart as CartItem[]);
        }
      }
    } catch (error) {
      console.error("Could not load saved cart:", error);
    } finally {
      setCartLoaded(true);
    }
  }, []);

  // Save only after the existing cart has been loaded, so the initial empty
  // state cannot overwrite a cart already stored in the browser.
  useEffect(() => {
    if (!cartLoaded) return;
    try {
      localStorage.setItem("akura-cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Could not save cart:", error);
    }
  }, [cart, cartLoaded]);

  
  const categories = useMemo(() => {
    const productCategories = products.map((product) => product.category).filter(Boolean);
    return [
      "All",
      ...Array.from(new Set([...shopCategoryTiles, ...productCategories])).sort((a, b) => {
        const preferredOrder = shopCategoryTiles.indexOf(a) - shopCategoryTiles.indexOf(b);
        if (shopCategoryTiles.includes(a) && shopCategoryTiles.includes(b)) return preferredOrder;
        if (shopCategoryTiles.includes(a)) return -1;
        if (shopCategoryTiles.includes(b)) return 1;
        return a.localeCompare(b);
      }),
    ];
  }, [products]);

  const availableSizes = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.sizes ?? []))).sort(),
    [products]
  );

  const availableColors = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.colors ?? []))).sort(),
    [products]
  );

  const activeFilterCount =
    (category !== "All" ? 1 : 0) +
    (search.trim() ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (minPrice !== "" || maxPrice !== "" ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (activeVibe !== "All" ? 1 : 0);

  const filteredProducts = useMemo(() => {
    const searchText = search.trim().toLowerCase();
    const min = minPrice.trim() === "" ? 0 : Math.max(0, Number(minPrice));
    const max = maxPrice.trim() === "" ? Number.POSITIVE_INFINITY : Math.max(0, Number(maxPrice));

    const matches = products.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.description ?? "",
        product.tag ?? "",
        ...(product.colors ?? []),
        ...(product.sizes ?? []),
      ].join(" ").toLowerCase();

      const normalizedProductCategory = (product.category ?? "").trim().toLowerCase();
      const normalizedSelectedCategory = category.trim().toLowerCase();
      const categoryAliases: Record<string, string[]> = {
        "t-shirts": ["t-shirt", "t-shirts", "tee", "tees"],
        "oversized t-shirts": ["oversized t-shirt", "oversized t-shirts", "oversize t-shirt", "oversize t-shirts"],
        "hoodies": ["hoodie", "hoodies", "sweatshirt", "sweatshirts"],
        "bottom wear": ["bottom wear", "bottomwear", "pants", "trousers", "joggers", "shorts", "track pants"],
        "accessories": ["accessory", "accessories", "cap", "caps", "hat", "hats", "socks", "bag", "bags"],
      };
      const selectedAliases = categoryAliases[normalizedSelectedCategory] ?? [normalizedSelectedCategory];
      const matchesCategory = category === "All" || selectedAliases.includes(normalizedProductCategory);
      const matchesSearch = !searchText || searchableText.includes(searchText);
      const matchesVibe =
        activeVibe === "All" ||
        vibeKeywords[activeVibe].some((keyword) => searchableText.includes(keyword));
      const matchesSize =
        selectedSizes.length === 0 ||
        selectedSizes.some((size) => (product.sizes ?? []).includes(size));
      const matchesColor =
        selectedColors.length === 0 ||
        selectedColors.some((color) => (product.colors ?? []).includes(color));
      const matchesPrice =
        Number.isFinite(product.price) && product.price >= min && product.price <= max;
      const matchesStock = !inStockOnly || product.stock > 0;

      return (
        matchesCategory && matchesSearch && matchesVibe && matchesSize &&
        matchesColor && matchesPrice && matchesStock
      );
    });

    if (sortBy === "newest") {
      matches.sort((a, b) => {
        const dateA = Date.parse(a.created_at ?? "") || 0;
        const dateB = Date.parse(b.created_at ?? "") || 0;
        return dateB - dateA;
      });
    } else if (sortBy === "price-low") {
      matches.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      matches.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      matches.sort((a, b) => a.name.localeCompare(b.name));
    }

    return matches;
  }, [
    products, category, search, selectedSizes, selectedColors, minPrice, maxPrice,
    inStockOnly, sortBy, activeVibe,
  ]);

  const cartProducts = cart
    .map((item) => ({
      item,
      product: products.find((product) => product.id === item.productId),
    }))
    .filter(
      (
        entry
      ): entry is { item: CartItem; product: Product } =>
        entry.product !== undefined
    );

  const total = cartProducts.reduce(
    (sum, { item, product }) => sum + product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function clearBrowseFilters() {
    setCategory("All");
    setSearch("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSortBy("featured");
    setActiveVibe("All");
  }

  function openCategory(categoryName: string) {
    setCategory(categoryName);
    setSearch("");
    setActiveVibe("All");
    setMenuOpen(false);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  }

  function browseVibe(vibe: BrowseVibe) {
    setCategory("All");
    setSearch("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setActiveVibe(vibe);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleValue(value: string, current: string[], setter: (values: string[]) => void) {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function removeFromCart(key: string) {
    setCart((current) => current.filter((item) => item.key !== key));
  }

  function changeQuantity(key: string, delta: number) {
    setCart((current) =>
      current
        .map((item) => {
          if (item.key !== key) return item;

          const product = products.find(
            (product) => product.id === item.productId
          );

          const maxStock = product?.stock ?? 99;
          const nextQuantity = Math.min(
            Math.max(item.quantity + delta, 1),
            maxStock
          );

          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0)
    );
  }


  return (
    <main className="min-h-screen bg-[#EFF6FF] text-[#102A43]">
      <div className="bg-[#102A43] px-4 py-2.5 text-center text-[10px] font-medium tracking-[0.22em] text-white sm:text-xs">
        FREE SHIPPING ON ORDERS ABOVE ₹1,999
      </div>

      <header className="sticky top-0 z-30 border-b border-[#BFDBFE] bg-[#F8FAFC]/95 text-[#102A43] backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3 sm:px-8 sm:py-4">
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              className="inline-flex h-10 w-10 items-center justify-center transition hover:text-[#2563EB]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
              </svg>
            </button>
          </div>

          <Link
            href="/"
            aria-label="Akura home"
            className="justify-self-center whitespace-nowrap text-xl font-black tracking-[0.16em] text-[#102A43] sm:text-2xl sm:tracking-[0.2em]"
          >
            AKURA<span className="text-[#3B82F6]">.</span>
          </Link>

          <div className="flex items-center justify-end gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
                window.setTimeout(() => document.getElementById("search")?.focus(), 250);
              }}
              aria-label="Search products"
              className="inline-flex h-10 w-9 items-center justify-center transition hover:text-[#2563EB]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.2 4.2" />
              </svg>
            </button>
            <Link
              href="/account"
              aria-label="My account"
              title="My account"
              className="inline-flex h-10 w-9 items-center justify-center transition hover:text-[#2563EB]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="7.5" r="3.5" />
                <path d="M4.5 20c.4-4 3.2-6.2 7.5-6.2s7.1 2.2 7.5 6.2" />
              </svg>
            </Link>
            <Link
              href="/cart"
              aria-label={`Shopping bag, ${cartCount} items`}
              title="Shopping bag"
              className="relative inline-flex h-10 w-9 items-center justify-center transition hover:text-[#2563EB]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5.5 8.5h13l1 12h-15l1-12Z" />
                <path d="M9 9V6a3 3 0 0 1 6 0v3" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 translate-x-0 items-center justify-center rounded-full bg-[#3B82F6] px-1 text-[9px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <nav aria-label="Shop categories" className="border-t border-[#E2E8F0]">
          <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-2.5 sm:justify-center sm:gap-7 sm:px-8">
            {shopCategoryTiles.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => openCategory(item)}
                className={`shrink-0 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] transition hover:text-[#2563EB] sm:text-[11px] sm:tracking-[0.13em] ${category === item ? "text-[#2563EB]" : "text-[#102A43]"}`}
              >
                {item === "Oversized T-Shirts" ? "Oversized" : item === "Bottom Wear" ? "Bottoms" : item}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-[#102A43]/55"
          onClick={() => setMenuOpen(false)}
          role="presentation"
        >
          <aside
            className="flex h-full w-[88%] max-w-sm flex-col overflow-y-auto bg-[#EFF6FF] p-5 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
            aria-label="Main navigation"
          >
            <div className="flex items-center justify-between border-b border-[#BFDBFE] pb-5">
              <Link href="/" onClick={() => setMenuOpen(false)} className="text-xl font-black tracking-[0.16em]">
                AKURA<span className="text-[#3B82F6]">.</span>
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation menu"
                className="h-10 w-10 border border-[#BFDBFE] text-2xl hover:border-[#3B82F6]"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => openCategory("All")} className="bg-[#102A43] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">
                Shop all products ↗
              </button>
              <button
                onClick={() => { clearBrowseFilters(); setSortBy("newest"); setMenuOpen(false); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }}
                className="border border-[#BFDBFE] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide hover:border-[#3B82F6]"
              >
                New arrivals ↗
              </button>
            </div>

            <div className="mt-7">
              <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-[#2563EB]">SHOP CATEGORIES</p>
              <div className="divide-y divide-[#DBEAFE] border-y border-[#DBEAFE]">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => openCategory(item)}
                    className={`flex w-full items-center justify-between py-3.5 text-left text-sm transition hover:text-[#2563EB] ${category === item ? "font-bold text-[#2563EB]" : ""}`}
                  >
                    <span>{item === "All" ? "All products" : item}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-[#2563EB]">DISCOVER</p>
              <div className="flex flex-wrap gap-2">
                {browseVibes.map((vibe) => (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => { setMenuOpen(false); browseVibe(vibe); }}
                    className="border border-[#BFDBFE] px-3 py-2 text-xs hover:border-[#3B82F6] hover:text-[#2563EB]"
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-3 border-t border-[#BFDBFE] pt-6">
              <Link href="/account" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-semibold hover:text-[#2563EB]">My account ↗</Link>
              <Link href="/cart" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-semibold hover:text-[#2563EB]">Shopping bag ↗</Link>
              <a href="#about" onClick={() => setMenuOpen(false)} className="py-2 text-sm hover:text-[#2563EB]">Our story ↗</a>
              <a href="mailto:hello@akuraclothing.com" onClick={() => setMenuOpen(false)} className="py-2 text-sm hover:text-[#2563EB]">Contact us ↗</a>
            </div>
          </aside>
        </div>
      )}

      {showCart && (
        <div
          className="fixed inset-0 z-50 bg-[#102A43]/50"
          onClick={() => setShowCart(false)}
        >
          <aside
            className="ml-auto flex h-full w-full max-w-md flex-col bg-[#EFF6FF] p-5 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-7 flex items-center justify-between border-b border-[#BFDBFE] pb-5">
              <div>
                <p className="text-xs tracking-[0.2em] text-[#3B82F6]">
                  AKURA
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Your Bag ({cartCount})
                </h2>
              </div>

              <button
                onClick={() => setShowCart(false)}
                aria-label="Close shopping bag"
                className="text-3xl text-[#102A43] hover:text-[#3B82F6]"
              >
                ×
              </button>
            </div>

            {cartProducts.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <span className="text-5xl text-[#93C5FD]">♧</span>
                <h3 className="mt-5 text-lg font-semibold">Your bag is empty</h3>
                <p className="mt-2 text-sm text-[#486581]">
                  Discover something that expresses you.
                </p>
                <button
                  onClick={() => setShowCart(false)}
                  className="mt-6 bg-[#3B82F6] px-7 py-3 text-xs font-semibold tracking-[0.15em] text-white transition hover:bg-[#1D4ED8]"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            ) : (
              <div className="flex-1 space-y-5 overflow-y-auto">
                {cartProducts.map(({ item, product }) => (
                  <div
                    key={item.key}
                    className="flex gap-4 border-b border-[#BFDBFE] pb-5"
                  >
                    
<img
  src={product.image_url || fallbackImage}
  alt={product.name}
  loading="lazy"
  onError={(e) => {
    const img = e.currentTarget;
    img.onerror = null;
    img.src = fallbackImage;
  }}
  className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
/>

                    <div className="flex flex-1 flex-col justify-center">
                      <h3 className="text-sm font-semibold">{product.name}</h3>
                      <p className="mt-1 text-xs text-[#486581]">
                        {product.category}
                      </p>

                      {item.size && (
                        <p className="mt-1 text-xs text-[#627D98]">
                          Size: <span className="font-medium">{item.size}</span>
                        </p>
                      )}

                      {item.color && (
                        <p className="mt-1 text-xs text-[#627D98]">
                          Color:{" "}
                          <span className="font-medium">{item.color}</span>
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>

                        <div className="flex items-center border border-[#BFDBFE]">
                          <button
                            onClick={() => changeQuantity(item.key, -1)}
                            className="px-2 py-1 text-sm hover:bg-[#DBEAFE]"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => changeQuantity(item.key, 1)}
                            className="px-2 py-1 text-sm hover:bg-[#DBEAFE]"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="mt-2 w-fit text-xs text-[#3B82F6] underline underline-offset-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cartProducts.length > 0 && (
              <div className="border-t border-[#BFDBFE] pt-5">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-[#486581]">Subtotal</span>
                  <span className="font-semibold">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>

                <p className="mb-5 text-xs text-[#627D98]">
                  Shipping and taxes calculated at checkout.
                </p>

                <button
                  disabled
                  className="w-full cursor-not-allowed bg-[#102A43] py-4 text-xs font-semibold tracking-[0.2em] text-white opacity-60"
                >
                  CHECKOUT COMING SOON
                </button>

                <p className="mt-3 text-center text-[10px] text-[#627D98]">
                  Secure checkout will be enabled in a later step.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      <section
        id="home"
        className="relative flex min-h-[520px] items-center overflow-hidden bg-[#DBEAFE] px-6 py-20 sm:min-h-[600px] sm:px-10 md:min-h-[650px]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#DBEAFE] via-[#DBEAFE]/95 to-[#93C5FD]/40" />

        <div className="relative mx-auto w-full max-w-7xl">
          <p className="mb-6 text-[10px] font-bold tracking-[0.35em] text-[#2563EB] sm:text-xs">
            THE NEW EXPRESSION
          </p>

          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl md:text-8xl">
            Wear your
            <br />
            own <span className="text-[#3B82F6]">story.</span>
          </h1>

          <p className="mt-6 max-w-md text-sm leading-7 text-[#334E68] sm:text-base">
            Everyday essentials. Bold identities. Discover clothing inspired by
            the things you love.
          </p>

          <a
            href="#shop"
            className="mt-9 inline-flex items-center gap-4 bg-[#3B82F6] px-8 py-4 text-[10px] font-semibold tracking-[0.2em] text-white transition hover:bg-[#1D4ED8] sm:text-xs"
          >
            EXPLORE COLLECTION
            <span className="text-base">↗</span>
          </a>
        </div>

        <div className="absolute bottom-8 right-8 hidden text-right text-[10px] font-medium tracking-[0.25em] text-[#486581] md:block">
          AKURA / EST. 2026
        </div>

        <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full border-[35px] border-[#3B82F6]/10 md:h-[500px] md:w-[500px]" />
        <div className="pointer-events-none absolute -bottom-10 -right-6 h-52 w-52 rounded-full border border-[#3B82F6]/20 md:h-[350px] md:w-[350px]" />
      </section>

      <section id="shop-by-category" className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 max-w-xs sm:mb-10">
          <h2 className="text-2xl font-light uppercase leading-[1.05] tracking-[-0.04em] sm:text-3xl">
            Shop by
            <br />
            <span className="font-bold">Category</span>
          </h2>
          <div className="mt-4 h-[2px] w-36 bg-[#3B82F6] sm:w-44" />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5 lg:gap-x-8">
          {shopCategoryTiles.map((item) => {
            const categorySearchTerms: Record<string, string[]> = {
              "T-Shirts": ["t-shirt", "t-shirts", "tee", "tees"],
              "Oversized T-Shirts": ["oversized", "oversize", "relaxed fit", "baggy"],
              Hoodies: ["hoodie", "hoodies", "sweatshirt", "sweatshirts"],
              "Bottom Wear": ["bottom wear", "bottomwear", "pants", "trousers", "joggers", "shorts", "jeans", "track pants"],
              Accessories: ["accessory", "accessories", "cap", "caps", "hat", "hats", "socks", "bag", "bags"],
            };
            const terms = categorySearchTerms[item] ?? [item.toLowerCase()];
            const matchingProduct = products.find((product) => {
              const searchable = `${product.category} ${product.name} ${product.description ?? ""}`.toLowerCase();
              return terms.some((term) => searchable.includes(term));
            });

            return (
              <button
                key={item}
                type="button"
                onClick={() => openCategory(item)}
                className="group min-w-0 text-left"
                aria-label={`Shop ${item}`}
              >
                <span className="mb-3 block text-center text-sm font-medium uppercase tracking-[-0.03em] text-[#102A43] transition group-hover:text-[#2563EB] sm:text-base">
                  {item === "Oversized T-Shirts" ? "Oversized" : item === "Bottom Wear" ? "Bottoms" : item}
                </span>
                <span className="block overflow-hidden bg-white">
                  <img
                    src={matchingProduct?.image_url || fallbackImage}
                    alt={matchingProduct ? matchingProduct.name : `${item} category`}
                    loading="lazy"
                    onError={(event) => {
                      const img = event.currentTarget;
                      img.onerror = null;
                      img.src = fallbackImage;
                    }}
                    className="aspect-[4/5] w-full object-contain transition duration-500 group-hover:scale-[1.04]"
                  />
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            clearBrowseFilters();
            document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="mt-7 inline-flex items-center gap-2 border-b border-[#102A43] pb-1 text-xs font-medium uppercase tracking-wide text-[#102A43] transition hover:border-[#3B82F6] hover:text-[#2563EB]"
        >
          Shop all <span aria-hidden="true">↗</span>
        </button>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
        <div className="mb-6 px-1 sm:mb-8 sm:px-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#486581] sm:text-xs">
            NEW ARRIVALS <span className="px-2 text-[#3B82F6]">/</span> FRESH DROPS
          </p>
          <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Just landed at Akura.</h2>
              <p className="mt-2 max-w-lg text-xs leading-5 text-[#627D98] sm:text-sm">
                Discover the latest pieces added to the collection.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearBrowseFilters();
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex w-fit items-center gap-2 border-b border-[#102A43] pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition hover:border-[#3B82F6] hover:text-[#2563EB] sm:text-xs"
            >
              View all products <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

        {loading ? (
          <p className="px-2 py-10 text-sm text-[#627D98]">Loading new arrivals...</p>
        ) : error ? (
          <p className="px-2 py-10 text-sm text-red-600">New arrivals are temporarily unavailable.</p>
        ) : products.length === 0 ? (
          <p className="px-2 py-10 text-sm text-[#627D98]">New products are coming soon. Check back shortly.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
            {[...products]
              .sort((a, b) => (Date.parse(b.created_at ?? "") || 0) - (Date.parse(a.created_at ?? "") || 0))
              .slice(0, 4)
              .map((product) => (
                <article key={product.id} className="group min-w-0">
                  <Link
                    href={`/products/${encodeURIComponent(product.id)}`}
                    aria-label={`View ${product.name}`}
                    className="relative block overflow-hidden rounded-sm bg-[#DBEAFE]"
                  >
                    <img
                      src={product.image_url || fallbackImage}
                      alt={product.name}
                      loading="lazy"
                      onError={(event) => {
                        const img = event.currentTarget;
                        img.onerror = null;
                        img.src = fallbackImage;
                      }}
                      className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute left-2 top-2 bg-white/95 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#102A43] sm:left-3 sm:top-3 sm:text-[9px]">
                      New arrival
                    </span>
                  </Link>
                  <div className="flex items-start justify-between gap-2 pt-3 sm:pt-4">
                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold leading-5 sm:text-sm">
                        <Link href={`/products/${encodeURIComponent(product.id)}`} className="transition hover:text-[#2563EB]">
                          {product.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-[10px] text-[#627D98] sm:text-xs">{product.category}</p>
                    </div>
                    <p className="shrink-0 whitespace-nowrap text-xs font-semibold sm:text-sm">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>

      <section
        id="shop"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20"
      >
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-[10px] font-bold tracking-[0.3em] text-[#3B82F6]">
              CURATED FOR YOU
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Featured collection
            </h2>
            <p className="mt-2 text-xs text-[#627D98]">
              Discover the latest from Akura.
            </p>
          </div>

          <input
            id="search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full border-b border-[#93C5FD] bg-transparent px-2 py-3 text-sm outline-none transition placeholder:text-[#829AB1] focus:border-[#3B82F6] sm:max-w-xs"
          />
        </div>

        <div className="mb-7 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => { setCategory(item); setActiveVibe("All"); }}
              className={`border px-4 py-2.5 text-[10px] font-semibold tracking-wide transition sm:px-5 sm:text-xs ${
                category === item
                  ? "border-[#3B82F6] bg-[#3B82F6] text-white"
                  : "border-[#BFDBFE] bg-transparent text-[#334E68] hover:border-[#3B82F6] hover:text-[#2563EB]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mb-7 border-y border-[#BFDBFE] py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                aria-expanded={showFilters}
                className={`inline-flex items-center gap-2 border px-4 py-2.5 text-xs font-semibold transition ${showFilters || activeFilterCount > 0 ? "border-[#3B82F6] bg-[#DBEAFE] text-[#1D4ED8]" : "border-[#BFDBFE] hover:border-[#3B82F6]"}`}
              >
                <span aria-hidden="true">☷</span>
                Filters {activeFilterCount > 0 && <span className="rounded-full bg-[#3B82F6] px-2 py-0.5 text-[10px] text-white">{activeFilterCount}</span>}
                <span aria-hidden="true">{showFilters ? "−" : "+"}</span>
              </button>
              <span className="text-xs text-[#627D98]">
                {!loading && !error ? `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"}` : "Finding your fit..."}
              </span>
              {activeFilterCount > 0 && (
                <button type="button" onClick={clearBrowseFilters} className="text-xs font-semibold text-[#2563EB] underline underline-offset-4">
                  Clear all
                </button>
              )}
            </div>

            <label className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-[#486581]">Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="min-w-44 border border-[#BFDBFE] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#3B82F6]"
              >
                <option value="featured">Featured</option>
                <option value="newest">New arrivals</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>

          {showFilters && (
            <div className="mt-5 grid gap-6 border-t border-[#DBEAFE] pt-5 sm:grid-cols-2 lg:grid-cols-4">
              <fieldset>
                <legend className="mb-3 text-[10px] font-bold tracking-[0.15em]">SIZE</legend>
                {availableSizes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <label key={size} className={`cursor-pointer border px-3 py-2 text-xs transition ${selectedSizes.includes(size) ? "border-[#3B82F6] bg-[#DBEAFE] text-[#1D4ED8]" : "border-[#BFDBFE] hover:border-[#3B82F6]"}`}>
                        <input
                          type="checkbox"
                          checked={selectedSizes.includes(size)}
                          onChange={() => toggleValue(size, selectedSizes, setSelectedSizes)}
                          className="sr-only"
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                ) : <p className="text-xs text-[#829AB1]">No sizes available</p>}
              </fieldset>

              <fieldset>
                <legend className="mb-3 text-[10px] font-bold tracking-[0.15em]">COLOR</legend>
                {availableColors.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => (
                      <label key={color} className={`cursor-pointer border px-3 py-2 text-xs transition ${selectedColors.includes(color) ? "border-[#3B82F6] bg-[#DBEAFE] text-[#1D4ED8]" : "border-[#BFDBFE] hover:border-[#3B82F6]"}`}>
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(color)}
                          onChange={() => toggleValue(color, selectedColors, setSelectedColors)}
                          className="sr-only"
                        />
                        {color}
                      </label>
                    ))}
                  </div>
                ) : <p className="text-xs text-[#829AB1]">No colors available</p>}
              </fieldset>

              <fieldset>
                <legend className="mb-3 text-[10px] font-bold tracking-[0.15em]">PRICE RANGE (₹)</legend>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[10px] text-[#627D98]">Minimum
                    <input
                      type="number"
                      min="0"
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
                      placeholder="0"
                      className="mt-1 w-full border border-[#BFDBFE] bg-white px-3 py-2.5 text-xs text-[#102A43] outline-none focus:border-[#3B82F6]"
                    />
                  </label>
                  <label className="text-[10px] text-[#627D98]">Maximum
                    <input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                      placeholder="No limit"
                      className="mt-1 w-full border border-[#BFDBFE] bg-white px-3 py-2.5 text-xs text-[#102A43] outline-none focus:border-[#3B82F6]"
                    />
                  </label>
                </div>
                {minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice) && (
                  <p className="mt-2 text-[10px] text-red-600">Minimum price must be below maximum.</p>
                )}
              </fieldset>

              <div>
                <p className="mb-3 text-[10px] font-bold tracking-[0.15em]">AVAILABILITY</p>
                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(event) => setInStockOnly(event.target.checked)}
                    className="h-4 w-4 accent-[#3B82F6]"
                  />
                  In-stock items only
                </label>
                <p className="mt-3 text-xs leading-5 text-[#829AB1]">Filters update instantly as you choose options.</p>
              </div>
            </div>
          )}
        </div>

        {activeVibe !== "All" && (
          <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-[#486581]">
            <span>Browsing: <strong className="text-[#102A43]">{activeVibe}</strong></span>
            <button type="button" onClick={() => setActiveVibe("All")} className="font-semibold text-[#2563EB] underline underline-offset-4">Remove</button>
          </div>
        )}

        {loading && (
          <p className="py-12 text-center text-sm text-[#627D98]">
            Loading Akura collection...
          </p>
        )}

        {error && (
          <p className="py-12 text-center text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                return (
                  <article key={product.id} className="group min-w-0">
                    <div className="overflow-hidden bg-[#DBEAFE]">
                      <Link
                        href={`/products/${encodeURIComponent(product.id)}`}
                        aria-label={`View ${product.name}`}
                        className="relative block"
                      >
                        <img
                          src={product.image_url || fallbackImage}
                          alt={product.name}
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.onerror = null;
                            img.src = fallbackImage;
                          }}
                          className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        {product.tag && (
                          <span className="absolute left-3 top-3 bg-[#EFF6FF] px-2 py-1 text-[8px] font-bold tracking-[0.12em] text-[#1E40AF] sm:text-[9px]">
                            {product.tag}
                          </span>
                        )}
                      </Link>
                    </div>

                    <div className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold">
                            <Link
                              href={`/products/${encodeURIComponent(product.id)}`}
                              className="transition hover:text-[#2563EB]"
                            >
                              {product.name}
                            </Link>
                          </h3>
                          <p className="mt-1 text-[10px] text-[#627D98] sm:text-xs">
                            {product.category}
                          </p>
                        </div>

                        <p className="whitespace-nowrap text-sm font-semibold">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {product.description && (
                        <p className="mt-3 text-xs leading-5 text-[#627D98]">
                          {product.description}
                        </p>
                      )}

                      <Link
                        href={`/products/${encodeURIComponent(product.id)}`}
                        className="mt-5 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#2563EB] transition hover:text-[#1D4ED8]"
                      >
                        VIEW PRODUCT <span aria-hidden="true">→</span>
                      </Link>

                    </div>
                  </article>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm text-[#627D98]">
                  No products match these options. Try changing your search or filters.
                </p>

                <button
                  onClick={() => {
                    clearBrowseFilters();
                  }}
                  className="mt-4 text-xs font-semibold text-[#3B82F6] underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section
        id="about"
        className="bg-[#DBEAFE] px-5 py-20 text-center sm:py-24"
      >
        <p className="mb-4 text-[10px] font-bold tracking-[0.3em] text-[#2563EB]">
          THE AKURA APPROACH
        </p>
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Made for the way you express yourself.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#334E68]">
          A considered collection of everyday wear and culture-inspired
          designs. Find your style, make it yours.
        </p>
        <a
          href="#shop"
          className="mt-8 inline-block border border-[#3B82F6] px-7 py-3.5 text-[10px] font-semibold tracking-[0.18em] text-[#1D4ED8] transition hover:bg-[#3B82F6] hover:text-white"
        >
          DISCOVER AKURA
        </a>
      </section>

      <section className="bg-[#EFF6FF] px-5 py-16 text-center sm:py-20">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-[#3B82F6]">
          STAY IN THE LOOP
        </p>
        <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
          Something new is coming.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#627D98]">
          Keep an eye out for fresh drops, new collections and more from
          Akura.
        </p>
      </section>

      <footer className="overflow-hidden bg-[#071326] text-white">
        <style jsx>{`
          @keyframes akura-footer-marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .akura-footer-marquee-track {
            display: flex;
            width: max-content;
            animation: akura-footer-marquee 28s linear infinite;
          }
          .akura-footer-marquee:hover .akura-footer-marquee-track {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .akura-footer-marquee-track { animation: none; }
          }
        `}</style>

        <div className="akura-footer-marquee overflow-hidden border-y border-[#60A5FA]/20 bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#06B6D4] py-5 sm:py-7" aria-label="Akura brand message">
          <div className="akura-footer-marquee-track" aria-hidden="true">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center gap-7 pr-7 sm:gap-10 sm:pr-10">
                {Array.from({ length: 4 }).map((_, index) => (
                  <span key={index} className="flex items-center gap-7 whitespace-nowrap text-4xl font-black uppercase leading-none tracking-[-0.045em] text-[#D9F99D] sm:gap-10 sm:text-6xl md:text-7xl">
                    WEAR YOUR STORY <span className="text-white">✳</span> MAKE IT YOURS <span className="text-[#FDE047]">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mb-10">
            <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                <div>
                  <h2 className="text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl">Stay in your orbit.</h2>
                  <p className="mt-2 text-xs text-slate-300">Follow Akura for new drops, style inspiration and updates.</p>
                </div>
                <form
                  className="flex w-full max-w-[260px] items-center border border-white/35 focus-within:border-[#D9F99D]"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setNewsletterMessage("Thanks! Newsletter sign-up needs to be connected before emails can be saved.");
                  }}
                >
                  <label htmlFor="footer-newsletter-email" className="sr-only">Email address for newsletter</label>
                  <input
                    id="footer-newsletter-email"
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(event) => { setNewsletterEmail(event.target.value); setNewsletterMessage(""); }}
                    placeholder="Email"
                    autoComplete="email"
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs text-white outline-none placeholder:text-slate-400"
                  />
                  <button type="submit" aria-label="Subscribe to newsletter" className="px-3 py-2 text-lg text-white transition hover:text-[#D9F99D]">→</button>
                </form>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#D9F99D]">SPOT US ON</span>
            </div>
            {newsletterMessage && <p role="status" className="mb-3 text-[11px] text-slate-300">{newsletterMessage}</p>}
            <div className="grid grid-cols-2 border border-white/20 sm:grid-cols-4">
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram (replace with Akura's profile URL)" className="flex items-center gap-3 border-b border-r border-white/20 px-4 py-4 text-xs font-semibold uppercase tracking-wide transition hover:bg-[#E1306C] hover:text-white sm:border-b-0">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2.2A2.8 2.8 0 0 0 4.2 7v10A2.8 2.8 0 0 0 7 19.8h10a2.8 2.8 0 0 0 2.8-2.8V7A2.8 2.8 0 0 0 17 4.2H7Zm5 2.3a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm0 2.2a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Zm5.8-3.4a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z"/></svg>
                Instagram
              </a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn (replace with Akura's profile URL)" className="flex items-center gap-3 border-b border-white/20 px-4 py-4 text-xs font-semibold uppercase tracking-wide transition hover:bg-[#0A66C2] hover:text-white sm:border-b-0 sm:border-r">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor"><path d="M5.2 3A2.2 2.2 0 1 1 5.2 7.4 2.2 2.2 0 0 1 5.2 3ZM3.3 9h3.8v12H3.3V9Zm6.1 0H13v1.6h.1A4.1 4.1 0 0 1 16.8 8.7c4 0 4.7 2.6 4.7 6V21h-3.8v-5.6c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9.4V9Z"/></svg>
                LinkedIn
              </a>
              <a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="X (replace with Akura's profile URL)" className="flex items-center gap-3 border-r border-white/20 px-4 py-4 text-xs font-semibold uppercase tracking-wide transition hover:bg-black hover:text-white">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 13.8 4.8 22H1.7l7.3-8.4L.8 2h6.5l4.4 7.5L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z"/></svg>
                X / Twitter
              </a>
              <a href="https://www.whatsapp.com/" target="_blank" rel="noreferrer" aria-label="WhatsApp (replace with Akura's contact link)" className="flex items-center gap-3 px-4 py-4 text-xs font-semibold uppercase tracking-wide transition hover:bg-[#25D366] hover:text-[#071326]">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor"><path d="M12 2a9.8 9.8 0 0 0-8.5 14.7L2 22l5.5-1.4A10 10 0 1 0 12 2Zm0 2a7.8 7.8 0 0 1 0 15.6 7.7 7.7 0 0 1-3.9-1l-.4-.2-3.1.8.8-3-.3-.5A7.8 7.8 0 0 1 12 4Zm-3.1 3.7c-.2 0-.5.1-.7.4-.2.2-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.9 4.4 3.9 2.2.9 2.6.7 3.1.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.4l-1.8-.9c-.2-.1-.4-.1-.6.2l-.8 1c-.2.2-.3.2-.6.1a6.5 6.5 0 0 1-1.9-1.2 7.1 7.1 0 0 1-1.3-1.6c-.1-.3 0-.4.1-.5l.4-.5.3-.4c.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.5-.7-.5h-.5Z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>

          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr] md:gap-12">
            <div>
              <a href="#home" className="inline-block text-3xl font-black tracking-[0.18em] sm:text-4xl">
                AKURA<span className="text-[#60A5FA]">.</span>
              </a>
              <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
                Everyday essentials. Bold identities. Wear what tells your story.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#60A5FA]/30 bg-[#1D4ED8]/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BFDBFE]">
                <span className="h-2 w-2 rounded-full bg-[#A3E635] shadow-[0_0_10px_#A3E635]" />
                Find your own fit
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-[10px] font-bold tracking-[0.24em] text-[#93C5FD]">EXPLORE</h3>
              <div className="flex flex-col gap-3 text-sm text-slate-300">
                <a href="#shop" className="w-fit transition hover:translate-x-1 hover:text-[#D9F99D]">Shop all</a>
                <a href="#categories" className="w-fit transition hover:translate-x-1 hover:text-[#D9F99D]">Categories</a>
                <a href="#shop" className="w-fit transition hover:translate-x-1 hover:text-[#D9F99D]">Shop by style</a>
                <a href="#about" className="w-fit transition hover:translate-x-1 hover:text-[#D9F99D]">Our story</a>
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-[10px] font-bold tracking-[0.24em] text-[#93C5FD]">HELP & CONTACT</h3>
              <div className="flex flex-col gap-3 text-sm text-slate-300">
                <a href="mailto:hello@akuraclothing.com" className="w-fit transition hover:translate-x-1 hover:text-[#D9F99D]">Contact us</a>
                <Link href="/account" className="w-fit transition hover:translate-x-1 hover:text-[#D9F99D]">My account</Link>
                <a href="#home" className="w-fit transition hover:translate-x-1 hover:text-[#D9F99D]">Back to top ↑</a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-5 text-[10px] tracking-[0.12em] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 AKURA CLOTHING. ALL RIGHTS RESERVED.</span>
            <span className="font-semibold text-[#93C5FD]">BUILT FOR YOUR EXPRESSION ✦</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
