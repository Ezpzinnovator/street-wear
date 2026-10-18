import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      supabase,
      response: NextResponse.json({ error: "You must be logged in." }, { status: 401 }),
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
      response: NextResponse.json({ error: "Administrator access required." }, { status: 403 }),
    };
  }

  return { supabase, response: null };
}

function matchesImageSignature(type: string, bytes: Uint8Array) {
  if (type === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/png") {
    return bytes.length >= 8 &&
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e &&
      bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a &&
      bytes[6] === 0x1a && bytes[7] === 0x0a;
  }
  if (type === "image/webp") {
    return bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const { supabase, response } = await requireAdmin();
    if (response) return response;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
    }

    const extension = MIME_EXTENSIONS[file.type];
    if (!extension) {
      return NextResponse.json({ error: "Use JPG, PNG, or WebP images only." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Images must be between 1 byte and 5 MB." }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesImageSignature(file.type, bytes)) {
      return NextResponse.json({ error: "The file contents do not match a supported image type." }, { status: 400 });
    }

    const path = `${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, bytes, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Product image upload failed:", uploadError.message);
      return NextResponse.json(
        { error: "Image upload failed. Check the product-images bucket and its storage policies." },
        { status: 400 }
      );
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return NextResponse.json({ path, url: data.publicUrl }, { status: 201 });
  } catch (error) {
    console.error("Product image upload exception:", error);
    return NextResponse.json({ error: "Unexpected error uploading image." }, { status: 500 });
  }
}
