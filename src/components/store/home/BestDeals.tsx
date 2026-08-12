"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useBestDeals } from "@/hooks/queries/customer/useProducts";
import ProductCard from "../ProductCard";

interface BestDealsProps {
  products?: any[];
}

export default function BestDeals({ products: propProducts }: BestDealsProps) {
  const { data: dbProducts, isLoading } = useBestDeals();

  const activeProducts = propProducts && propProducts.length > 0
    ? propProducts
    : dbProducts && dbProducts.length > 0
    ? dbProducts
    : [];


  const firstDealTimeStr = activeProducts.find((p) => p.deal_end_time)?.deal_end_time;
  
  const targetEndTime = useMemo(() => {
    if (firstDealTimeStr) {
      return new Date(firstDealTimeStr).getTime();
    }
    
    return new Date().getTime() + 16 * 24 * 3600 * 1000 + 21 * 3600 * 1000 + 57 * 60 * 1000;
  }, [firstDealTimeStr]);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetEndTime - Date.now();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetEndTime]);

  const displayItems = activeProducts.length > 0
    ? activeProducts.map((p) => {
        const basePrice = Number(p.price);
        const dealEndTime = p.deal_end_time ? new Date(p.deal_end_time).getTime() : 0;
        const dealActive = p.is_best_deal && dealEndTime > new Date().getTime();
        const dealDiscount = Number(p.discount_percentage) || 0;
        const price = dealActive && dealDiscount > 0
          ? Math.round(basePrice * (1 - dealDiscount / 100) * 100) / 100
          : basePrice;

        return {
          id: p.id,
          slug: p.slug,
          title: p.name || p.title,
          price,
          oldPrice: dealActive && dealDiscount > 0
            ? (p.old_price ? Number(p.old_price) : basePrice)
            : (p.old_price ? Number(p.old_price) : basePrice * 1.25),
          rating: p.rating !== undefined ? Number(p.rating) : 5,
          reviewCount: p.review_count !== undefined ? Number(p.review_count) : 0,
          image: p.image_urls?.[0] || p.image || "https://placehold.co/200x200?text=Product",
        };
      })
    : Array(10).fill(null).map((_, i) => ({
        id: i,
        slug: `best-deal-${i}`,
        title: `Amazing Best Deal ${i + 1}`,
        price: 79 + i * 43,
        oldPrice: 149 + i * 57,
        rating: i % 2 === 0 ? 5 : 4,
        image: `https://placehold.co/200x200?text=Product+${i + 1}`,
      }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Best Deals</h2>
          <div className="bg-brand-yellow px-3 py-1 text-sm font-bold flex items-center gap-2 rounded">
            <span>Deals ends in</span>
            <span className="bg-white px-2 py-0.5 rounded text-gray-900">{timeLeft.days}d</span> : 
            <span className="bg-white px-2 py-0.5 rounded text-gray-900">{String(timeLeft.hours).padStart(2, "0")}h</span> : 
            <span className="bg-white px-2 py-0.5 rounded text-gray-900">{String(timeLeft.minutes).padStart(2, "0")}m</span> : 
            <span className="bg-white px-2 py-0.5 rounded text-gray-900">{String(timeLeft.seconds).padStart(2, "0")}s</span>
          </div>
        </div>
        <Link href="/shop" className="text-brand-blue font-semibold flex items-center gap-1 hover:underline">
          Browse All Product <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayItems.slice(0, 10).map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}
