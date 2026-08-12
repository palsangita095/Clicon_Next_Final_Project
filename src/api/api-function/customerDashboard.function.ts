import { supabase } from "@/lib/supabase.config";


export const getShipmentStatusCounts = async (customerId: string) => {
  const { data, error } = await supabase
    .from("shipments")
    .select("status")
    .eq("customer_id", customerId);

  if (error) throw error;

  const counts: Record<string, number> = {};
  data.forEach((row) => {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  });

  return counts;
};


export const getMonthlyShipmentTrend = async (customerId: string) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const { data, error } = await supabase
    .from("shipments")
    .select("created_at")
    .eq("customer_id", customerId)
    .gte("created_at", sixMonthsAgo.toISOString());

  if (error) throw error;
  return data;
};


export const getMonthlySpendTrend = async (customerId: string) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const { data, error } = await supabase
    .from("shipments")
    .select("created_at, estimated_cost")
    .eq("customer_id", customerId)
    .gte("created_at", sixMonthsAgo.toISOString());

  if (error) throw error;
  return data;
};


export const getRecentShipments = async (customerId: string) => {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  return data;
};


export const getCustomerStats = async (customerId: string) => {
  const { data, error } = await supabase
    .from("shipments")
    .select("status, estimated_cost")
    .eq("customer_id", customerId);

  if (error) throw error;

  const total = data.length;
  const inTransit = data.filter(
    (s) => s.status === "in_transit" || s.status === "out_for_delivery",
  ).length;
  const completed = data.filter((s) => s.status === "completed").length;
  const totalSpent = data.reduce((sum, s) => sum + (s.estimated_cost ?? 0), 0);

  return { total, inTransit, completed, totalSpent };
};
