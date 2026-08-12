"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AccountSidebar from "@/components/account/AccountSidebar";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setIsLoggedIn(!!data?.user);
    };
    checkAuth();
  }, []);

  const handleTrack = () => {
    if (orderId.trim()) {
      const cleanId = orderId.trim().replace(/^#/, "");
      const query = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : "";
      router.push(`/track-order/${cleanId}${query}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange flex items-center gap-1">
            <span>🏠</span> Home
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-400">Pages</span>
          <span className="text-gray-400">›</span>
          <span className="text-brand-orange font-medium">Track Order</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {isLoggedIn && <AccountSidebar />}
          <div className="flex-1 min-w-0 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Track Order</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-10">
          To track your order please enter your order ID in the input field below and press the "Track Order" button. This was given to you on your receipt and in the confirmation email you should have received.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="order-id" className="text-sm font-medium text-gray-700">
              Order ID
            </label>
            <Input
              id="order-id"
              placeholder="ID..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="h-12 border-gray-200 focus-visible:ring-brand-orange"
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="billing-email" className="text-sm font-medium text-gray-700">
              Billing Email
            </label>
            <Input
              id="billing-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-gray-200 focus-visible:ring-brand-orange"
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Order ID that we sent to you in your email address.</span>
        </div>

        <Button
          onClick={handleTrack}
          disabled={!orderId.trim()}
          className="bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 px-8 rounded flex items-center gap-2 disabled:opacity-50"
        >
          TRACK ORDER <ArrowRight className="w-4 h-4" />
        </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
