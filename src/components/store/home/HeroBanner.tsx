"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { WordRotate } from "@/components/ui/word-rotate";
import { fixImageUrl } from "@/lib/imageFallback";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroBanner() {
  return (
    <div className="flex flex-col md:flex-row gap-4 max-w-7xl mx-auto py-6 px-4">
     
      <div className="flex-1 bg-gray-100 rounded-lg p-8 flex items-center relative overflow-hidden">
        <div className="z-10 max-w-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-brand-blue uppercase tracking-wider">Xbox Consoles</span>
            <span className="bg-brand-blue text-white text-xs font-bold px-2 py-1 rounded">₹29,999</span>
          </div>
          <WordRotate
            words={[
              "Save up to 50% on selected Xbox consoles",
              "New gaming arrivals in stock now",
              "Exclusive summer deals for you",
            ]}
            className="text-4xl font-bold text-gray-900 leading-tight"
          />
          <Link href="/shop">
            <ShimmerButton
              className="bg-brand-orange px-6 py-3 font-semibold [--radius:8px]"
              shimmerColor="#FFD9A8"
            >
              SHOP NOW <ArrowRight size={20} />
            </ShimmerButton>
          </Link>
        </div>
        <Image
          src={fixImageUrl("https://dmmoyyciwrviaakzqxvz.supabase.co/storage/v1/object/public/product_images/X-Box%20console.jpeg", "Xbox Console")}
          alt="Xbox Console"
          width={288}
          height={288}
          loading="eager"
          className="absolute right-0 top-1/2 -translate-y-1/2 object-contain hidden lg:block w-72 h-72"
        />
      </div>

     
      <div className="flex flex-col gap-4 w-full md:w-1/3">
        
        <div className="bg-gray-900 text-white rounded-lg p-6 flex flex-col justify-center h-1/2 relative overflow-hidden">
          <div className="z-10">
            <span className="text-brand-yellow font-medium text-sm mb-2 block">Summer Sales</span>
            <h3 className="text-2xl font-bold mb-2">New Google Pixel 6 Pro</h3>
            <div className="mb-4">
              <span className="bg-brand-yellow text-gray-900 text-xs font-bold px-2 py-1 rounded">29% OFF</span>
            </div>
            <Button
              asChild
              variant="link"
              className="text-brand-orange font-semibold h-auto px-0"
            >
              <Link href="/shop">
                SHOP NOW <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
          <Image
            src={fixImageUrl("https://dmmoyyciwrviaakzqxvz.supabase.co/storage/v1/object/public/product_images/Google-pixel6-pro.jpeg", "Google Pixel")}
            alt="Google Pixel 6 Pro"
            width={128}
            height={128}
            className="absolute right-[-20px] bottom-[-20px] w-32 h-32 object-contain"
          />
        </div>

        
        <div className="bg-gray-100 rounded-lg p-6 flex flex-col justify-center h-1/2 relative overflow-hidden">
          <div className="z-10">
            <Image
              src={fixImageUrl("https://dmmoyyciwrviaakzqxvz.supabase.co/storage/v1/object/public/product_images/Xiaomi%20FlipBuds%20Pro.jpeg", "FlipBuds Pro")}
              alt="Xiaomi FlipBuds Pro"
              width={96}
              height={96}
              className="w-24 h-24 object-contain mb-4"
            />
            <h3 className="text-xl font-bold text-gray-900">Xiaomi FlipBuds Pro</h3>
            <p className="text-brand-blue font-semibold mb-4">₹29,999 INR</p>
            <Link href="/shop">
              <Button className="bg-brand-orange text-white hover:bg-orange-600 w-fit text-sm px-4 py-2 h-auto rounded-md">
                SHOP NOW <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
