"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fixImageUrl } from "@/lib/imageFallback";
import FlashSale from "@/components/store/home/FlashSale";

const TEAM_MEMBERS = [
  {
    name: "Kevin Gilbert",
    role: "Chief Executive Officer",
    img: "https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/AboutP1.png"
  },
  {
    name: "Michael Carter",
    role: "Assistant of CEO",
    img: "https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/AboutP2.png"
  },
  {
    name: "Daniel Brooks",
    role: "Head of Designer",
    img: "https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/AboutP3.png"
  },
  {
    name: "Ethan Walker",
    role: "UX Designer",
    img: "https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/AboutP41.png"
  },
  {
    name: "Ryan Mitchell",
    role: "Product Designer",
    img: "https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/AboutP5.png"
  },
  {
    name: "Christopher Adams",
    role: "Head of Development",
    img: "https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/AboutP6.png"
  },
  {
    name: "James Anderson",
    role: "Design Engineer",
    img: "https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/AboutP7.png"
  },
  {
    name: "Sophia Bennett",
    role: "UI Designer",
    img: "https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/AboutP8.png"
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange flex items-center gap-1">
            <span>🏠</span> Home
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-400">Pages</span>
          <span className="text-gray-400">›</span>
          <span className="text-brand-orange font-medium">About Us</span>
        </div>
      </div>

      
      <div className="container mx-auto px-4 md:px-8 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <span className="bg-[#2DB2FF] text-white text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-sm inline-block mb-4">
              WHO WE ARE
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight max-w-lg">
              Kinbo - largest electronics retail shop in the world.
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed max-w-xl">
              Kinbo started with a simple idea: make premium electronics accessible to everyone. Today we serve customers in more than 50 countries, offering everything from smartphones and laptops to gaming gear and home appliances. Our team of tech experts carefully curates every product we sell so you can shop with confidence.
            </p>
            <ul className="space-y-4">
              {["Great 24/7 customer services.", "600+ Dedicated employe.", "50+ Branches all over the world.", "Over 1 Million Electronics Products"].map((item, i) => (
                <li key={i} className="flex items-center text-gray-700 font-medium">
                  <Check className="text-green-500 mr-3 w-5 h-5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full relative h-[450px]">
            <Image 
              src={fixImageUrl("https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/Kinbo%20AboutPage.png", "Team at work")} 
              alt="Team at work" 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover rounded-md"
            />
          </div>
        </div>
      </div>

      
      <div className="container mx-auto px-4 md:px-8 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">Our core team member</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {TEAM_MEMBERS.map((member, idx) => (
            <div key={idx} className="border border-gray-100 rounded-md p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-4 bg-gray-100 relative">
                <Image src={fixImageUrl(member.img, member.name)} alt={member.name} fill sizes="64px" className="object-cover" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{member.name}</h3>
              <p className="text-gray-500 text-xs">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      
      <div className="relative w-full h-[400px] bg-gray-900 flex items-center">
        <Image 
          src={fixImageUrl("https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/BannerAboutPage.png", "Trusted shop banner")} 
          alt="Trusted shop banner" 
          fill 
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover opacity-60"
        />
        
      </div>

      
      <FlashSale />

     
     
    </div>
  );
}
