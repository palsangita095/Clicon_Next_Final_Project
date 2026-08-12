import { createClient } from "@/lib/supabase/client";

export async function fetchBrandsWithCounts() {
  const supabase = createClient();
  const { data: brandData, error } = await supabase
    .from("brands")
    .select("id, name, slug, category_id, brand_categories(categories(name))")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  const { data: productData } = await supabase
    .from("products")
    .select("brand_id");

  const counts = new Map<string, number>();
  (productData ?? []).forEach((product) => {
    if (product.brand_id) {
      counts.set(product.brand_id, (counts.get(product.brand_id) ?? 0) + 1);
    }
  });

  return (brandData ?? []).map((brand: any) => ({
    ...brand,
    categories: ((brand.brand_categories ?? []) as any[])
      .map((bc: any) => bc.categories?.name)
      .filter(Boolean) as string[],
    category:
      Array.isArray(brand.category) ? brand.category[0] ?? null : brand.category,
    product_count: counts.get(brand.id) ?? 0,
  }));
}

export async function deleteBrand(brandId: string) {
  const supabase = createClient();
  await supabase.from("products").update({ brand_id: null }).eq("brand_id", brandId);

  const { error } = await supabase.from("brands").delete().eq("id", brandId);
  if (error) throw new Error(error.message);
}
