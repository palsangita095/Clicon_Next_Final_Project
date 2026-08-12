"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Layers } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="bg-white min-h-screen">
     
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange flex items-center gap-1">
            <span>🏠</span> Home
          </Link>
          <span className="text-gray-400">›</span>
          <Link href="/cart" className="hover:text-brand-orange">Shopping Card</Link>
          <span className="text-gray-400">›</span>
          <span className="text-brand-orange font-medium">Checkout</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Your order is successfully place</h1>
        
        <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm leading-relaxed">
          Your order has been created and is waiting for admin processing. You can view it from your dashboard or track its latest status.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
          <Button asChild variant="outline" className="flex-1 border-gray-200 text-brand-orange hover:bg-orange-50 hover:text-brand-orange font-semibold h-12 gap-2">
            <Link href="/account">
              <Layers className="w-4 h-4" /> GO TO DASHBOARD
            </Link>
          </Button>
          <Button asChild className="flex-1 bg-brand-orange hover:bg-orange-600 text-white font-semibold h-12 gap-2">
            <Link href={orderId ? `/track-order/${orderId}` : "/track-order"}>
              VIEW ORDER <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
