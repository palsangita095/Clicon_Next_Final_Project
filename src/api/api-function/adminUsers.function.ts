import { createClient } from "@/lib/supabase/client";

export async function fetchAdminUsers() {
  const supabase = createClient();
  const { data: users, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const { data: queries } = await supabase
    .from("support_queries")
    .select("*")
    .order("created_at", { ascending: false });

  return { users: users ?? [], queries: queries ?? [] };
}

export async function updateUserAccountStatus(userId: string, newStatus: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ account_status: newStatus, is_active: newStatus === "active" })
    .eq("id", userId);

  if (error) {
    const { error: fallbackError } = await supabase
      .from("profiles")
      .update({ is_active: newStatus === "active" })
      .eq("id", userId);

    if (fallbackError) {
      throw new Error("Failed to update account status. Check admin permissions.");
    }
  }
}

export async function fetchUserDetail(userId: string) {
  const supabase = createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, status, total_amount, created_at, billing_address, order_items(id, product_name, quantity, price_at_time)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, products ( name )")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const totalSpend =
    (orders ?? []).reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) ?? 0;

  return { orders: orders ?? [], reviews: reviews ?? [], totalSpend };
}

export async function replyToSupportQuery(queryId: string, reply: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("support_queries")
    .update({ reply, status: "resolved", replied_at: new Date().toISOString() })
    .eq("id", queryId);

  if (error) throw new Error(error.message);
}
