import { NextResponse } from "next/server";
import { inquiryDetails, inquirySchema } from "@/lib/contact-schema";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);

  if (!parsed.success) {
    // A filled honeypot means a bot: answer as if it worked so it moves on.
    if (body && typeof body === "object" && "website" in body && body.website) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten((issue) => issue.message).fieldErrors },
      { status: 400 }
    );
  }

  const values = parsed.data;
  const supabase = getAdminSupabaseClient();
  const { error } = await supabase.from("contact_submissions").insert({
    inquiry_type: values.type,
    name: values.name,
    email: values.email,
    phone: values.phone || null,
    company: values.company || null,
    message: values.message,
    details: inquiryDetails(values),
    sms_consent: values.smsConsent,
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
