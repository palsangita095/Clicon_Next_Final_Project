"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { useStorefront } from "@/store/useStorefront";
import { fixImageUrl } from "@/lib/imageFallback";

export function CartDropdown() {
  const items = useStorefront((s) => s.cart);
  const removeFromCart = useStorefront((s) => s.removeFromCart);

  const subTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label="Open shopping cart" className="relative cursor-pointer hover:text-brand-yellow transition-colors outline-none focus:outline-none">
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-white text-[#1B6392] hover:bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center p-0 text-[10px] font-bold border-2 border-[#1B6392]">
              {itemCount > 9 ? '9+' : `0${itemCount}`.slice(-2)}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[360px] p-0 bg-white rounded shadow-xl border border-gray-200 mt-2 z-50">
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-800">
          Shopping Cart ({`0${items.length}`.slice(-2)})
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">Your cart is empty.</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border-b border-gray-50 items-start relative group">
                <div className="w-16 h-16 bg-gray-50 rounded border border-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <Image src={fixImageUrl(item.image, item.name)} alt={item.name} width={64} height={64} sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight mb-1">{item.name}</h4>
                  <div className="text-sm text-gray-500">
                    {item.quantity} x <span className="text-brand-blue font-semibold">₹{item.price.toLocaleString()}</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="absolute right-4 top-4 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
        
        {items.length > 0 && (
          <div className="p-4 bg-gray-50/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 text-sm font-medium">Sub-Total:</span>
              <span className="text-gray-900 font-bold">₹{subTotal.toLocaleString()}.00 INR</span>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full bg-brand-orange hover:bg-orange-600 text-white font-semibold rounded h-11">
                <Link href="/checkout">
                  CHECKOUT NOW <span className="ml-2 font-bold">→</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white font-semibold rounded h-11 transition-colors">
                <Link href="/cart">
                  VIEW CART
                </Link>
              </Button>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
