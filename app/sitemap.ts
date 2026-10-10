
import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://akuraclothing.netlify.app";

  const pages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/our-story`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("id")
      .eq("is_active", true);

    if (error) {
      console.error("Sitemap product fetch error:", error.message);
      return pages;
    }

    const productPages: MetadataRoute.Sitemap = (products ?? []).map(
      (product) => ({
        url: `${baseUrl}/products/${product.id}`,
        changeFrequency: "weekly",
        priority: 0.8,
      })
    );

    return [...pages, ...productPages];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return pages;
  }
}
