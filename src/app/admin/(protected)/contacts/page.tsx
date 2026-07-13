import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { ContactsList } from "@/components/admin/ContactsList";
import type { ContactSubmission } from "@/types/content";

export default async function AdminContactsPage() {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load contact submissions: ${error.message}`);
  const submissions = (data ?? []) as ContactSubmission[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-display-sm font-heading text-foreground">Contacts</h1>
      <p className="mt-1 text-body-sm text-foreground-muted">
        Everyone who filled the contact form. Click a row to read the message.
      </p>

      <div className="mt-8">
        <ContactsList submissions={submissions} />
      </div>
    </div>
  );
}
