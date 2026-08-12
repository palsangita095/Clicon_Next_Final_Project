"use client";

import { useEffect, useState } from "react";
import { useStorefront } from "@/store/useStorefront";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, ShoppingCart, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fixImageUrl } from "@/lib/imageFallback";
import AccountSidebar from "@/components/account/AccountSidebar";

export default function WishlistPage() {
  const addToCart = useStorefront((s) => s.addToCart);
  const localWishlist = useStorefront((s) => s.wishlist);
  const removeFromWishlist = useStorefront((s) => s.removeFromWishlist);
  const clearWishlist = useStorefront((s) => s.clearWishlist);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const normalizeLocalItem = (item: any) => ({
    ...item,
    stockQuantity: item.stockQuantity ?? 1,
    status: item.status ?? "active",
  });

  useEffect(() => {
    const fetchWishlist = async () => {
      setWishlistItems(localWishlist.map(normalizeLocalItem));
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      if (localWishlist.length > 0) {
        await supabase.from("wishlist").upsert(
          localWishlist.map((item) => ({
            user_id: user.id,
            product_id: item.id,
          })),
          { onConflict: "user_id,product_id" },
        );
      }

      const { data } = await supabase
        .from("wishlist")
        .select(`
          product_id,
          products (
            id,
            name,
            price,
            image_urls,
            stock_quantity,
            status
          )
        `)
        .eq("user_id", user.id);
        
      if (data) {
        const formatted = data
          .map((item: any) => {
            const product = Array.isArray(item.products) ? item.products[0] : item.products;
            if (!product) return null;

            return {
              id: product.id,
              name: product.name,
              price: product.price,
              image: fixImageUrl(product.image_urls?.[0], product.name),
              stockQuantity: product.stock_quantity ?? 0,
              status: product.status ?? "active",
            };
          })
          .filter(Boolean);
        const merged = new Map<string, any>();
        localWishlist.map(normalizeLocalItem).forEach((item) => merged.set(String(item.id), item));
        formatted.forEach((item: any) => merged.set(String(item.id), item));
        setWishlistItems(Array.from(merged.values()));
      }
      setLoading(false);
    };
    fetchWishlist();
  }, [localWishlist]);

  const handleRemove = async (productId: string) => {
    removeFromWishlist(productId);

    if (user) {
      const supabase = createClient();
      await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
    }
    
    setWishlistItems(wishlistItems.filter(item => item.id !== productId));
  };

  const handleClear = async () => {
    clearWishlist();

    if (user) {
      const supabase = createClient();
      await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id);
    }
      
    setWishlistItems([]);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-orange">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-800 font-medium">Wishlist</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <AccountSidebar />
          <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-brand-orange" />
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <span className="bg-brand-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">{wishlistItems.length}</span>
        </div>

        {!user && wishlistItems.length > 0 && (
          <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Sign in to save this wishlist across devices.
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 p-16 text-center shadow-sm">
            <Heart className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save products you love to your wishlist and shop them later.</p>
            <Button asChild className="bg-brand-orange hover:bg-orange-600 text-white font-semibold">
              <Link href="/shop">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500 font-medium">
                    <th className="text-left py-4 px-6">Product</th>
                    <th className="text-left py-4 px-4">Price</th>
                    <th className="text-left py-4 px-4">Status</th>
                    <th className="text-right py-4 px-6">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {wishlistItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleRemove(item.id)}
                            aria-label={`Remove ${item.name} from wishlist`}
                            className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="w-16 h-16 bg-gray-50 rounded border flex-shrink-0 relative overflow-hidden">
                            <Image src={fixImageUrl(item.image, item.name)} alt={item.name} fill sizes="80px" className="object-contain p-1" />
                          </div>
                          <Link href={`/products/${item.id}`} className="font-medium text-gray-800 hover:text-brand-orange transition-colors text-sm line-clamp-2 max-w-xs">
                            {item.name}
                          </Link>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-brand-blue">₹{item.price.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs font-medium border px-2 py-1 rounded-full ${
                          item.stockQuantity > 0 && item.status === "active"
                            ? "bg-green-50 text-green-600 border-green-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}>
                          {item.stockQuantity > 0 && item.status === "active" ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          onClick={() => addToCart(item)}
                          disabled={item.stockQuantity <= 0 || item.status !== "active"}
                          className="bg-brand-orange hover:bg-orange-600 text-white text-xs font-semibold h-9 gap-2"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Add to Cart
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-100">
              <Button
                onClick={handleClear}
                variant="outline"
                className="text-sm text-gray-600 border-gray-200 hover:text-red-500 hover:border-red-300"
              >
                Clear Wishlist
              </Button>
              <Button
                onClick={() => wishlistItems.forEach((item) => addToCart(item))}
                className="bg-brand-orange hover:bg-orange-600 text-white font-semibold text-sm gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add All to Cart
              </Button>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
