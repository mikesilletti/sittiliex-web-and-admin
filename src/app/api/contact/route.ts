import { NextResponse } from "next/server";
import { inquiryDetails, inquirySchema } from "@/lib/contact-schema";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { syncInquiryToGhl } from "@/lib/ghl";

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
  const { data: row, error } = await supabase.from("contact_submissions").insert({
    inquiry_type: values.type,
    name: values.name,
    email: values.email,
    phone: values.phone || null,
    company: values.company || null,
    message: values.message,
    details: inquiryDetails(values),
    sms_consent: values.smsConsent,
  }).select("id").single();

  if (error) {
    console.error("Failed to store contact submission:", error.message);
    return NextResponse.json(
      { ok: false, errors: { message: ["Something went wrong. Please try again."] } },
      { status: 500 }
    );
  }

  // The lead is already safe in Supabase; a GHL failure is recorded on the row
  // (and visible in the admin inbox) rather than shown to the visitor.
  const ghl = await syncInquiryToGhl(values);
  if (ghl.error) console.error("GHL sync problem:", ghl.error);
  await supabase
    .from("contact_submissions")
    .update({
      ghl_contact_id: ghl.contactId,
      ghl_error: ghl.error,
      ghl_synced_at: ghl.contactId ? new Date().toISOString() : null,
    })
    .eq("id", row.id);

  return NextResponse.json({ ok: true });
}
