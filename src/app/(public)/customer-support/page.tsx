"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Phone, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { fixImageUrl } from "@/lib/imageFallback";

export default function CustomerSupportPage() {
  const settings = useStoreSettings();
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange flex items-center gap-1">
            <span>🏠</span> Home
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-400">Pages</span>
          <span className="text-gray-400">›</span>
          <span className="text-brand-orange font-medium">Customer Support</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 md:px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex-1 max-w-lg">
          <span className="bg-[#F3C83A] text-gray-900 text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-sm inline-block mb-4">
            HELP CENTER
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-8">How we can help you!</h1>
          
          <div className="flex shadow-md rounded-md overflow-hidden border border-gray-100">
            <div className="flex items-center pl-4 bg-white">
              <Search className="w-5 h-5 text-brand-orange" />
            </div>
            <Input 
              type="text" 
              placeholder="Enter your question or keyword" 
              className="border-0 h-12 flex-1 focus-visible:ring-0 shadow-none rounded-none"
            />
            <Button className="bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 rounded-none px-8">
              SEARCH
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex justify-end relative h-[300px] w-full max-w-[400px]">
          {/* Placeholder for customer support agent image */}
          <Image 
            src={fixImageUrl("https://wlqsdguefbabohjsbwab.supabase.co/storage/v1/object/public/product_images/products/Customer%20Support.png", "Customer Support")} 
            alt="Customer Support" 
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-contain"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 md:px-8 py-16 text-center border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-10">What can we assist you with today?</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { icon: "🚚", label: "Track Order" },
            { icon: "🔒", label: "Reset Password" },
            { icon: "💳", label: "Payment Option" },
            { icon: "👤", label: "User & Account" },
            { icon: "❤️", label: "Wishlist & Compare" },
            { icon: "📦", label: "Shipping & Billing" },
            { icon: "🛒", label: "Shoping Cart & Wallet" },
            { icon: "🏪", label: "Sell on Clicon" },
          ].map((item, idx) => (
            <div key={idx} className="border border-gray-200 hover:border-brand-orange rounded-md p-6 flex items-center gap-4 cursor-pointer transition-colors hover:shadow-sm">
              <span className="text-2xl text-brand-orange">{item.icon}</span>
              <span className="font-semibold text-gray-800">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Topics */}
      <div className="container mx-auto px-4 md:px-8 py-16 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Popular Topics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 max-w-5xl mx-auto text-sm text-gray-600">
          <ul className="space-y-3">
            <li className="flex items-center gap-2 hover:text-brand-orange cursor-pointer">• How do I return my item?</li>
            <li className="flex items-center gap-2 text-brand-orange font-medium cursor-pointer">• What is Clicons Returns Policy?</li>
            <li className="flex items-center gap-2 hover:text-brand-orange cursor-pointer">• How long is the refund process?</li>
          </ul>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 hover:text-brand-orange cursor-pointer">• What are the 'Delivery Timelines'?</li>
            <li className="flex items-center gap-2 hover:text-brand-orange cursor-pointer">• What is 'Discover Your Daraz Campaign 2022'?</li>
            <li className="flex items-center gap-2 hover:text-brand-orange cursor-pointer">• What is the Voucher & Gift Offer in this Campaign?</li>
          </ul>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 hover:text-brand-orange cursor-pointer">• How to cancel Clicon Order.</li>
            <li className="flex items-center gap-2 hover:text-brand-orange cursor-pointer">• Ask the Digital and Device Community</li>
            <li className="flex items-center gap-2 hover:text-brand-orange cursor-pointer">• How to change my shop name?</li>
          </ul>
        </div>
      </div>

      {/* Submit a Ticket */}
      <div className="container mx-auto px-4 md:px-8 py-12 text-center border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Submit a Support Ticket</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Can't find what you're looking for? Send us a message and we'll get back to you.</p>
        <Link href="/contact">
          <Button className="bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 px-8 uppercase tracking-wide">
            CONTACT US →
          </Button>
        </Link>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50 py-20 text-center">
        <div className="container mx-auto px-4">
          <span className="bg-[#2DB2FF] text-white text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-sm inline-block mb-4">
            CONTACT US
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Don't find your answer.<br />Contact with us
          </h2>

          <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-4xl mx-auto">
            {/* Call Us */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 flex-1 text-left flex gap-6">
              <div className="w-16 h-16 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0">
                <Phone className="w-8 h-8 text-[#2DB2FF]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Call us now</h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  we are available online from 9:00 AM to 5:00 PM (GMT95:45) Talk with use now
                </p>
                <div className="text-2xl font-light text-gray-900 mb-4">{settings.contactPhone}</div>
                <Button className="bg-[#2DB2FF] hover:bg-blue-500 text-white font-bold uppercase text-xs h-10 px-6">
                  CALL NOW ➔
                </Button>
              </div>
            </div>

            {/* Chat with Us */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 flex-1 text-left flex gap-6">
              <div className="w-16 h-16 bg-green-50 rounded-md flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-8 h-8 text-[#22C55E]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Chat with us</h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  we are available online from 9:00 AM to 5:00 PM (GMT95:45) Talk with use now
                </p>
                <div className="text-xl font-light text-gray-900 mb-4">{settings.contactEmail}</div>
                <Button className="bg-[#22C55E] hover:bg-green-600 text-white font-bold uppercase text-xs h-10 px-6">
                  CONTACT US ➔
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
