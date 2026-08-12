import { createClient } from "@/lib/supabase/client";

export async function fetchStoreSettings() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "storefront")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.value ?? null;
}

export async function saveStoreSettings(settings: Record<string, unknown>) {
  const supabase = createClient();
  const { error } = await supabase.from("site_settings").upsert({
    key: "storefront",
    value: settings,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function uploadLogo(file: File) {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const filePath = `logos/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("logos")
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("logos").getPublicUrl(filePath);

  return publicUrl;
}
