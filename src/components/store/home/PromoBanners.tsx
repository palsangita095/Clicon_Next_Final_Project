"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fixImageUrl } from "@/lib/imageFallback";

export default function PromoBanners() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Banner */}
      <div className="bg-gray-100 rounded-lg p-8 flex items-center relative overflow-hidden min-h-[250px]">
        <div className="z-10 max-w-[60%]">
          <span className="bg-brand-blue text-white text-xs font-bold px-2 py-1 rounded inline-block mb-3">INTRODUCING</span>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">New Apple Homepod Mini</h3>
          <p className="text-gray-500 mb-6 text-sm">Jam-packed with innovation, HomePod mini delivers unexpectedly.</p>
          <Button className="bg-brand-orange text-white hover:bg-orange-600 text-sm px-5 py-2 h-auto rounded-md">
            SHOP NOW <ArrowRight size={16} />
          </Button>
        </div>
        <Image src={fixImageUrl('https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/New%20Apple%20Homepod%20Mini.png', "Homepod Mini")} alt="Homepod Mini" width={240} height={200} className="absolute right-0 bottom-0 object-contain w-[40%] h-[80%]" />
      </div>

      {/* Right Banner */}
      <div className="bg-gray-900 rounded-lg p-8 flex items-center relative overflow-hidden min-h-[250px]">
        <div className="z-10 max-w-[60%]">
          <span className="bg-brand-yellow text-gray-900 text-xs font-bold px-2 py-1 rounded inline-block mb-3">INTRODUCING NEW</span>
          <h3 className="text-2xl font-bold text-white mb-2">Xiaomi Mi 11 Ultra 12GB+256GB</h3>
          <p className="text-gray-400 mb-6 text-sm">*Data provided by internal laboratories. Industry measurment.</p>
          <Button className="bg-brand-orange text-white hover:bg-orange-600 text-sm px-5 py-2 h-auto rounded-md">
            SHOP NOW <ArrowRight size={16} />
          </Button>
        </div>
        <Image src={fixImageUrl('https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/Xiaomi%20Mi.png', "Xiaomi Mi 11")} alt="Xiaomi Mi 11" width={240} height={200} className="absolute right-0 bottom-0 object-contain w-[40%] h-[80%]" />
      </div>
    </div>
  );
}
