import { createClient } from "@/lib/supabase/client";

export async function fetchAdminReviews() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, products ( name )")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data) return [];

  const userIds = [...new Set(data.map((review) => review.user_id).filter(Boolean))];

  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)
    : { data: [] };

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return data.map((review) => ({
    ...review,
    profiles: profileById.get(review.user_id) ?? null,
  }));
}

export async function moderateReview(id: string, status: "approved" | "rejected") {
  const supabase = createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ is_approved: status === "approved", moderation_status: status })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
