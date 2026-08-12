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

const TAB_MAPPING: Record<string, string | undefined> = {
  "All Product": undefined,
  "Smart Phone": "smartphones",
  "Laptop": "laptops",
  "Headphone": "headphones",
  "TV": "electronics",
};

export default function FeaturedProducts({ products: propProducts }: { products?: any[] }) {
  const tabs = ["All Product", "Smart Phone", "Laptop", "Headphone", "TV"];
  const [activeTab, setActiveTab] = useState("All Product");

  const categorySlug = TAB_MAPPING[activeTab];

  const { data: dbProducts, isLoading } = useProducts({
    categorySlug,
    isFeatured: activeTab === "All Product" ? true : undefined,
    limit: 8,
  });

  const { data: promoBanners } = usePromotionalBanners("featured_products");
  const promo = promoBanners?.[0] || {
    title: "COMPUTER & ACCESSORIES",
    discount_text: "32% Discount",
    subtitle: "For all electronics products",
    button_text: "SHOP NOW",
    target_url: "/shop",
    image_url: "https://placehold.co/250x200",
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
        image: p.image_urls?.[0] || p.image || "https://placehold.co/200x200?text=Featured",
      }))
    : Array(8).fill(null).map((_, i) => ({
        id: i,
        slug: `featured-${i}`,
        title: `Featured Product ${i + 1}`,
        price: 89 + i * 51,
        rating: 5,
        image: `https://placehold.co/200x200?text=Featured+${i + 1}`,
      }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
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
        
        <div className="w-full lg:w-1/4 bg-brand-yellow rounded-lg p-8 flex flex-col items-center text-center justify-center relative min-h-[400px]">
          <h3 className="text-brand-blue font-bold text-sm mb-4 uppercase">{promo.title}</h3>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">{promo.discount_text}</h2>
          <span className="text-gray-600 mb-8">{promo.subtitle}</span>
          <p className="text-sm mb-6 flex items-center gap-2">
            <span className="text-brand-orange font-bold">Offers ends in:</span> ENDS OF CHRISTMAS
          </p>
          <Link href={promo.target_url || "/shop"}>
            <Button className="bg-brand-orange text-white hover:bg-orange-600 px-6 py-3 h-auto rounded-md">
              {promo.button_text || "SHOP NOW"} <ArrowRight size={20} />
            </Button>
          </Link>
          <Image src={fixImageUrl(promo.image_url, promo.title)} alt={promo.title} width={240} height={200} sizes="(max-width: 1024px) 50vw, 240px" className="mt-8 object-contain max-w-full" style={{ width: "auto", height: "auto" }} />
        </div>

        
        <div className="w-full lg:w-3/4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
}
