import { createClient } from "@/lib/supabase/client";
import { Order, OrderItem, Profile } from "@/types/database.types";

export interface AdminOrderMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  lastWeekOrders: number;
}

export interface AdminOrderRow extends Order {
  order_items: Pick<OrderItem, "id" | "product_name" | "quantity">[];
  profile: Pick<Profile, "id" | "full_name" | "email"> | null;
}

export async function fetchAdminOrderMetrics(): Promise<AdminOrderMetrics> {
  const supabase = createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [salesQuery, ordersQuery, usersQuery, lastWeekQuery] = await Promise.all([
    supabase
      .from("orders")
      .select("total_amount")
      .in("status", ["Completed", "Delivered"]),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo),
  ]);

  const totalRevenue =
    salesQuery.data?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) ??
    0;

  return {
    totalRevenue,
    totalOrders: ordersQuery.count ?? 0,
    totalUsers: usersQuery.count ?? 0,
    lastWeekOrders: lastWeekQuery.count ?? 0,
  };
}

export async function fetchAdminOrders(): Promise<AdminOrderRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, status, total_amount, created_at, billing_address, shipping_address, payment_method, order_items(id, product_name, quantity)"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data) return [];

  const profileIds = [...new Set(data.map((order) => order.user_id).filter(Boolean))];

  const { data: profiles } = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", profileIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return data.map((order) => ({
    ...order,
    profile: profileMap.get(order.user_id) ?? null,
  })) as unknown as AdminOrderRow[];
}

export async function updateOrderStatus(orderId: string, status: Order["status"]) {
  const supabase = createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);
}

export async function updateOrderAddress(orderId: string, billingAddress: Record<string, unknown>) {
  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ billing_address: billingAddress })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
}

export async function deleteOrder(orderId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("orders").delete().eq("id", orderId);
  if (error) throw new Error(error.message);
}
