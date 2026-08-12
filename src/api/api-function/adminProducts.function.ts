import { createClient } from "@/lib/supabase/client";

export interface AdminProductPayload {
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  old_price?: number | null;
  stock_quantity: number;
  category_id?: string | null;
  brand_id?: string | null;
  image_urls?: string[];
  status?: string;
  is_featured?: boolean;
  is_best_deal?: boolean;
  deal_end_time?: string | null;
  is_flash_sale?: boolean;
  is_best_seller?: boolean;
  is_top_rated?: boolean;
  discount_percentage?: number;
  warranty_info?: string | null;
  shipping_info?: string | null;
  specifications?: any;
  rating?: number | null;
}

export async function createAdminProduct(payload: AdminProductPayload) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateAdminProduct(id: string, payload: Partial<AdminProductPayload>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAdminProduct(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function fetchAdminProducts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories!products_category_id_fkey(name, slug), brand:brands!products_brand_id_fkey(name, slug)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchAdminProductsWithTags() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, stock_quantity, status, image_urls, category:categories!products_category_id_fkey(name), product_tags(tag_id)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data) return [];

  const tagIds = [
    ...new Set(
      data.flatMap((p) => (p.product_tags ?? []).map((pt) => pt.tag_id).filter(Boolean) as string[])
    ),
  ];

  const { data: tagsData } = tagIds.length
    ? await supabase.from("tags").select("id, name").in("id", tagIds)
    : { data: [] };

  const tagMap = new Map((tagsData ?? []).map((tag) => [tag.id, tag.name]));

  return data.map((p) => ({
    ...p,
    tags: (p.product_tags ?? []).map((pt) => ({
      id: pt.tag_id,
      name: tagMap.get(pt.tag_id) ?? "Tag",
    })),
  }));
}

export async function fetchAdminProductById(id: string) {
  const supabase = createClient();
  const { data: tagsData } = await supabase
    .from("tags")
    .select("id, name")
    .order("name", { ascending: true });

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories!products_category_id_fkey(name, slug), brand:brands!products_brand_id_fkey(name, slug)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);

  let selectedTagIds: string[] = [];
  if (data) {
    const { data: productTags } = await supabase
      .from("product_tags")
      .select("tag_id")
      .eq("product_id", id);
    selectedTagIds = (productTags ?? []).map((pt) => pt.tag_id);
  }

  return { product: data, allTags: tagsData ?? [], selectedTagIds };
}

export async function fetchAllTags() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createProductTag(name: string) {
  const supabase = createClient();
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { data, error } = await supabase
    .from("tags")
    .insert({ name, slug })
    .select("id, name")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function syncProductTags(productId: string, tagIds: string[]) {
  const supabase = createClient();
  const { error } = await supabase
    .from("product_tags")
    .delete()
    .eq("product_id", productId);

  if (error) throw new Error(error.message);

  if (tagIds.length > 0) {
    const { error: insertError } = await supabase.from("product_tags").insert(
      tagIds.map((tagId) => ({ product_id: productId, tag_id: tagId }))
    );
    if (insertError) throw new Error(insertError.message);
  }
}

export async function removeProductTag(productId: string, tagId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("product_tags")
    .delete()
    .eq("product_id", productId)
    .eq("tag_id", tagId);

  if (error) throw new Error(error.message);
}

export interface ProductOrderRow {
  id: string;
  customer: string;
  avatar: string;
  qty: number;
  date: string;
  revenue: string;
  profit: string;
  status: string;
}

export async function fetchProductOrders(productId: string): Promise<ProductOrderRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, status, total_amount, created_at, order_items!inner(id, product_id, quantity, price_at_time, product_name)"
    )
    .eq("order_items.product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return [];

  const profileIds = [...new Set(data.map((order) => order.user_id).filter(Boolean))];

  const { data: profiles } = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", profileIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return data.map((order) => {
    const items = (order.order_items ?? []).filter((item: any) => item.product_id === productId);
    const qty = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0);
    const revenue = items.reduce(
      (sum: number, item: any) => sum + (Number(item.quantity) || 0) * (Number(item.price_at_time) || 0),
      0
    );
    const profile = profileMap.get(order.user_id);
    const customerName = profile?.full_name || profile?.email || "Guest";
    const shortId = `#${String(order.id).split("-")[0].toUpperCase()}`;

    return {
      id: shortId,
      customer: customerName,
      avatar: customerName,
      qty,
      date: new Date(order.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      revenue: `₹${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      profit: "—",
      status: order.status,
    };
  });
}

export interface RevenuePoint {
  name: string;
  value: number;
}

export async function fetchProductRevenueTrend(productId: string, days = 30): Promise<RevenuePoint[]> {
  const supabase = createClient();

  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("orders")
    .select("created_at, order_items!inner(id, product_id, quantity, price_at_time)")
    .eq("order_items.product_id", productId)
    .in("status", ["Pending", "Processing", "Shipping", "Delivered", "Completed"])
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const revenueByDay = new Map<string, number>();
  (data ?? []).forEach((order) => {
    const items = (order.order_items ?? []).filter((item: any) => item.product_id === productId);
    const dayRevenue = items.reduce(
      (sum: number, item: any) => sum + (Number(item.quantity) || 0) * (Number(item.price_at_time) || 0),
      0
    );
    const dayKey = new Date(order.created_at).toLocaleDateString("en-US");
    revenueByDay.set(dayKey, (revenueByDay.get(dayKey) ?? 0) + dayRevenue);
  });

  const points: RevenuePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    points.push({
      name: String(d.getDate()),
      value: revenueByDay.get(d.toLocaleDateString("en-US")) ?? 0,
    });
  }
  return points;
}

export async function fetchCategoryOptions() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function uploadStoreImage(file: File, folder = "products") {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${ext}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("product_images")
    .upload(filePath, file);

  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("product_images").getPublicUrl(filePath);

  return publicUrl;
}
