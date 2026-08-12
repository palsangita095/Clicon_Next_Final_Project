"use client";

import { ShoppingCart, Heart, Eye, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useStorefront } from "@/store/useStorefront";
import { fixImageUrl } from "@/lib/imageFallback";

export interface ProductCardProps {
  id: string | number;
  slug?: string;
  title: string;
  price: number;
  oldPrice?: number | null;
  rating?: number;
  reviewCount?: number;
  image: string;
  category?: string;
  badgeText?: string;
  isBestDeal?: boolean;
}

export function ProductCard({
  id,
  slug,
  title,
  price,
  oldPrice,
  rating = 0,
  reviewCount = 0,
  image,
  badgeText,
}: ProductCardProps) {
  const addToCart = useStorefront((s) => s.addToCart);
  const wishlist = useStorefront((s) => s.wishlist);
  const addToWishlist = useStorefront((s) => s.addToWishlist);
  const removeFromWishlist = useStorefront((s) => s.removeFromWishlist);
  const isInWishlist = useStorefront((s) => s.isInWishlist);

  const isLiked = isInWishlist(id);
  const targetHref = slug ? `/products/${slug}` : `/products/${id}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id, name: title, price: Number(price), image }, 1);
    toast.success(`${title} added to cart!`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      removeFromWishlist(id);
      toast.info(`Removed ${title} from wishlist`);
    } else {
      addToWishlist({ id, name: title, price: Number(price), image });
      toast.success(`Added ${title} to wishlist!`);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 group relative bg-white hover:shadow-lg transition-shadow flex flex-col justify-between">
      <div>
        <div className="relative aspect-square mb-4 bg-gray-50 flex items-center justify-center rounded overflow-hidden">
          {badgeText && (
            <span className="absolute top-2 left-2 bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase z-10">
              {badgeText}
            </span>
          )}
          <Link href={targetHref} className="relative w-full h-full flex items-center justify-center">
            <Image src={fixImageUrl(image, title)} alt={title} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-300" />
          </Link>

          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
            <button
              onClick={handleToggleWishlist}
              title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
              aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
              className={`p-2 rounded-full shadow transition-colors ${
                isLiked ? "bg-brand-orange text-white" : "bg-white text-gray-700 hover:bg-brand-orange hover:text-white"
              }`}
            >
              <Heart size={20} className={isLiked ? "fill-current" : ""} />
            </button>
            <button
              onClick={handleAddToCart}
              title="Add to cart"
              aria-label="Add to cart"
              className="bg-white p-2 rounded-full shadow hover:bg-brand-orange hover:text-white transition-colors text-gray-700"
            >
              <ShoppingCart size={20} />
            </button>
            <Link
              href={targetHref}
              title="View details"
              aria-label="View details"
              className="bg-white p-2 rounded-full shadow hover:bg-brand-orange hover:text-white transition-colors text-gray-700"
            >
              <Eye size={20} />
            </Link>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center text-brand-yellow text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.round(rating) ? "fill-brand-yellow text-brand-yellow" : "text-gray-200"}
              />
            ))}
            <span className="text-gray-400 text-xs ml-1">({reviewCount})</span>
          </div>

          <Link href={targetHref} className="block">
            <h4 className="text-gray-800 font-medium line-clamp-2 text-sm h-10 hover:text-brand-orange transition-colors">
              {title}
            </h4>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
        <span className="text-brand-blue font-bold">₹{Number(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        {oldPrice && oldPrice > price && (
          <span className="text-gray-400 line-through text-sm">₹{Number(oldPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
