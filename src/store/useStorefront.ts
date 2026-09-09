import { create } from 'zustand';
import { supabase } from '@/lib/supabase.config';
import {
  setGuestCart,
  setGuestWishlist,
  setGuestCompare,
  clearAllGuestData,
  getAllGuestData,
  migrateGuestDataToServer,
} from '@/lib/guestStorage';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface StorefrontState {
  cart: CartItem[];
  wishlist: Product[];
  compareItems: Product[];
  isGuestMode: boolean;
  setGuestMode: (isGuest: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string | number) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string | number) => boolean;
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string | number) => void;
  clearCompare: () => void;
  isInCompare: (productId: string | number) => boolean;
  reset: () => void;
  rehydrate: () => Promise<void>;
  loadGuestData: () => void;
  clearGuestData: () => void;
  syncGuestToSupabase: () => Promise<void>;
}


async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}


let dbWriteQueue: Promise<void> = Promise.resolve();
function enqueueDbWrite(task: () => Promise<void>): void {
  dbWriteQueue = dbWriteQueue.then(task).catch((err) => {
    console.error("storefront db sync failed:", err);
  });
}

const toProduct = (row: any): Product | null => {
  const p = row.products;
  if (!p) return null;
  return { id: p.id, name: p.name, price: Number(p.price), image: p.image_urls?.[0] ?? "" };
}

function isAccessBlocked(error: any) {
  return error?.code === "42501" || error?.message?.includes("403") || error?.status === 403;
}

function productId(id: string | number) {
  const value = String(id);
  return UUID_PATTERN.test(value) ? value : null;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function persistStorefrontViaApi() {
  const headers = await getAuthHeader();
  if (!headers.Authorization) return;

  const state = useStorefront.getState();
  const res = await fetch("/api/storefront/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      cart: state.cart,
      wishlist: state.wishlist,
      compare: state.compareItems,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Storefront API sync failed");
  }
}

async function persistCartToDb(cartItems?: CartItem[]) {
  const state = useStorefront.getState();
  if (state.isGuestMode) return;
  
  const cart = cartItems ?? state.cart;
  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    const { data: existing, error: selectError } = await supabase
      .from("cart")
      .select("product_id")
      .eq("user_id", userId);
    
    if (selectError) {
      if (isAccessBlocked(selectError)) {
        console.warn("Cart access blocked by RLS, skipping persist");
        await persistStorefrontViaApi();
        return;
      }
      throw selectError;
    }
    
    const existingIds = new Set((existing ?? []).map((row: any) => String(row.product_id)));
    const desired = cart
      .map((item) => ({ productId: productId(item.id), quantity: item.quantity }))
      .filter((item) => item.productId) as { productId: string; quantity: number }[];

    const removedIds = [...existingIds].filter(
      (id) => !desired.some((d) => d.productId === id)
    );
    if (removedIds.length) {
      const { error: deleteError } = await supabase
        .from("cart")
        .delete()
        .eq("user_id", userId)
        .in("product_id", removedIds);
      
      if (deleteError && isAccessBlocked(deleteError)) {
        console.warn("Cart delete blocked by RLS, skipping persist");
        await persistStorefrontViaApi();
        return;
      }
    }
    
    for (const item of desired) {
      const { error: upsertError } = await supabase
        .from("cart")
        .upsert(
          { user_id: userId, product_id: item.productId, quantity: item.quantity },
          { onConflict: "user_id,product_id" }
        );
      
      if (upsertError && isAccessBlocked(upsertError)) {
        console.warn("Cart upsert blocked by RLS, skipping persist");
        await persistStorefrontViaApi();
        return;
      }
    }
  } catch (err: any) {
    if (isAccessBlocked(err)) {
      console.warn("Cart persist blocked by RLS:", err.message);
    } else {
      console.error("Cart persist failed:", err);
    }
    throw err;
  }
}

async function persistWishlistToDb(wishlistItems?: Product[]) {
  const state = useStorefront.getState();
  if (state.isGuestMode) return;
  
  const wishlist = wishlistItems ?? state.wishlist;
  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    const { data: existing, error: selectError } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", userId);
    
    if (selectError) {
      if (isAccessBlocked(selectError)) {
        console.warn("Wishlist access blocked by RLS, skipping persist");
        await persistStorefrontViaApi();
        return;
      }
      throw selectError;
    }
    
    const existingIds = new Set((existing ?? []).map((row: any) => String(row.product_id)));
    const desiredIds = wishlist.map((item) => productId(item.id)).filter(Boolean) as string[];

    const removedIds = [...existingIds].filter((id) => !desiredIds.includes(id));
    if (removedIds.length) {
      const { error: deleteError } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", userId)
        .in("product_id", removedIds);
      
      if (deleteError && isAccessBlocked(deleteError)) {
        console.warn("Wishlist delete blocked by RLS, skipping persist");
        await persistStorefrontViaApi();
        return;
      }
    }
    
    for (const productId of desiredIds) {
      const { error: upsertError } = await supabase
        .from("wishlist")
        .upsert(
          { user_id: userId, product_id: productId },
          { onConflict: "user_id,product_id" }
        );
      
      if (upsertError && isAccessBlocked(upsertError)) {
        console.warn("Wishlist upsert blocked by RLS, skipping persist");
        await persistStorefrontViaApi();
        return;
      }
    }
  } catch (err: any) {
    if (isAccessBlocked(err)) {
      console.warn("Wishlist persist blocked by RLS:", err.message);
    } else {
      console.error("Wishlist persist failed:", err);
    }
    throw err;
  }
}

