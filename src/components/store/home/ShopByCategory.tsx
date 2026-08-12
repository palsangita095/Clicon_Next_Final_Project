"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCategories } from "@/hooks/queries/customer/useCategories";
import { fixImageUrl } from "@/lib/imageFallback";

export default function ShopByCategory() {
  const { data: dbCategories, isLoading } = useCategories();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const fallbackCategories = [
    { name: "Computer & Laptop", slug: "laptops", image_url: fixImageUrl(null, "Computer") },
    { name: "SmartPhone", slug: "smartphones", image_url: fixImageUrl(null, "Phone") },
    { name: "Headphones", slug: "headphones", image_url: fixImageUrl(null, "Headphones") },
    { name: "Accessories", slug: "accessories", image_url: fixImageUrl('https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/Accessories.png', "Accessories") },
    { name: "Camera & Photo", slug: "cameras", image_url: fixImageUrl(null, "Camera") },
    { name: "TV & Homes", slug: "electronics", image_url: fixImageUrl(null, "TV") }
  ];

  const categories = dbCategories && dbCategories.length > 0 ? dbCategories : fallbackCategories;

  const scroll = (direction: number) => {
    scrollerRef.current?.scrollBy({ left: direction * 280, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-center">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Shop with Categorys</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            aria-label="Scroll categories left"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-brand-orange hover:text-brand-orange transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Scroll categories right"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-brand-orange hover:text-brand-orange transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-auto pb-2 scroll-smooth snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {(categories.length > 0 ? categories : fallbackCategories).map((category: any, index: number) => (
          <Link
            key={category.id || index}
            href={`/shop?category=${encodeURIComponent(category.slug || category.name)}`}
            className="group flex flex-col items-center gap-3 shrink-0 snap-start"
          >
            <div className="w-32 h-32 rounded-full border border-gray-200 p-2 group-hover:border-brand-orange transition-colors">
              <div className="w-full h-full bg-gray-50 rounded-full overflow-hidden flex items-center justify-center">
                <Image
                  src={fixImageUrl(category.image_url, category.name)}
                  alt={category.name}
                  width={80}
                  height={80}
                  sizes="80px"
                  className="w-20 h-20 object-contain group-hover:scale-110 transition-transform"
                />
              </div>
            </div>
            <span className="font-medium text-gray-800 group-hover:text-brand-orange transition-colors">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
