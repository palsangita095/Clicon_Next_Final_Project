import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/api/api-function/supabase.admin";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SyncProduct = {
  id: string | number;
};

type SyncCartItem = SyncProduct & {
  quantity: number;
};

function productId(id: string | number) {
  const value = String(id);
  return UUID_PATTERN.test(value) ? value : null;
}

async function getUser(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const {
    data: { user },
  } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

  return user;
}

async function syncProductTable(table: "wishlist" | "compare", userId: string, items: SyncProduct[]) {
  const supabase = getSupabaseAdmin();
  const desiredIds = items.map((item) => productId(item.id)).filter(Boolean) as string[];

  const { data: existing, error: selectError } = await supabase
    .from(table)
    .select("product_id")
    .eq("user_id", userId);

  if (selectError) throw selectError;

  const existingIds = new Set((existing ?? []).map((row: any) => String(row.product_id)));
  const removedIds = [...existingIds].filter((id) => !desiredIds.includes(id));

  if (removedIds.length) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("user_id", userId)
      .in("product_id", removedIds);

    if (error) throw error;
  }

  if (desiredIds.length) {
    const { error } = await supabase
      .from(table)
      .upsert(
        desiredIds.map((id) => ({ user_id: userId, product_id: id })),
        { onConflict: "user_id,product_id" },
      );

    if (error) throw error;
  }
}

async function syncCart(userId: string, items: SyncCartItem[]) {
  const supabase = getSupabaseAdmin();
  const desired = items
    .map((item) => ({ product_id: productId(item.id), quantity: Number(item.quantity) || 1 }))
    .filter((item) => item.product_id) as { product_id: string; quantity: number }[];

  const { data: existing, error: selectError } = await supabase
    .from("cart")
    .select("product_id")
    .eq("user_id", userId);

  if (selectError) throw selectError;

  const desiredIds = desired.map((item) => item.product_id);
  const existingIds = new Set((existing ?? []).map((row: any) => String(row.product_id)));
  const removedIds = [...existingIds].filter((id) => !desiredIds.includes(id));

  if (removedIds.length) {
    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", userId)
      .in("product_id", removedIds);

    if (error) throw error;
  }

  if (desired.length) {
    const { error } = await supabase
      .from("cart")
      .upsert(
        desired.map((item) => ({ user_id: userId, product_id: item.product_id, quantity: item.quantity })),
        { onConflict: "user_id,product_id" },
      );

    if (error) throw error;
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const cart = Array.isArray(body.cart) ? body.cart : [];
    const wishlist = Array.isArray(body.wishlist) ? body.wishlist : [];
    const compare = Array.isArray(body.compare) ? body.compare.slice(0, 4) : [];

    await Promise.all([
      syncCart(user.id, cart),
      syncProductTable("wishlist", user.id, wishlist),
      syncProductTable("compare", user.id, compare),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Storefront sync failed:", err);
    return NextResponse.json({ error: err.message || "Storefront sync failed" }, { status: 500 });
  }
}