async function persistCompareToDb(compareItems?: Product[]) {
  const state = useStorefront.getState();
  if (state.isGuestMode) return;
  
  const compare = compareItems ?? state.compareItems;
  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    const { data: existing, error: selectError } = await supabase
      .from("compare")
      .select("product_id")
      .eq("user_id", userId);
    
    if (selectError) {
      if (isAccessBlocked(selectError)) {
        console.warn("Compare access blocked by RLS, skipping persist");
        await persistStorefrontViaApi();
        return;
      }
      throw selectError;
    }
    
    const existingIds = new Set((existing ?? []).map((row: any) => String(row.product_id)));
    const desiredIds = compare.map((item) => productId(item.id)).filter(Boolean) as string[];

    const removedIds = [...existingIds].filter((id) => !desiredIds.includes(id));
    if (removedIds.length) {
      const { error: deleteError } = await supabase
        .from("compare")
        .delete()
        .eq("user_id", userId)
        .in("product_id", removedIds);
      
      if (deleteError && isAccessBlocked(deleteError)) {
        console.warn("Compare delete blocked by RLS, skipping persist");
        await persistStorefrontViaApi();
        return;
      }
    }
    
    for (const productId of desiredIds) {
      const { error: upsertError } = await supabase
        .from("compare")
        .upsert(
          { user_id: userId, product_id: productId },
          { onConflict: "user_id,product_id" }
        );
      
      if (upsertError && isAccessBlocked(upsertError)) {
        console.warn("Compare upsert blocked by RLS, skipping persist");
        await persistStorefrontViaApi();
        return;
      }
    }
  } catch (err: any) {
    if (isAccessBlocked(err)) {
      console.warn("Compare persist blocked by RLS:", err.message);
    } else {
      console.error("Compare persist failed:", err);
    }
    throw err;
  }
}

function persistToStorage(getter: () => { cart: CartItem[]; wishlist: Product[]; compareItems: Product[] }) {
  const { cart, wishlist, compareItems } = getter();
  setGuestCart(cart);
  setGuestWishlist(wishlist);
  setGuestCompare(compareItems);
}

