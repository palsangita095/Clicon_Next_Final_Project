import { createClient } from "@/lib/supabase/client";

export interface PromotionPayload {
  name: string;
  code: string;
  discount_percent?: number | null;
  discount_amount?: number | null;
  is_active: boolean;
  starts_at?: string | null;
  expires_at?: string | null;
  min_order_amount?: number | null;
  usage_limit?: number | null;
}

export async function fetchAdminPromotions() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createAdminPromotion(payload: PromotionPayload) {
  const supabase = createClient();
  const { error } = await supabase.from("promotions").insert(payload);
  if (error) throw error;
}

export async function togglePromotionActive(id: string, current: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("promotions")
    .update({ is_active: !current })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteAdminPromotion(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
