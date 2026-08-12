import { create } from 'zustand';
import { supabase } from '@/lib/supabase.config';

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
};

async function persistCartToDb() {
  const { cart } = useStorefront.getState();
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { data: existing } = await supabase
    .from("cart")
    .select("product_id")
    .eq("user_id", userId);
  const existingIds = new Set((existing ?? []).map((row: any) => String(row.product_id)));
  const desired = cart.map((item) => ({ productId: String(item.id), quantity: item.quantity }));

  const removedIds = [...existingIds].filter(
    (id) => !desired.some((d) => d.productId === id)
  );
  if (removedIds.length) {
    await supabase
      .from("cart")
      .delete()
      .eq("user_id", userId)
      .in("product_id", removedIds);
  }
  for (const item of desired) {
    await supabase
      .from("cart")
      .upsert(
        { user_id: userId, product_id: item.productId, quantity: item.quantity },
        { onConflict: "user_id,product_id" }
      );
  }
}

async function persistWishlistToDb() {
  const { wishlist } = useStorefront.getState();
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { data: existing } = await supabase
    .from("wishlist")
    .select("product_id")
    .eq("user_id", userId);
  const existingIds = new Set((existing ?? []).map((row: any) => String(row.product_id)));
  const desiredIds = wishlist.map((item) => String(item.id));

  const removedIds = [...existingIds].filter((id) => !desiredIds.includes(id));
  if (removedIds.length) {
    await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", userId)
      .in("product_id", removedIds);
  }
  for (const productId of desiredIds) {
    await supabase
      .from("wishlist")
      .upsert(
        { user_id: userId, product_id: productId },
        { onConflict: "user_id,product_id" }
      );
  }
}

async function persistCompareToDb() {
  const { compareItems } = useStorefront.getState();
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { data: existing } = await supabase
    .from("compare")
    .select("product_id")
    .eq("user_id", userId);
  const existingIds = new Set((existing ?? []).map((row: any) => String(row.product_id)));
  const desiredIds = compareItems.map((item) => String(item.id));

  const removedIds = [...existingIds].filter((id) => !desiredIds.includes(id));
  if (removedIds.length) {
    await supabase
      .from("compare")
      .delete()
      .eq("user_id", userId)
      .in("product_id", removedIds);
  }
  for (const productId of desiredIds) {
    await supabase
      .from("compare")
      .upsert(
        { user_id: userId, product_id: productId },
        { onConflict: "user_id,product_id" }
      );
  }
}

export const useStorefront = create<StorefrontState>()((set, get) => ({
  cart: [],
  wishlist: [],
  compareItems: [],

  rehydrate: async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        set({ cart: [], wishlist: [], compareItems: [] });
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

      const cartItems = (cartRes.data ?? [])
        .map((row: any) => {
          const product = toProduct(row);
          return product ? { ...product, quantity: row.quantity } : null;
        })
        .filter((item: CartItem | null): item is CartItem => item !== null);

      const wishlistItems = (wishlistRes.data ?? [])
        .map((row: any) => toProduct(row))
        .filter((item: Product | null): item is Product => item !== null);

      const compareItems = (compareRes.data ?? [])
        .map((row: any) => toProduct(row))
        .filter((item: Product | null): item is Product => item !== null);

      set({ cart: cartItems, wishlist: wishlistItems, compareItems });
    } catch (err) {
      console.error("Storefront rehydrate failed:", err);
    }
  },

  addToCart: (product, quantity = 1) => {
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
    enqueueDbWrite(persistCartToDb);
  },

  removeFromCart: (productId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    }));
    enqueueDbWrite(persistCartToDb);
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    }));
    enqueueDbWrite(persistCartToDb);
  },

  clearCart: () => {
    set({ cart: [] });
    enqueueDbWrite(persistCartToDb);
  },

  addToWishlist: (product) => {
    set((state) => {
      if (state.wishlist.find((item) => item.id === product.id)) {
        return state;
      }
      return { wishlist: [...state.wishlist, product] };
    });
    enqueueDbWrite(persistWishlistToDb);
  },

  removeFromWishlist: (productId) => {
    set((state) => ({
      wishlist: state.wishlist.filter((item) => item.id !== productId),
    }));
    enqueueDbWrite(persistWishlistToDb);
  },

  clearWishlist: () => {
    set({ wishlist: [] });
    enqueueDbWrite(persistWishlistToDb);
  },

  isInWishlist: (productId) => {
    return get().wishlist.some((item) => item.id === productId);
  },

  addToCompare: (product) => {
    const current = get().compareItems;
    if (current.some((item) => String(item.id) === String(product.id))) {
      return true;
    }
    if (current.length >= 4) {
      return false;
    }
    set({ compareItems: [...current, product] });
    enqueueDbWrite(persistCompareToDb);
    return true;
  },

  removeFromCompare: (productId) => {
    set((state) => ({
      compareItems: state.compareItems.filter((item) => item.id !== productId),
    }));
    enqueueDbWrite(persistCompareToDb);
  },

  clearCompare: () => {
    set({ compareItems: [] });
    enqueueDbWrite(persistCompareToDb);
  },

  isInCompare: (productId) => {
    return get().compareItems.some((item) => item.id === productId);
  },

  reset: () => {
    set({ cart: [], wishlist: [], compareItems: [] });
  },
}));
