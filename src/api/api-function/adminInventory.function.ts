import { createClient } from "@/lib/supabase/client";

export async function fetchInventoryProducts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, stock_quantity, status, image_urls, category:categories!products_category_id_fkey(name)")
    .order("stock_quantity", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((product) => ({
    ...product,
    category: Array.isArray(product.category)
      ? product.category[0] ?? null
      : product.category,
  }));
}

export async function updateProductStock(productId: string, quantity: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update({ stock_quantity: Math.max(0, quantity) })
    .eq("id", productId);

  if (error) throw new Error(error.message);
}
