import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

async function getAdminClient() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      supabase,
      response: NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      ),
    };
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || admin?.role !== "admin") {
    return {
      supabase,
      response: NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      ),
    };
  }

  return { supabase, response: null };
}

function validateProduct(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const category =
    typeof body.category === "string" ? body.category.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  const priceInput = body.price;
  const stockInput = body.stock;
  const price =
    (typeof priceInput === "number" ||
      (typeof priceInput === "string" && priceInput.trim() !== ""))
      ? Number(priceInput)
      : Number.NaN;
  const stock =
    (typeof stockInput === "number" ||
      (typeof stockInput === "string" && stockInput.trim() !== ""))
      ? Number(stockInput)
      : Number.NaN;

  if (
    name.length > 150 ||
    category.length > 100 ||
    description.length > 5000
  ) {
    return { error: "Product fields exceed the allowed length." };
  }

  if (body.is_active !== undefined && typeof body.is_active !== "boolean") {
    return { error: "Product visibility must be true or false." };
  }

  if (
    (body.sizes !== undefined && !Array.isArray(body.sizes)) ||
    (body.colors !== undefined && !Array.isArray(body.colors))
  ) {
    return { error: "Sizes and colors must be lists of text values." };
  }

  const parseTextList = (value: unknown): string[] | null => {
    if (value === undefined) return [];
    if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
      return null;
    }
    return Array.from(new Set(value.map((item) => item.trim()).filter(Boolean)));
  };

  const sizes = parseTextList(body.sizes);
  const colors = parseTextList(body.colors);
  if (!sizes || !colors) {
    return { error: "Sizes and colors must contain only text values." };
  }

  if (body.image_urls !== undefined && !Array.isArray(body.image_urls)) {
    return { error: "Product images must be provided as a list." };
  }
  const rawImages = Array.isArray(body.image_urls)
    ? body.image_urls
    : [];

  if (rawImages.some((value) => typeof value !== "string")) {
    return { error: "Every product image must be a URL string." };
  }

  const imageUrls = (rawImages as string[])
    .map((value) => value.trim())
    .filter(Boolean);

  const imageUrl =
    typeof body.image_url === "string" ? body.image_url.trim() : "";

  const allImages = Array.from(
    new Set([imageUrl, ...imageUrls].filter(Boolean))
  );

  if (!name || !category) {
    return { error: "Product name and category are required." };
  }

  if (name.length > 150 || category.length > 100 || description.length > 5000) {
    return { error: "Product name, category, or description exceeds the allowed length." };
  }

  if (body.is_active !== undefined && typeof body.is_active !== "boolean") {
    return { error: "Product visibility must be true or false." };
  }

  if (
    (Array.isArray(body.sizes) && (body.sizes.length > 30 || body.sizes.some((value) => typeof value !== "string" || value.length > 40))) ||
    (Array.isArray(body.colors) && (body.colors.length > 30 || body.colors.some((value) => typeof value !== "string" || value.length > 60)))
  ) {
    return { error: "Product sizes or colors contain invalid values." };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { error: "Enter a valid price greater than zero." };
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return {
      error: "Stock must be a whole number, zero or higher.",
    };
  }

  if (allImages.length === 0 || allImages.length > 8) {
    return {
      error: "A product must have between 1 and 8 images.",
    };
  }

  for (const url of allImages) {
    try {
      const parsed = new URL(url);

      if (
        !["http:", "https:"].includes(parsed.protocol) ||
        url.length > 2048
      ) {
        throw new Error("Invalid URL");
      }
    } catch {
      return {
        error: "Every product image must have a valid URL.",
      };
    }
  }

  return {
    value: {
      name,
      category,
      description: description || null,
      price,
      stock,
      sizes,
      colors,
      image_url: allImages[0],
      image_urls: allImages,
      is_active: body.is_active !== false,
    },
  };
}

// GET: Return active products for the storefront.
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("id, name, category, description, price, stock, image_url, image_urls, sizes, colors, is_active, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get products failed:", error.message);

      return NextResponse.json(
        { error: "Could not load products." },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("GET products exception:", error);

    return NextResponse.json(
      { error: "Unexpected error loading products." },
      { status: 500 }
    );
  }
}

// POST: Create a product.
export async function POST(request: Request) {
  try {
    const { supabase, response } = await getAdminClient();

    if (response) return response;

    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid product data." },
        { status: 400 }
      );
    }

    const validated = validateProduct(
      body as Record<string, unknown>
    );

    if ("error" in validated) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .insert(validated.value)
      .select("*")
      .single();

    if (error) {
      console.error("Insert product failed:", error.message);

      return NextResponse.json(
        { error: "Could not create product." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { product: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST products exception:", error);

    return NextResponse.json(
      { error: "Unexpected error creating product." },
      { status: 500 }
    );
  }
}

// PATCH: Edit a product or change its visibility.
export async function PATCH(request: Request) {
  try {
    const { supabase, response } = await getAdminClient();

    if (response) return response;

    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid product data." },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;
    const id = typeof input.id === "string" ? input.id.trim() : "";

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    // Status-only update.
    if (
      typeof input.is_active === "boolean" &&
      Object.keys(input).every((key) =>
        ["id", "is_active"].includes(key)
      )
    ) {
      const { data, error } = await supabase
        .from("products")
        .update({ is_active: input.is_active })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Status update failed:", error.message);

        return NextResponse.json(
          { error: "Could not update product status." },
          { status: 400 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: "Product not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({ product: data });
    }

    const validated = validateProduct(input);

    if ("error" in validated) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .update(validated.value)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Product update failed:", error.message);

      return NextResponse.json(
        { error: "Could not update product." },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    console.error("PATCH products exception:", error);

    return NextResponse.json(
      { error: "Unexpected error updating product." },
      { status: 500 }
    );
  }
}

// DELETE: Remove a product record.
export async function DELETE(request: Request) {
  try {
    const { supabase, response } = await getAdminClient();

    if (response) return response;

    const id = new URL(request.url).searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Delete product failed:", error.message);

      return NextResponse.json(
        { error: "Could not delete product." },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE products exception:", error);

    return NextResponse.json(
      { error: "Unexpected error deleting product." },
      { status: 500 }
    );
  }
}