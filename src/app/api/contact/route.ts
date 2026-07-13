import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact-schema";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = getAdminSupabaseClient();
  const { error } = await supabase.from("contact_submissions").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    company: parsed.data.company || null,
    message: parsed.data.message,
  });

  if (error) {
    console.error("Failed to store contact submission:", error.message);
    return NextResponse.json(
      { ok: false, errors: { message: ["Something went wrong. Please try again."] } },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
