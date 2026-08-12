"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle2, Package, Truck, Gift, ShoppingBag, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AccountSidebar from "@/components/account/AccountSidebar";
import Image from "next/image";
import { fixImageUrl } from "@/lib/imageFallback";
import { useOrderStatusRealtime } from "@/hooks/realtime/useOrderRealtime";
import { OrderStatus, TrackableOrder, TrackableOrderItem } from "@/types/database.types";

const ORDER_STATUSES: Array<{ key: string; label: string; icon: typeof Gift; statuses: string[] }> = [
  { key: "placed", label: "Order Placed", icon: Gift, statuses: ["Pending"] },
  { key: "packaging", label: "Packaging", icon: Package, statuses: ["Processing"] },
  { key: "road", label: "On The Road", icon: Truck, statuses: ["Shipping"] },
  { key: "delivered", label: "Delivered", icon: CheckCircle2, statuses: ["Delivered", "Completed"] },
];

function getActiveStep(status?: string) {
  const index = ORDER_STATUSES.findIndex((step) => step.statuses.includes(status ?? ""));
  return Math.max(index, 0);
}

function OrderTrackingDetailInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = String(params.id);
  const email = searchParams.get("email");
  const [order, setOrder] = useState<TrackableOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useOrderStatusRealtime(order?.id ?? null, (status: OrderStatus) => {
    setOrder((prev) => (prev ? { ...prev, status } : prev));
  });

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setIsLoggedIn(!!data?.user);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const supabase = createClient();
      try {
        // Public tracking is served by a SECURITY DEFINER function that only
        // matches the order id prefix AND the billing email, and returns a
        // non-sensitive field set (no billing/shipping addresses).
        const { data, error } = await supabase.rpc("get_trackable_order", {
          p_order_id: id,
          p_email: email ?? "",
        });

        if (error) throw error;
        setOrder(data && data.length > 0 ? (data[0] as TrackableOrder) : null);
      } catch (err) {
        console.error("Track order fetch failed:", err);
        setOrder(null);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [email, id]);

  const activeStep = getActiveStep(order?.status);
  const activity = useMemo(() => {
    if (!order) return [];

    const time = new Date(order.created_at).toLocaleString();
    const rows = [
      { icon: Package, color: "text-gray-500 bg-gray-50 border-gray-200", text: "Your order has been confirmed.", time },
      { icon: CheckCircle2, color: "text-green-500 bg-green-50 border-green-100", text: "Your order is successfully verified.", time },
    ];

    if (activeStep >= 1) rows.unshift({ icon: Package, color: "text-orange-500 bg-orange-50 border-orange-100", text: "Your order is being packaged.", time });
    if (activeStep >= 2) rows.unshift({ icon: Truck, color: "text-purple-500 bg-purple-50 border-purple-100", text: "Your order is on the road.", time });
    if (activeStep >= 3) rows.unshift({ icon: CheckCircle2, color: "text-green-500 bg-green-50 border-green-100", text: "Your order has been delivered. Thank you for shopping at Clicon!", time });

    return rows;
  }, [activeStep, order]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange">Home</Link>
          <span className="text-gray-400">&gt;</span>
          <Link href="/track-order" className="hover:text-brand-orange">Track Order</Link>
          <span className="text-gray-400">&gt;</span>
          <span className="text-brand-orange font-medium">#{id.split("-")[0].toUpperCase()}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {isLoggedIn && <AccountSidebar />}
          <div className="flex-1 min-w-0 max-w-3xl">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-100 p-10 text-center text-gray-500">Loading tracking details...</div>
        ) : !order ? (
          <div className="bg-white rounded-lg border border-gray-100 p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
            <p className="text-sm text-gray-500 mb-6">Check the order ID and billing email, then try again.</p>
            <Link href="/track-order" className="text-brand-orange hover:underline text-sm font-medium">Track another order</Link>
          </div>
        ) : (
          <>
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-gray-900">#{order.id.split("-")[0].toUpperCase()}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {order.order_items?.length ?? 0} Products · Order placed on {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <p className="text-2xl font-bold text-brand-blue">₹{Number(order.total_amount).toFixed(2)}</p>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Current status <span className="font-semibold text-gray-900">{order.status}</span>
            </p>

            <div className="relative mb-10">
              <div className="absolute top-5 left-[calc(12.5%)] right-[calc(12.5%)] h-1 bg-gray-200 rounded-full z-0">
                <div className="h-full bg-brand-orange rounded-full" style={{ width: `${Math.max(10, activeStep * 33)}%` }} />
              </div>

              <div className="grid grid-cols-4 relative z-10">
                {ORDER_STATUSES.map((status, index) => {
                  const Icon = status.icon;
                  const done = index <= activeStep;
                  const active = index === activeStep;

                  return (
                    <div key={status.key} className="flex flex-col items-center gap-3">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        done ? "bg-brand-orange border-brand-orange text-white" : active ? "bg-white border-brand-orange" : "bg-white border-gray-300"
                      }`}>
                        {done ? <CheckCircle2 className="w-5 h-5 text-white" /> : <div className={`w-3 h-3 rounded-full ${active ? "bg-brand-orange" : "bg-gray-300"}`} />}
                      </div>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                        done ? "bg-brand-orange/10 border-brand-orange/20 text-brand-orange" : "bg-gray-50 border-gray-200 text-gray-400"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-medium text-center ${done ? "text-gray-900" : "text-gray-400"}`}>{status.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            {order.order_items?.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                <div className="divide-y divide-gray-100">
                  {order.order_items.map((item: TrackableOrderItem, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="relative w-16 h-16 bg-gray-50 rounded border border-gray-100 flex-shrink-0">
                        <Image src={fixImageUrl(item.products?.image_urls?.[0] || "https://placehold.co/64x64")} alt={item.product_name} fill sizes="64px" className="object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">₹{Number(item.price_at_time).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Activity</h2>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-100" />

                <div className="space-y-6">
                  {activity.map((row, index) => {
                    const Icon = row.icon;
                    return (
                      <div key={index} className="flex gap-4 relative">
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 z-10 ${row.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="pt-1 flex-1">
                          <p className="text-sm text-gray-800 leading-snug">{row.text}</p>
                          <p className="text-xs text-gray-400 mt-1">{row.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/track-order" className="text-brand-orange hover:underline text-sm font-medium">
                Track Another Order
              </Link>
            </div>
          </>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
      <OrderTrackingDetailInner />
    </Suspense>
  );
}
