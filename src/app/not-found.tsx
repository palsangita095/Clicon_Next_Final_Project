"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { fixImageUrl } from "@/lib/imageFallback";

export default function NotFound() {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg text-center flex flex-col items-center">
        
        <div className="mb-8 w-64 h-64 relative">
          <Image 
            src={fixImageUrl("https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/Oops!%20404%20Error%20with%20a%20broken%20robot-rafiki%20(1)%201.png", "404 Robot")} 
            alt="404 Error Robot" 
            fill
            sizes="256px"
            className="object-contain"
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">404, Page not founds</h1>
        
        <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
          Something went wrong. It's look that your requested could not be found.
          It's look like the link is broken or the page is removed.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="outline" className="border-brand-orange text-brand-orange hover:bg-orange-50 hover:text-brand-orange font-bold uppercase h-12 px-8 tracking-wide" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> GO BACK
          </Button>

          <Button asChild className="bg-brand-orange hover:bg-orange-600 text-white font-bold uppercase h-12 px-8 tracking-wide">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> GO TO HOME
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
