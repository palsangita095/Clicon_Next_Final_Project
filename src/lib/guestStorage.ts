import type { Product, CartItem } from "@/store/useStorefront";

const GUEST_KEYS = {
  CART: "clicon_guest_cart",
  WISHLIST: "clicon_guest_wishlist",
  COMPARE: "clicon_guest_compare",
} as const;

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

export function getGuestCart(): CartItem[] {
  return safeParse<CartItem[]>(GUEST_KEYS.CART, []);
}

export function setGuestCart(items: CartItem[]): void {
  safeSet(GUEST_KEYS.CART, items);
}

export function getGuestWishlist(): Product[] {
  return safeParse<Product[]>(GUEST_KEYS.WISHLIST, []);
}

export function setGuestWishlist(items: Product[]): void {
  safeSet(GUEST_KEYS.WISHLIST, items);
}

export function getGuestCompare(): Product[] {
  return safeParse<Product[]>(GUEST_KEYS.COMPARE, []);
}

export function setGuestCompare(items: Product[]): void {
  safeSet(GUEST_KEYS.COMPARE, items);
}

export function clearAllGuestData(): void {
  if (typeof window === "undefined") return;
  Object.values(GUEST_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function getAllGuestData(): {
  cart: CartItem[];
  wishlist: Product[];
  compare: Product[];
} {
  return {
    cart: getGuestCart(),
    wishlist: getGuestWishlist(),
    compare: getGuestCompare(),
  };
}

export function isGuestDataEmpty(): boolean {
  const { cart, wishlist, compare } = getAllGuestData();
  return cart.length === 0 && wishlist.length === 0 && compare.length === 0;
}

export function migrateGuestDataToServer(
  serverCart: CartItem[],
  serverWishlist: Product[],
  serverCompare: Product[]
): { cart: CartItem[]; wishlist: Product[]; compare: Product[] } {
  const guest = getAllGuestData();

  const cartMap = new Map<string, CartItem>();
  for (const item of serverCart) cartMap.set(String(item.id), item);
  for (const item of guest.cart) {
    const key = String(item.id);
    if (cartMap.has(key)) {
      cartMap.set(key, { ...cartMap.get(key)!, quantity: cartMap.get(key)!.quantity + item.quantity });
    } else {
      cartMap.set(key, item);
    }
  }

  const wishlistMap = new Map<string, Product>();
  for (const item of serverWishlist) wishlistMap.set(String(item.id), item);
  for (const item of guest.wishlist) wishlistMap.set(String(item.id), item);

  const compareMap = new Map<string, Product>();
  for (const item of serverCompare) compareMap.set(String(item.id), item);
  for (const item of guest.compare) {
    if (compareMap.size < 4 || compareMap.has(String(item.id))) {
      compareMap.set(String(item.id), item);
    }
  }

  return {
    cart: Array.from(cartMap.values()),
    wishlist: Array.from(wishlistMap.values()),
    compare: Array.from(compareMap.values()).slice(0, 4),
  };
}