export const useStorefront = create<StorefrontState>()((set, get) => ({
  cart: [],
  wishlist: [],
  compareItems: [],
  isGuestMode: true,

  setGuestMode: (isGuest: boolean) => set({ isGuestMode: isGuest }),

  loadGuestData: () => {
    const guestData = getAllGuestData();
    set({
      cart: guestData.cart,
      wishlist: guestData.wishlist,
      compareItems: guestData.compare,
      isGuestMode: true,
    });
  },

  clearGuestData: () => {
    clearAllGuestData();
  },

  rehydrate: async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        get().loadGuestData();
        return;
      }

      const [cartRes, wishlistRes, compareRes] = await Promise.all([
        supabase
          .from("cart")
          .select("product_id, quantity, products(id, name, price, image_urls)")
          .eq("user_id", userId),
        supabase
          .from("wishlist")
          .select("product_id, products(id, name, price, image_urls)")
          .eq("user_id", userId),
        supabase
          .from("compare")
          .select("product_id, products(id, name, price, image_urls)")
          .eq("user_id", userId),
      ]);

      const serverCart = (cartRes.data ?? [])
        .map((row: any) => {
          const product = toProduct(row);
          return product ? { ...product, quantity: row.quantity } : null;
        })
        .filter((item: CartItem | null): item is CartItem => item !== null);

      const serverWishlist = (wishlistRes.data ?? [])
        .map((row: any) => toProduct(row))
        .filter((item: Product | null): item is Product => item !== null);

      const serverCompare = (compareRes.data ?? [])
        .map((row: any) => toProduct(row))
        .filter((item: Product | null): item is Product => item !== null);

      const merged = migrateGuestDataToServer(serverCart, serverWishlist, serverCompare);

      set({
        cart: merged.cart,
        wishlist: merged.wishlist,
        compareItems: merged.compare,
        isGuestMode: false,
      });

      await Promise.all([
        persistCartToDb(merged.cart),
        persistWishlistToDb(merged.wishlist),
        persistCompareToDb(merged.compare),
      ]);

      clearAllGuestData();
    } catch (err) {
      console.error("Storefront rehydrate failed:", err);
      get().loadGuestData();
    }
  },

  syncGuestToSupabase: async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return;

      const [cartRes, wishlistRes, compareRes] = await Promise.all([
        supabase
          .from("cart")
          .select("product_id, quantity, products(id, name, price, image_urls)")
          .eq("user_id", userId),
        supabase
          .from("wishlist")
          .select("product_id, products(id, name, price, image_urls)")
          .eq("user_id", userId),
        supabase
          .from("compare")
          .select("product_id, products(id, name, price, image_urls)")
          .eq("user_id", userId),
      ]);

      const serverCart = (cartRes.data ?? [])
        .map((row: any) => {
          const product = toProduct(row);
          return product ? { ...product, quantity: row.quantity } : null;
        })
        .filter((item: CartItem | null): item is CartItem => item !== null);

      const serverWishlist = (wishlistRes.data ?? [])
        .map((row: any) => toProduct(row))
        .filter((item: Product | null): item is Product => item !== null);

      const serverCompare = (compareRes.data ?? [])
        .map((row: any) => toProduct(row))
        .filter((item: Product | null): item is Product => item !== null);

      const merged = migrateGuestDataToServer(serverCart, serverWishlist, serverCompare);

      set({
        cart: merged.cart,
        wishlist: merged.wishlist,
        compareItems: merged.compare,
        isGuestMode: false,
      });

      await Promise.all([
        persistCartToDb(merged.cart),
        persistWishlistToDb(merged.wishlist),
        persistCompareToDb(merged.compare),
      ]);

      clearAllGuestData();
    } catch (err) {
      console.error("Guest sync to Supabase failed:", err);
    }
  },

  addToCart: (product, quantity = 1) => {
    const isGuest = get().isGuestMode;
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return { cart: [...state.cart, { ...product, quantity }] };
    });
    if (isGuest) {
      persistToStorage(get);
    } else {
      enqueueDbWrite(persistCartToDb);
    }
  },

  removeFromCart: (productId) => {
    const isGuest = get().isGuestMode;
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    }));
    if (isGuest) {
      persistToStorage(get);
    } else {
      enqueueDbWrite(persistCartToDb);
    }
  },

  updateQuantity: (productId, quantity) => {
    const isGuest = get().isGuestMode;
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    }));
    if (isGuest) {
      persistToStorage(get);
    } else {
      enqueueDbWrite(persistCartToDb);
    }
  },

  clearCart: () => {
    const isGuest = get().isGuestMode;
    set({ cart: [] });
    if (isGuest) {
      persistToStorage(get);
    } else {
      enqueueDbWrite(persistCartToDb);
    }
  },

  addToWishlist: (product) => {
    const isGuest = get().isGuestMode;
    set((state) => {
      if (state.wishlist.find((item) => item.id === product.id)) {
        return state;
      }
      return { wishlist: [...state.wishlist, product] };
    });
    if (isGuest) {
      persistToStorage(get);
    } else {
      enqueueDbWrite(persistWishlistToDb);
    }
  },

  removeFromWishlist: (productId) => {
    const isGuest = get().isGuestMode;
    set((state) => ({
      wishlist: state.wishlist.filter((item) => item.id !== productId),
    }));
    if (isGuest) {
      persistToStorage(get);
    } else {
      enqueueDbWrite(persistWishlistToDb);
    }
  },

  clearWishlist: () => {
    const isGuest = get().isGuestMode;
    set({ wishlist: [] });
    if (isGuest) {
      persistToStorage(get);
    } else {
      enqueueDbWrite(persistWishlistToDb);
    }
  },

  isInWishlist: (productId) => {
    return get().wishlist.some((item) => item.id === productId);
  },

  addToCompare: (product) => {
    const isGuest = get().isGuestMode;
    const current = get().compareItems;
    if (current.some((item) => String(item.id) === String(product.id))) {
      return true;
    }
    if (current.length >= 4) {
      return false;
    }
    set({ compareItems: [...current, product] });
    if (isGuest) {
      persistToStorage(get);
    } else {
      enqueueDbWrite(persistCompareToDb);
    }
    return true;
  },

  removeFromCompare: (productId) => {
    const isGuest = get().isGuestMode;
    set((state) => ({
      compareItems: state.compareItems.filter((item) => item.id !== productId),
    }));
    if (isGuest) {
      persistToStorage(get);
    } else {
      enqueueDbWrite(persistCompareToDb);
    }
  },

  clearCompare: () => {
    const isGuest = get().isGuestMode;
    set({ compareItems: [] });
    if (isGuest) {
      persistToStorage(get);
    } else {
      enqueueDbWrite(persistCompareToDb);
    }
  },

  isInCompare: (productId) => {
    return get().compareItems.some((item) => item.id === productId);
  },

  reset: () => {
    set({ cart: [], wishlist: [], compareItems: [], isGuestMode: true });
  },
}));
