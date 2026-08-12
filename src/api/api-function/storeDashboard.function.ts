import { createClient } from "@/lib/supabase/client";
import { Order, OrderStatus, Product } from "@/types/database.types";

export interface StoreDashboardData {
  salesData: Pick<Order, "total_amount" | "created_at">[];
  totalSalesValue: number;
  totalOrdersCount: number;
  totalUsersCount: number;
  outOfStockCount: number;
  latestOrders: Array<{
    id: Order["id"];
    status: OrderStatus;
    total_amount: Order["total_amount"];
    created_at: Order["created_at"];
    order_items: Array<{
      id: string;
      product_name: string;
      quantity: number;
      price_at_time: number;
      products: {
        image_urls: Product["image_urls"];
        categories: { name: string } | { name: string }[] | null;
      } | null;
    }>;
  }>;
}

export async function fetchStoreDashboardData(): Promise<StoreDashboardData> {
  const supabase = createClient();

  const [salesQuery, ordersQuery, usersQuery, outOfStockQuery, latestOrdersQuery] =
    await Promise.all([
      supabase
        .from("orders")
        .select("total_amount, created_at")
        .in("status", ["Completed", "Delivered"]),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "customer"),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .lte("stock_quantity", 0),
      supabase
        .from("orders")
        .select(
          "id, status, total_amount, created_at, order_items(id, product_name, quantity, price_at_time, products(image_urls, categories!products_category_id_fkey(name)))"
        )
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const salesData = salesQuery.data ?? [];
  const totalSalesValue =
    salesData.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) ?? 0;

  return {
    salesData,
    totalSalesValue,
    totalOrdersCount: ordersQuery.count ?? 0,
    totalUsersCount: usersQuery.count ?? 0,
    outOfStockCount: outOfStockQuery.count ?? 0,
    latestOrders: (latestOrdersQuery.data ?? []) as unknown as StoreDashboardData["latestOrders"],
  };
}