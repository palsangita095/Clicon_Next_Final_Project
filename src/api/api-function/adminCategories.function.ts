import { createClient } from "@/lib/supabase/client";

export async function fetchAdminCategories() {
  const supabase = createClient();
  const { data: categoryData, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  const { data: productData } = await supabase
    .from("products")
    .select("category_id");

  const counts = new Map<string, number>();
  (productData ?? []).forEach((product) => {
    if (product.category_id) {
      counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1);
    }
  });

  return (categoryData ?? []).map((category) => ({
    ...category,
    product_count: counts.get(category.id) ?? 0,
  }));
}

export async function fetchAdminTags() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCategory(name: string, imageUrl: string | null) {
  const supabase = createClient();
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { error } = await supabase.from("categories").insert({ name, slug, image_url: imageUrl });
  if (error) throw new Error(error.message);
}

export async function updateCategory(id: string, name: string, imageUrl: string | null) {
  const supabase = createClient();
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { error } = await supabase.from("categories").update({ name, slug, image_url: imageUrl }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteCategory(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createTag(name: string) {
  const supabase = createClient();
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { error } = await supabase.from("tags").insert({ name, slug });
  if (error) throw new Error(error.message);
}

export async function deleteTag(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
