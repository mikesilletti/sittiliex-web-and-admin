import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact-schema";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // TODO(swap-in-real-provider): wire this up to a real email/CRM provider
  // (e.g. Resend, HubSpot). For now, log the confidential inquiry server-side.
  console.log("New SillettiX inquiry:", parsed.data);

  return NextResponse.json({ ok: true });
}
