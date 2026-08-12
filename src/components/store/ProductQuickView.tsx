"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, RefreshCcw, Copy, ArrowLeft, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fixImageUrl } from "@/lib/imageFallback";

export function ProductQuickView({ trigger }: { trigger: React.ReactNode }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const images = [
    fixImageUrl("https://placehold.co/600x400?text=MacBook+Main", "MacBook Main"),
    fixImageUrl("https://placehold.co/80x80?text=Thumb+1", "Thumb 1"),
    fixImageUrl("https://placehold.co/80x80?text=Thumb+2", "Thumb 2"),
    fixImageUrl("https://placehold.co/80x80?text=Thumb+3", "Thumb 3"),
    fixImageUrl("https://placehold.co/80x80?text=Thumb+4", "Thumb 4"),
    fixImageUrl("https://placehold.co/80x80?text=Thumb+5", "Thumb 5")
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-[1000px] p-8 gap-8 border-none rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-video bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 overflow-hidden relative">
              <Image src={images[0]} alt="Product" fill className="object-contain p-4" />
            </div>
            <div className="flex items-center gap-2 relative">
              <button className="absolute left-0 z-10 bg-brand-orange text-white rounded-full p-1 -ml-3 shadow-md hover:bg-orange-600">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2 overflow-x-auto px-4 snap-x no-scrollbar">
                {images.map((img, i) => (
                  <div key={i} className={`flex-shrink-0 w-16 h-16 rounded border-2 snap-center cursor-pointer overflow-hidden relative ${i === 0 ? 'border-brand-orange' : 'border-gray-200'}`}>
                    <Image src={img} alt={`Thumb ${i}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
              <button className="absolute right-0 z-10 bg-brand-orange text-white rounded-full p-1 -mr-3 shadow-md hover:bg-orange-600">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

       
          <div className="flex flex-col gap-5 text-gray-900">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-yellow-400 text-sm">★★★★★</div>
                <span className="font-semibold text-sm">4.7 Star Rating</span>
                <span className="text-gray-400 text-sm">(21,671 User feedback)</span>
              </div>
              <h2 className="text-xl font-medium leading-snug">
                2020 Apple MacBook Pro with Apple M1 Chip (13-inch, 8GB RAM, 256GB SSD Storage) - Space Gray
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
              <div className="flex gap-1"><span className="text-gray-400">Sku:</span> <span className="font-medium text-gray-800">A264671</span></div>
              <div className="flex gap-1"><span className="text-gray-400">Availability:</span> <span className="text-green-500 font-medium">In Stock</span></div>
              <div className="flex gap-1"><span className="text-gray-400">Brand:</span> <span className="font-medium text-gray-800">Apple</span></div>
              <div className="flex gap-1"><span className="text-gray-400">Category:</span> <span className="font-medium text-gray-800">Electronics Devices</span></div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold text-brand-blue">₹1,69,999</span>
              <span className="text-lg text-gray-400 line-through">₹1,99,900</span>
              <span className="bg-brand-yellow px-2 py-0.5 rounded text-sm font-bold text-gray-900">21% OFF</span>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Color</span>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-gray-400 ring-2 ring-offset-2 ring-brand-orange"></button>
                  <button className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300"></button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Size</span>
                <Select defaultValue="14">
                  <SelectTrigger className="w-full h-11"><SelectValue placeholder="Size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="13">13-inch Liquid Retina</SelectItem>
                    <SelectItem value="14">14-inch Liquid Retina XDR</SelectItem>
                    <SelectItem value="16">16-inch Liquid Retina XDR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Memory</span>
                <Select defaultValue="16">
                  <SelectTrigger className="w-full h-11"><SelectValue placeholder="Memory" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8GB unified memory</SelectItem>
                    <SelectItem value="16">16GB unified memory</SelectItem>
                    <SelectItem value="32">32GB unified memory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Storage</span>
                <Select defaultValue="1">
                  <SelectTrigger className="w-full h-11"><SelectValue placeholder="Storage" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512">512GB SSD Storage</SelectItem>
                    <SelectItem value="1">1TB SSD Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center border border-gray-300 rounded h-12 w-32">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50"
                >-</button>
                <div className="flex-1 text-center font-medium">{`0${quantity}`.slice(-2)}</div>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50"
                >+</button>
              </div>
              <Button className="flex-1 bg-brand-orange hover:bg-orange-600 text-white h-12 font-semibold">
                ADD TO CARD <ShoppingCart className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="flex-1 border-brand-orange text-brand-orange hover:bg-orange-50 h-12 font-semibold">
                BUY NOW
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 pt-2">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 hover:text-brand-orange">
                  <Heart className="w-4 h-4" /> Add to Wishlist
                </button>
                <button className="flex items-center gap-1.5 hover:text-brand-orange">
                  <RefreshCcw className="w-4 h-4" /> Add to Compare
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span>Share product:</span>
                <div className="flex gap-2">
                  <Copy className="w-4 h-4 cursor-pointer hover:text-brand-orange" />
                  <span className="text-sm cursor-pointer hover:text-brand-orange">FB</span>
                  <span className="text-sm cursor-pointer hover:text-brand-orange">TW</span>
                </div>
              </div>
            </div>
            
            <div className="mt-2 border border-gray-200 rounded p-4 flex flex-col gap-2 bg-gray-50/50">
              <span className="text-sm font-semibold text-gray-800">100% Guarantee Safe Checkout</span>
              <div className="flex gap-2 opacity-60">
                
                 <div className="h-6 w-10 bg-gray-300 rounded-sm"></div>
                 <div className="h-6 w-10 bg-gray-300 rounded-sm"></div>
                 <div className="h-6 w-10 bg-gray-300 rounded-sm"></div>
                 <div className="h-6 w-10 bg-gray-300 rounded-sm"></div>
                 <div className="h-6 w-10 bg-gray-300 rounded-sm"></div>
                 <div className="h-6 w-10 bg-gray-300 rounded-sm"></div>
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
