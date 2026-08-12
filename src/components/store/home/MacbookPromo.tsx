"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fixImageUrl } from "@/lib/imageFallback";

export default function MacbookPromo() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-[#FFE7D6] rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="z-10 max-w-lg mb-8 md:mb-0">
          <span className="bg-brand-blue text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">SAVE UP TO ₹20,000</span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Macbook Pro</h2>
          <p className="text-gray-700 mb-8 text-lg">Apple M1 Max chip. 32GB Unified Memory, 1TB SSD Storage</p>
          <Button className="bg-brand-orange text-white hover:bg-orange-600 px-8 py-3 h-auto rounded-md">
            SHOP NOW <ArrowRight size={20} />
          </Button>
        </div>
        
        <div className="z-10 relative">
          <Image src={fixImageUrl('https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/Laptop%20Category.png', "Macbook Pro")} alt="Macbook Pro" width={600} height={400} sizes="(max-width: 768px) 80vw, 400px" className="w-full max-w-md object-contain" style={{ width: "auto", height: "auto" }} />
          <div className="absolute top-0 right-0 bg-brand-blue text-white w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold border-4 border-white transform translate-x-1/4 -translate-y-1/4">
            <span className="text-lg">₹1,99,999</span>
          </div>
        </div>
      </div>
    </div>
  );
}
