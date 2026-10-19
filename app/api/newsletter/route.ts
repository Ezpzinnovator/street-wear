import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const emailValue =
    body && typeof body === "object" && "email" in body
      ? (body as { email?: unknown }).email
      : null;

  if (typeof emailValue !== "string") {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = emailValue.trim().toLowerCase();

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, source: "website_footer" });

    if (error?.code === "23505") {
      // Avoid revealing whether an address is already on the list.
      return NextResponse.json({
        message: "You're on the list. Keep an eye out for Akura updates.",
      });
    }

    if (error) {
      console.error("Newsletter signup failed:", error.code);
      return NextResponse.json(
        { error: "We couldn't save your signup right now. Please try again shortly." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "You're in! Watch your inbox for Akura updates.",
    });
  } catch {
    console.error("Newsletter signup request failed.");
    return NextResponse.json(
      { error: "We couldn't save your signup right now. Please try again shortly." },
      { status: 500 }
    );
  }
}
