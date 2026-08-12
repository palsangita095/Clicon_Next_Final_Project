import { createClient } from "@/lib/supabase/client";
import { fixImageUrl } from "@/lib/imageFallback";

export interface ProductFilters {
  categoryId?: string;
  categorySlug?: string;
  isFeatured?: boolean;
  isBestDeal?: boolean;
  isFlashSale?: boolean;
  isBestSeller?: boolean;
  isTopRated?: boolean;
  limit?: number;
  search?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  orderBy?: "created_at" | "price" | "sales_count" | "rating" | "name";
  orderDirection?: "asc" | "desc";
}

export async function fetchProducts(filters: ProductFilters = {}) {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select("*, category:categories!products_category_id_fkey(id, name, slug)")
    .eq("status", "active");

  if (filters.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .ilike("slug", filters.categorySlug)
      .maybeSingle();

    if (category?.id) {
      query = query.eq("category_id", category.id);
    }
  } else if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters.brandId) {
    query = query.eq("brand_id", filters.brandId);
  }

  if (filters.isFeatured !== undefined) {
    query = query.eq("is_featured", filters.isFeatured);
  }

  if (filters.isBestDeal !== undefined) {
    query = query.eq("is_best_deal", filters.isBestDeal);
  }

  if (filters.isFlashSale !== undefined) {
    query = query.eq("is_flash_sale", filters.isFlashSale);
  }

  if (filters.isBestSeller !== undefined) {
    query = query.eq("is_best_seller", filters.isBestSeller);
  }

  if (filters.isTopRated !== undefined) {
    query = query.eq("is_top_rated", filters.isTopRated);
  }

  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.minRating !== undefined) {
    query = query.gte("rating", filters.minRating);
  }

  if (filters.search && filters.search.trim() !== "") {
    const searchTerm = `%${filters.search.trim()}%`;

    const { data: matchedTags } = await supabase
      .from("tags")
      .select("id")
      .ilike("name", searchTerm);

    let tagProductIds: string[] = [];
    if (matchedTags && matchedTags.length > 0) {
      const { data: productTagRows } = await supabase
        .from("product_tags")
        .select("product_id")
        .in("tag_id", matchedTags.map((t) => t.id));
      tagProductIds = (productTagRows ?? []).map((row) => row.product_id);
    }

    if (tagProductIds.length > 0) {
      query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},id.in.(${tagProductIds.join(",")})`);
    } else {
      query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }
  }

  const orderBy = filters.orderBy || "created_at";
  const orderDirection = filters.orderDirection || "desc";
  query = query.order(orderBy, { ascending: orderDirection === "asc" });

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) {
    return [];
  }

  return attachReviewStats(data || []);
}

export async function attachReviewStats(products: any[]) {
  if (!products || products.length === 0) return products || [];

  const supabase = createClient();
  const ids = products.map((p) => p.id);
  const { data: reviews } = await supabase
    .from("reviews")
    .select("product_id, rating")
    .eq("is_approved", true)
    .in("product_id", ids);

  const stats = new Map<string, { sum: number; count: number }>();
  (reviews ?? []).forEach((r) => {
    const cur = stats.get(r.product_id) || { sum: 0, count: 0 };
    cur.sum += Number(r.rating) || 0;
    cur.count += 1;
    stats.set(r.product_id, cur);
  });

  return products.map((p) => {
    const s = stats.get(p.id);
    const rating = s ? Math.round((s.sum / s.count) * 10) / 10 : 0;
    return { ...p, rating, review_count: s?.count ?? 0 };
  });
}

export async function fetchBestDealsProducts() {
  const supabase = createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories!products_category_id_fkey(id, name, slug)")
    .eq("status", "active")
    .eq("is_best_deal", true)
    .gt("deal_end_time", now)
    .order("deal_end_time", { ascending: true })
    .limit(10);

  if (error || !data || data.length === 0) {
    const { data: fallbackData } = await supabase
      .from("products")
      .select("*, category:categories!products_category_id_fkey(id, name, slug)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10);
    return attachReviewStats(fallbackData || []);
  }

  return attachReviewStats(data);
}

export async function fetchCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return [];
  }
  return data || [];
}

export async function fetchBrandsByCategory(categoryId?: string) {
  try {
    const supabase = createClient();
    let query = supabase.from("brands").select("*");
    if (categoryId) {
      query = query.eq("brand_categories.category_id", categoryId);
    }
    const { data, error } = await query.order("name", { ascending: true });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function fetchPromotionalBanners(section?: string) {
  try {
    const supabase = createClient();
    let query = supabase.from("promotional_banners").select("*");
    if (section) {
      query = query.eq("section", section);
    }
    const { data, error } = await query;
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export interface ShopProductCard {
  id: string;
  name: string;
  price: number;
  originalPrice: number | undefined;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  categorySlug: string;
  brand: string | undefined;
  tags: string[];
}

export interface ShopPageData {
  products: ShopProductCard[];
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  priceMax: number;
}

export async function fetchShopPageData(): Promise<ShopPageData> {
  const supabase = createClient();

  const [catQuery, brandQuery, prodQuery] = await Promise.all([
    supabase.from("categories").select("id, name").order("name", { ascending: true }),
    supabase.from("brands").select("id, name").order("name", { ascending: true }),
    supabase
      .from("products")
      .select(`
        id,
        name,
        price,
        old_price,
        image_urls,
        category_id,
        categories!products_category_id_fkey (name, slug),
        brands!products_brand_id_fkey (name)
      `)
      .eq("status", "active"),
  ]);

  const prodData = prodQuery.data ?? [];
  const categories = (catQuery.data ?? []) as { id: string; name: string }[];

  if (prodData.length === 0) {
    return {
      products: [],
      categories,
      brands: (brandQuery.data ?? []) as { id: string; name: string }[],
      priceMax: 5000,
    };
  }

  const productIds = prodData.map((p) => p.id);

  const [reviewQuery, tagQuery, productTagQuery] = await Promise.all([
    supabase
      .from("reviews")
      .select("product_id, rating")
      .eq("is_approved", true)
      .in("product_id", productIds),
    supabase.from("tags").select("id, name"),
    supabase.from("product_tags").select("product_id, tag_id").in("product_id", productIds),
  ]);

  const reviewStats = new Map<string, { sum: number; count: number }>();
  (reviewQuery.data ?? []).forEach((r) => {
    const cur = reviewStats.get(r.product_id) || { sum: 0, count: 0 };
    cur.sum += Number(r.rating) || 0;
    cur.count += 1;
    reviewStats.set(r.product_id, cur);
  });

  const tagNameById = new Map<string, string>(
    (tagQuery.data ?? []).map((t) => [t.id, t.name]),
  );
  const tagsByProduct = new Map<string, string[]>();
  (productTagQuery.data ?? []).forEach((pt) => {
    const name = tagNameById.get(pt.tag_id);
    if (name) {
      const arr = tagsByProduct.get(pt.product_id) || [];
      arr.push(name);
      tagsByProduct.set(pt.product_id, arr);
    }
  });

  const products: ShopProductCard[] = prodData.map((p) => {
    const stats = reviewStats.get(p.id);
    const cat = Array.isArray(p.categories) ? p.categories[0] : p.categories;
    const br = Array.isArray(p.brands) ? p.brands[0] : p.brands;
    return {
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.old_price ?? undefined,
      rating: stats ? Math.round((stats.sum / stats.count) * 10) / 10 : 0,
      reviewCount: stats?.count ?? 0,
      image: fixImageUrl(p.image_urls?.[0], p.name),
      category: cat?.name ?? "Uncategorized",
      categorySlug: cat?.slug ?? "",
      brand: br?.name ?? undefined,
      tags: tagsByProduct.get(p.id) ?? [],
    };
  });

  const priceMax = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 5000;

  return {
    products,
    categories,
    brands: (brandQuery.data ?? []) as { id: string; name: string }[],
    priceMax,
  };
}
