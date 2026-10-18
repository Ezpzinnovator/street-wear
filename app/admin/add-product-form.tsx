
"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type SelectedImage = {
  id: string;
  file: File;
  preview: string;
};

const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function AddProductForm() {
  const router = useRouter();
  const imagesRef = useRef<SelectedImage[]>([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");
  const [stock, setStock] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateImages(nextImages: SelectedImage[]) {
    imagesRef.current = nextImages;
    setImages(nextImages);
  }

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, []);

  // Keep the success toast visible before refreshing the server-rendered product list.
  useEffect(() => {
    if (!success) return;

    const timeoutId = window.setTimeout(() => {
      setSuccess("");
      router.refresh();
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [success, router]);

  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    setError("");
    setSuccess("");

    const currentImages = imagesRef.current;
    const accepted: SelectedImage[] = [];

    for (const file of files) {
      if (currentImages.length + accepted.length >= MAX_IMAGES) {
        setError(`You can upload up to ${MAX_IMAGES} images per product.`);
        break;
      }

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Use JPG, PNG, or WebP images only.");
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} is larger than 5 MB.`);
        continue;
      }

      accepted.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (accepted.length > 0) {
      updateImages([...currentImages, ...accepted]);
    }
  }

  function removeImage(id: string) {
    const currentImages = imagesRef.current;
    const removed = currentImages.find((image) => image.id === id);

    if (removed) {
      URL.revokeObjectURL(removed.preview);
    }

    updateImages(currentImages.filter((image) => image.id !== id));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (images.length === 0) {
      setError("Please upload at least one product image.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const imageUrls: string[] = [];

      // Upload through the server so admin access and file contents are checked.
      for (const image of images) {
        const formData = new FormData();
        formData.append("file", image.file);

        const uploadResponse = await fetch("/api/admin/product-images", {
          method: "POST",
          body: formData,
        });
        const uploadResult = await uploadResponse.json().catch(() => ({}));

        if (!uploadResponse.ok || typeof uploadResult.url !== "string") {
          throw new Error(uploadResult.error || "Image upload failed.");
        }

        imageUrls.push(uploadResult.url);
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          description,
          price,
          image_url: imageUrls[0],
          image_urls: imageUrls,
          sizes: sizes.split(",").map((item) => item.trim()).filter(Boolean),
          colors: colors.split(",").map((item) => item.trim()).filter(Boolean),
          stock,
          is_active: isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to add product.");
      }

      setSuccess("Product added successfully!");

      setName("");
      setCategory("");
      setDescription("");
      setPrice("");
      setSizes("");
      setColors("");
      setStock("0");
      setIsActive(true);

      imagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
      updateImages([]);

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-[#111111] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <section className="mt-7 rounded-xl border border-[#333333] bg-[#111111] p-6 shadow-sm">
      {success && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-[10000] flex max-w-sm items-start gap-3 rounded-xl border border-[#333333] bg-[#111111] p-4 text-sm text-green-800 shadow-xl"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-base font-bold text-[#D4D4D4]" aria-hidden="true">
            ✓
          </span>
          <span className="pt-1 font-semibold">Product added successfully!</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss notification"
            className="ml-2 rounded px-1 text-lg leading-none text-[#D4D4D4] hover:bg-[#111111]"
          >
            ×
          </button>
        </div>
      )}
      <h2 className="text-xl font-bold text-[#F5F5F5]">Add New Product</h2>
      <p className="mt-1 text-sm text-[#A3A3A3]">
        Add product details and upload up to {MAX_IMAGES} images in order.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#D4D4D4]">
              Product Name *
            </label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Akura Essential Tee"
              required
              maxLength={150}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#D4D4D4]">
              Category *
            </label>
            <input
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="T-Shirts"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#D4D4D4]">
              Price (INR) *
            </label>
            <input
              className={inputClass}
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="899"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#D4D4D4]">
              Stock Quantity *
            </label>
            <input
              className={inputClass}
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
              step="1"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#D4D4D4]">
              Description
            </label>
            <textarea
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product, material and fit..."
              rows={4}
              maxLength={5000}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#D4D4D4]">
              Product Images * (up to {MAX_IMAGES})
            </label>
            <input
              className={inputClass}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelection}
              disabled={loading || images.length >= MAX_IMAGES}
            />
            <p className="mt-1 text-xs text-[#A3A3A3]">
              JPG, PNG or WebP. Maximum 5 MB per image. Select multiple files
              at once. Images are used in the order shown below. The first
              image is automatically the main image.
            </p>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="rounded-lg border border-[#333333] p-2"
                  >
                    <img
                      src={image.preview}
                      alt={image.file.name}
                      className="h-36 w-full rounded-md object-cover"
                    />

                    <p className="mt-2 truncate text-xs text-[#A3A3A3]">
                      {index + 1}. {image.file.name}
                    </p>

                    {index === 0 && (
                      <p className="mt-1 text-xs font-medium text-[#D4D4D4]">
                        Main image
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      disabled={loading}
                      className="mt-2 text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Remove image
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#D4D4D4]">
              Available Sizes
            </label>
            <input
              className={inputClass}
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              placeholder="S, M, L, XL"
            />
            <p className="mt-1 text-xs text-[#A3A3A3]">
              Separate sizes with commas.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#D4D4D4]">
              Available Colors
            </label>
            <input
              className={inputClass}
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="Black, White, Blue"
            />
            <p className="mt-1 text-xs text-[#A3A3A3]">
              Separate colors with commas.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-[#D4D4D4]">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-blue-700"
          />
          Make this product visible in the store
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#F5F5F5] px-6 py-3 text-sm font-semibold text-black transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Uploading images and saving..." : "Add Product"}
        </button>
      </form>
    </section>
  );
}
