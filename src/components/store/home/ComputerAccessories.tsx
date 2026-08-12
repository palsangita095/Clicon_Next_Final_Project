"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/queries/customer/useProducts";
import { usePromotionalBanners } from "@/hooks/queries/customer/usePromotionalBanners";
import { fixImageUrl } from "@/lib/imageFallback";
import ProductCard from "../ProductCard";

export default function ComputerAccessories({ products: propProducts }: { products?: any[] }) {
  const tabs = ["All Product", "Keyboard", "Mouse", "Monitor", "Webcam"];
  const [activeTab, setActiveTab] = useState("All Product");

  const searchQuery = activeTab !== "All Product" ? activeTab : undefined;

  const { data: dbProducts, isLoading } = useProducts({
    categorySlug: "accessories",
    search: searchQuery,
    limit: 8,
  });

  const { data: promoBanners } = usePromotionalBanners("computer_accessories");
  const promo = promoBanners?.[0] || {
    title: "Xiaomi True Wireless Earbuds",
    subtitle: "Escape the noise, It's time to hear the magic with Xiaomi Earbuds.",
    discount_text: "Only for: ₹29,999 INR",
    button_text: "SHOP NOW",
    target_url: "/shop",
    image_url: "https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/Xiaomi%20True%20Wireless%20Earbuds.png",
  };

  const rawProducts = (dbProducts && dbProducts.length > 0)
    ? dbProducts
    : (propProducts && propProducts.length > 0)
    ? propProducts
    : [];

  
  const products = rawProducts.length > 0
    ? rawProducts.slice(0, 8).map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.name || p.title,
        price: Number(p.price),
        oldPrice: p.old_price ? Number(p.old_price) : undefined,
        rating: p.rating !== undefined ? Number(p.rating) : 5,
        reviewCount: p.review_count !== undefined ? Number(p.review_count) : 0,
        image: p.image_urls?.[0] || p.image || "https://placehold.co/200x200?text=Accessory",
      }))
    : Array(8).fill(null).map((_, i) => ({
        id: i,
        slug: `accessory-${i}`,
        title: `${activeTab !== "All Product" ? activeTab : "Accessory"} Product ${i + 1}`,
        price: 29 + i * 23,
        rating: 5,
        image: `https://placehold.co/200x200?text=Accessory+${i + 1}`,
      }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Computer Accessories</h2>
        <div className="flex flex-wrap gap-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-semibold pb-1 transition-colors ${
                activeTab === tab
                  ? "text-brand-orange border-b-2 border-brand-orange"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
          <Link href="/shop" className="text-brand-orange font-semibold flex items-center gap-1 hover:underline ml-4">
            Browse All Product <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        <div className="w-full lg:w-3/4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        
        <div className="w-full lg:w-1/4 bg-brand-yellow rounded-lg p-8 flex flex-col items-center text-center justify-center relative min-h-[400px]">
          <Image src={fixImageUrl(promo.image_url, promo.title)} alt={promo.title} width={240} height={200} sizes="(max-width: 1024px) 50vw, 240px" className="mb-6 object-contain max-h-48 max-w-full" style={{ width: "auto", height: "auto" }} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{promo.title}</h2>
          <p className="text-sm mb-6 text-gray-700">{promo.subtitle}</p>
          <div className="mb-6 flex items-center gap-2">
            <span className="text-gray-500 text-sm">Offer:</span>
            <span className="bg-white px-2 py-1 rounded font-bold text-brand-blue">{promo.discount_text}</span>
          </div>
          <Link href={promo.target_url || "/shop"} className="w-full">
            <Button className="bg-brand-orange text-white hover:bg-orange-600 px-6 py-3 h-auto rounded-md w-full">
              {promo.button_text || "SHOP NOW"} <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
