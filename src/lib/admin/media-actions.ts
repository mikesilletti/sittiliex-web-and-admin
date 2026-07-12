"use server";

import { requireAdminSession } from "@/lib/auth/require-admin";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadMedia(formData: FormData): Promise<{ url: string | null; error: string | null }> {
  await requireAdminSession();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { url: null, error: "No file provided." };
  }
  if (!file.type.startsWith("image/")) {
    return { url: null, error: "Only image files are supported." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { url: null, error: "Image must be under 5MB." };
  }

  const supabase = getAdminSupabaseClient();
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("site-media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { url: null, error: error.message };

  const { data } = supabase.storage.from("site-media").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
