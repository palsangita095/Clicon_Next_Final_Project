"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Apple } from "lucide-react";

import { Play } from "lucide-react"; 
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { createClient } from "@/lib/supabase/client";

interface FooterCategory {
  id: string;
  name: string;
  slug: string;
}

interface FooterTag {
  id: string;
  name: string;
}

interface FooterBrand {
  id: string;
  name: string;
}

const QUICK_LINKS = [
  { label: "Shop Product", href: "/shop" },
  { label: "Shopping Cart", href: "/cart" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Compare", href: "/compare" },
  { label: "Track Order", href: "/track-order" },
  { label: "Customer Help", href: "/need-help" },
  { label: "About Us", href: "/about" },
];

const Footer = () => {
  const settings = useStoreSettings();
  const [categories, setCategories] = useState<FooterCategory[]>([]);
  const [tags, setTags] = useState<FooterTag[]>([]);
  const [brands, setBrands] = useState<FooterBrand[]>([]);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("categories").select("id, name, slug").order("name", { ascending: true }),
      supabase.from("tags").select("id, name").order("name", { ascending: true }),
      supabase.from("brands").select("id, name").order("name", { ascending: true }).limit(6),
    ]).then(([catRes, tagRes, brandRes]) => {
      setCategories((catRes.data ?? []) as FooterCategory[]);
      setTags((tagRes.data ?? []).slice(0, 13) as FooterTag[]);
      setBrands((brandRes.data ?? []) as FooterBrand[]);
    }).catch((err) => console.error("Failed to load footer data:", err));
  }, []);

  return (
    <footer className="w-full font-sans">
    
      <div className="bg-[#1B6392] py-16 px-4 md:px-8 text-white flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold mb-4">Subscribe to our newsletter</h2>
        <p className="text-blue-100 max-w-lg mb-8 text-sm leading-relaxed">
          Get exclusive deals, new product alerts, and expert tech tips delivered straight to your inbox every week.
        </p>
        
        <div className="flex w-full max-w-md bg-white rounded-md p-1 shadow-lg mb-12">
          <Input 
            type="email" 
            placeholder="Email address" 
            className="border-none shadow-none focus-visible:ring-0 text-black h-12"
          />
          <Button className="bg-brand-orange hover:bg-orange-600 text-white font-semibold h-12 px-6 rounded">
            SUBSCRIBE <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        
        {brands.length > 0 && (
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
            {brands.map((brand) => (
              <span key={brand.id} className="text-2xl font-bold uppercase tracking-widest">
                {brand.name}
              </span>
            ))}
          </div>
        )}
      </div>

      
      <div className="bg-[#191C1F] text-gray-300 py-16 px-4 md:px-8 border-b border-gray-800">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              {settings.logoUrl ? (
                <Image src={settings.logoUrl} alt={settings.storeName} width={160} height={40} className="h-10 w-auto max-w-[160px] object-contain brightness-0 invert" />
              ) : (
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-brand-orange rounded-full"></div>
                </div>
              )}
              <span className="text-2xl font-bold tracking-tight text-white">{settings.storeName.toUpperCase()}</span>
            </Link>
            
            <div className="text-sm">
              <p className="text-gray-500 mb-1">Customer Supports:</p>
              <p className="text-white text-lg font-semibold mb-4">{settings.contactPhone}</p>
              {settings.addressLine && <p className="mb-1 leading-relaxed">{settings.addressLine}</p>}
              {settings.addressRegion && <p className="mb-4 leading-relaxed">{settings.addressRegion}</p>}
              <p className="font-medium text-white">{settings.contactEmail}</p>
            </div>
          </div>

          
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold uppercase tracking-wider text-sm mb-2">Top Category</h3>
            <ul className="flex flex-col gap-3 text-sm font-medium">
              {categories.map((category, index) => (
                <li key={category.id} className={index === 0 ? "text-white border-l-2 border-brand-orange pl-2 -ml-[2px]" : undefined}>
                  <Link href={`/shop?category=${encodeURIComponent(category.slug)}`} className="hover:text-white transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="text-brand-orange hover:text-orange-400 transition-colors flex items-center mt-2">
                  Browse All Product <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </li>
            </ul>
          </div>

         
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold uppercase tracking-wider text-sm mb-2">Quick Links</h3>
            <ul className="flex flex-col gap-3 text-sm font-medium">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold uppercase tracking-wider text-sm mb-2">Download App</h3>
            <div className="flex flex-col gap-3">
              <Link href={settings.googlePlayUrl || "#"} className="flex gap-3 items-center justify-start px-4 h-14 bg-[#303639] border-none text-white hover:bg-gray-700 hover:text-white rounded-md">
                <Play className="w-6 h-6" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-gray-400 font-normal leading-tight">Get it now</span>
                  <span className="font-semibold leading-tight">Google Play</span>
                </div>
              </Link>
              <Link href={settings.appStoreUrl || "#"} className="flex gap-3 items-center justify-start px-4 h-14 bg-[#303639] border-none text-white hover:bg-gray-700 hover:text-white rounded-md">
                <Apple className="w-6 h-6" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-gray-400 font-normal leading-tight">Get it now</span>
                  <span className="font-semibold leading-tight">App Store</span>
                </div>
              </Link>
            </div>
          </div>

          
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold uppercase tracking-wider text-sm mb-2">Popular Tag</h3>
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <p className="text-xs text-gray-500">No tags available yet.</p>
              ) : (
                tags.map((tag) => (
                  <Link key={tag.id} href={`/shop?search=${encodeURIComponent(tag.name)}`} className="border border-gray-700 hover:border-gray-500 hover:text-white text-xs py-1.5 px-3 font-medium transition-colors">
                    {tag.name}
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      
      <div className="bg-[#191C1F] text-gray-400 text-xs py-6 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        {settings.storeName}-eCommerce Template © 2026. Design adapted for {settings.storeName}.
      </div>
    </footer>
  );
};

export default Footer;
