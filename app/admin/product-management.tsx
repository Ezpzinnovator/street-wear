
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Product = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  stock: number;
  is_active: boolean;
  image_url: string | null;
  image_urls: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  created_at: string;
};

type Props = {
  initialProducts: Product[];
};

const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ProductManagement({
  initialProducts,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-[#111111] px-3 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  function startEditing(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setDescription(product.description ?? "");
    setPrice(String(product.price));
    setStock(String(product.stock));
    setSizes((product.sizes ?? []).join(", "));
    setColors((product.colors ?? []).join(", "));
    setIsActive(product.is_active);

    const existingImages = Array.from(
      new Set(
        [product.image_url, ...(product.image_urls ?? [])].filter(
          (url): url is string => Boolean(url)
        )
      )
    );

    setImageUrls(existingImages);
    setNewImages([]);
    setError("");
    setSuccess("");
  }

  function cancelEditing() {
    setEditingId(null);
    setNewImages([]);
    setImageUrls([]);
    setError("");
  }

  function handleNewImages(files: FileList | null) {
    if (!files) return;

    const selected = Array.from(files);
    const accepted: File[] = [];
    let message = "";

    for (const file of selected) {
      if (
        imageUrls.length + newImages.length + accepted.length >= MAX_IMAGES
      ) {
        message = `A product can have a maximum of ${MAX_IMAGES} images.`;
        break;
      }

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        message = "Use JPG, PNG, or WebP images only.";
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        message = `${file.name} is larger than 5 MB.`;
        continue;
      }

      accepted.push(file);
    }

    setNewImages((current) => [...current, ...accepted]);
    setError(message);
  }

  function removeExistingImage(url: string) {
    setImageUrls((current) => current.filter((item) => item !== url));
  }

  function removeNewImage(index: number) {
    setNewImages((current) => current.filter((_, i) => i !== index));
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId) return;

    if (imageUrls.length + newImages.length === 0) {
      setError("Please keep or upload at least one product image.");
      return;
    }

    if (imageUrls.length + newImages.length > MAX_IMAGES) {
      setError(`A product can have a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();
      const uploadedUrls: string[] = [];

      for (const file of newImages) {
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, {
            cacheControl: "31536000",
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);

        uploadedUrls.push(data.publicUrl);
      }

      const allImages = [...imageUrls, ...uploadedUrls];

      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name,
          category,
          description,
          price,
          stock,
          sizes: sizes.split(",").map((value) => value.trim()).filter(Boolean),
          colors: colors.split(",").map((value) => value.trim()).filter(Boolean),
          is_active: isActive,
          image_url: allImages[0],
          image_urls: allImages,
        }),
      });

      const responseText = await response.text();
      let result: { error?: string; product?: Product } = {};

      if (responseText.trim()) {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            `The server returned an invalid response (HTTP ${response.status}).`
          );
        }
      }

      if (!response.ok) {
        throw new Error(result.error || `Update failed (HTTP ${response.status}).`);
      }

      if (!result.product) {
        throw new Error("The server did not return the updated product.");
      }

      const updated = result.product;

      setProducts((current) =>
        current.map((product) =>
          product.id === updated.id ? updated : product
        )
      );

      setEditingId(null);
      setNewImages([]);
      setImageUrls([]);
      setSuccess("Product updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(product: Product) {
    setBusyId(product.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          is_active: !product.is_active,
        }),
      });

      const responseText = await response.text();
      let result: { error?: string; product?: Product } = {};

      if (responseText.trim()) {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            `The server returned an invalid response (HTTP ${response.status}).`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          result.error || `Status update failed (HTTP ${response.status}).`
        );
      }

      if (!result.product) {
        throw new Error("The server did not return the updated product.");
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? result.product! : item
        )
      );

      setSuccess(
        `${product.name} is now ${!product.is_active ? "active" : "inactive"}.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.name}" permanently? This removes the product record from your database.`
    );

    if (!confirmed) return;

    setBusyId(product.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/products?id=${encodeURIComponent(product.id)}`,
        { method: "DELETE" }
      );

      // Read as text first to handle empty or non-JSON responses safely.
      const responseText = await response.text();
      let result: { error?: string; success?: boolean } = {};

      if (responseText.trim()) {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            `The server returned an invalid response (HTTP ${response.status}).`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          result.error || `Delete failed (HTTP ${response.status}).`
        );
      }

      if (result.success !== true) {
        throw new Error(
          "The server did not confirm that the product was deleted."
        );
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );

      if (editingId === product.id) {
        setEditingId(null);
      }

      setSuccess(`"${product.name}" was deleted.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting the product."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-7 rounded-xl border border-[#333333] bg-[#111111] p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#F5F5F5]">
            Product Management
          </h2>
          <p className="mt-1 text-sm text-[#A3A3A3]">
            Edit product details, manage images, control visibility, or delete products.
          </p>
        </div>

        <span className="rounded-full bg-[#171717] px-3 py-1 text-sm font-medium text-[#D4D4D4]">
          {products.length} Products
        </span>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="mb-4 rounded-lg bg-[#111111] p-3 text-sm text-[#D4D4D4]"
        >
          {success}
        </p>
      )}

      {products.length === 0 ? (
        <p className="rounded-lg bg-[#090909] p-4 text-sm text-[#A3A3A3]">
          No products found.
        </p>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="rounded-xl border border-[#333333] p-4"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#F5F5F5]">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-sm text-[#A3A3A3]">
                    {product.category} · ₹
                    {Number(product.price).toLocaleString("en-IN")} · Stock:{" "}
                    {product.stock}
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      product.is_active
                        ? "bg-green-100 text-[#D4D4D4]"
                        : "bg-[#171717] text-[#A3A3A3]"
                    }`}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      editingId === product.id
                        ? cancelEditing()
                        : startEditing(product)
                    }
                    disabled={saving || busyId !== null}
                    className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-[#D4D4D4] hover:bg-[#171717] disabled:opacity-50"
                  >
                    {editingId === product.id ? "Cancel edit" : "Edit"}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleStatus(product)}
                    disabled={saving || busyId !== null}
                    className="rounded-lg border border-[#333333] px-3 py-2 text-sm font-medium text-[#D4D4D4] hover:bg-[#090909] disabled:opacity-50"
                  >
                    {busyId === product.id
                      ? "Working..."
                      : product.is_active
                        ? "Deactivate"
                        : "Activate"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteProduct(product)}
                    disabled={saving || busyId !== null}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {busyId === product.id ? "Working..." : "Delete"}
                  </button>
                </div>
              </div>

              {editingId === product.id && (
                <form
                  onSubmit={saveProduct}
                  className="mt-5 space-y-4 border-t border-[#333333] pt-5"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm font-medium text-[#D4D4D4]">
                      Product name
                      <input
                        className={`${inputClass} mt-1`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={150}
                      />
                    </label>

                    <label className="text-sm font-medium text-[#D4D4D4]">
                      Category
                      <input
                        className={`${inputClass} mt-1`}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        maxLength={100}
                      />
                    </label>

                    <label className="text-sm font-medium text-[#D4D4D4]">
                      Price (INR)
                      <input
                        className={`${inputClass} mt-1`}
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min="0.01"
                        step="0.01"
                        required
                      />
                    </label>

                    <label className="text-sm font-medium text-[#D4D4D4]">
                      Stock
                      <input
                        className={`${inputClass} mt-1`}
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        min="0"
                        step="1"
                        required
                      />
                    </label>

                    <label className="text-sm font-medium text-[#D4D4D4] md:col-span-2">
                      Description
                      <textarea
                        className={`${inputClass} mt-1`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        maxLength={5000}
                      />
                    </label>

                    <label className="text-sm font-medium text-[#D4D4D4]">
                      Sizes (comma-separated)
                      <input
                        className={`${inputClass} mt-1`}
                        value={sizes}
                        onChange={(e) => setSizes(e.target.value)}
                        placeholder="S, M, L, XL"
                      />
                    </label>

                    <label className="text-sm font-medium text-[#D4D4D4]">
                      Colors (comma-separated)
                      <input
                        className={`${inputClass} mt-1`}
                        value={colors}
                        onChange={(e) => setColors(e.target.value)}
                        placeholder="Black, White, Blue"
                      />
                    </label>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-[#D4D4D4]">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 accent-blue-700"
                    />
                    Visible in the store
                  </label>

                  <div>
                    <p className="mb-2 text-sm font-medium text-[#D4D4D4]">
                      Current product images
                    </p>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {imageUrls.map((url, index) => (
                        <div
                          key={url}
                          className="rounded-lg border border-[#333333] p-2"
                        >
                          <img
                            src={url}
                            alt={`${product.name} image ${index + 1}`}
                            className="h-32 w-full rounded-md object-cover"
                          />

                          <p className="mt-1 text-xs text-[#A3A3A3]">
                            Image {index + 1}
                          </p>

                          <button
                            type="button"
                            onClick={() => removeExistingImage(url)}
                            className="mt-1 text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    {imageUrls.length === 0 && (
                      <p className="text-sm text-[#A3A3A3]">
                        No existing images. Upload at least one below.
                      </p>
                    )}
                  </div>

                  <label className="block text-sm font-medium text-[#D4D4D4]">
                    Add more images
                    <input
                      className={`${inputClass} mt-1`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={
                        imageUrls.length + newImages.length >= MAX_IMAGES
                      }
                      onChange={(e) => {
                        handleNewImages(e.target.files);
                        e.target.value = "";
                      }}
                    />
                    <span className="mt-1 block text-xs text-[#A3A3A3]">
                      JPG, PNG or WebP. Maximum 5 MB per image and 8 images total.
                    </span>
                  </label>

                  {newImages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#D4D4D4]">
                        New images to upload
                      </p>

                      {newImages.map((file, index) => (
                        <div
                          key={`${file.name}-${file.size}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-lg bg-[#090909] px-3 py-2 text-sm"
                        >
                          <span className="truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="shrink-0 text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={saving || busyId !== null}
                      className="rounded-lg bg-[#F5F5F5] px-5 py-3 text-sm font-semibold text-black hover:bg-[#D4D4D4] disabled:opacity-60"
                    >
                      {saving ? "Saving changes..." : "Save changes"}
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={saving}
                      className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-[#D4D4D4] hover:bg-[#090909]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
