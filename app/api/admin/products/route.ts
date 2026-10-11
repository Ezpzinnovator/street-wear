
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify the signed-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    // Verify administrator role
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || admin?.role !== "admin") {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid product data." },
        { status: 400 }
      );
    }

    // Validate text fields
    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const category =
      typeof body.category === "string" ? body.category.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    // Main product image
    const image_url =
      typeof body.image_url === "string"
        ? body.image_url.trim()
        : "";

    // Additional product images
    const image_urls = Array.isArray(body.image_urls)
      ? body.image_urls
          .filter(
            (item: unknown) =>
              typeof item === "string" && item.trim().length > 0
          )
          .map((item: string) => item.trim())
      : [];

    const price = Number(body.price);
    const stock = Number(body.stock);

    const sizes = Array.isArray(body.sizes)
      ? body.sizes
          .filter(
            (item: unknown) =>
              typeof item === "string" && item.trim().length > 0
          )
          .map((item: string) => item.trim())
      : [];

    const colors = Array.isArray(body.colors)
      ? body.colors
          .filter(
            (item: unknown) =>
              typeof item === "string" && item.trim().length > 0
          )
          .map((item: string) => item.trim())
      : [];

    const is_active = body.is_active !== false;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Product name and category are required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Enter a valid price greater than zero." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { error: "Stock must be a whole number, zero or higher." },
        { status: 400 }
      );
    }

    // Validate image URLs
    const allImageUrls = [...new Set([image_url, ...image_urls].filter(Boolean))];

    if (allImageUrls.length > 8) {
      return NextResponse.json(
        { error: "A product can have a maximum of 8 images." },
        { status: 400 }
      );
    }

    for (const url of allImageUrls) {
      try {
        const parsedUrl = new URL(url);

        if (
          !["http:", "https:"].includes(parsedUrl.protocol) ||
          url.length > 2048
        ) {
          throw new Error("Invalid URL");
        }
      } catch {
        return NextResponse.json(
          {
            error:
              "Every image must have a valid URL starting with http:// or https://.",
          },
          { status: 400 }
        );
      }
    }

    // Insert product into Supabase
    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert({
        name,
        category,
        description: description || null,
        price,
        image_url: image_url || null,
        image_urls: allImageUrls,
        sizes,
        colors,
        stock,
        is_active,
      })
      .select("id, name, category, price, stock, is_active")
      .single();

    if (insertError) {
      console.error("Product insert error:", insertError.message);

      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);

    return NextResponse.json(
      { error: "Something went wrong while creating the product." },
      { status: 500 }
    );
  }
}
