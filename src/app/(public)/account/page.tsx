"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle2, ChevronRight, Eye, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fixImageUrl } from "@/lib/imageFallback";

export default function AccountDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        const { data: orderData } = await supabase
          .from("orders")
          .select("id, status, created_at, total_amount, order_items(id)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(7);

        setProfile(data || { full_name: user.email?.split('@')[0], email: user.email });
        setOrders(orderData ?? []);

       
        const { data: browsingData } = await supabase
          .from("browsing_history")
          .select("viewed_at, products(id, name, price, image_urls)")
          .eq("user_id", user.id)
          .order("viewed_at", { ascending: false })
          .limit(12);

        setRecentItems(
          (browsingData ?? [])
            .map((b: any) => {
              const p = b.products;
              return p ? { id: p.id, name: p.name, price: Number(p.price), image: p.image_urls?.[0] } : null;
            })
            .filter(Boolean)
        );

        const { data: cardData } = await supabase
          .from("saved_cards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        setSavedCards(
          (cardData ?? []).map((c: any) => ({
            ...c,
            number: c.card_number,
            name: c.card_name,
            type: "VISA",
          }))
        );
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  }

  const displayName = profile?.full_name || 'Customer';
  const pendingOrders = orders.filter((order) => ["Pending", "Processing", "Shipping"].includes(order.status)).length;
  const completedOrders = orders.filter((order) => ["Delivered", "Completed"].includes(order.status)).length;
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
      case "Processing":
      case "Shipping":
        return "text-yellow-500";
      case "Delivered":
      case "Completed":
        return "text-green-500";
      case "Cancelled":
      case "Refund":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="space-y-8">
      
      <div className="bg-white rounded-md border border-gray-100 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hello, {displayName}</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          From your account dashboard, you can easily check & view your{" "}
          <Link href="/account/orders" className="text-blue-500 hover:underline">Recent Orders</Link>, manage your{" "}
          <Link href="/account/cards-address" className="text-blue-500 hover:underline">Shipping and Billing Addresses</Link> and edit your{" "}
          <Link href="/account/settings" className="text-blue-500 hover:underline">Password</Link> and{" "}
          <Link href="/account/settings" className="text-blue-500 hover:underline">Account Details</Link>.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
      
        <div className="flex-1 bg-white rounded-md border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">ACCOUNT INFO</h3>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-gray-100 relative overflow-hidden flex items-center justify-center text-gray-400">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{profile?.address || "No address provided"}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <p><span className="font-medium text-gray-500">Email:</span> {profile?.email}</p>
            <p><span className="font-medium text-gray-500">Phone:</span> {profile?.phone_number || "No phone provided"}</p>
          </div>
          <Link href="/account/settings">
            <Button variant="outline" className="border-brand-orange text-brand-orange hover:bg-orange-50 font-bold text-xs uppercase tracking-wide h-10 px-6">
              EDIT ACCOUNT
            </Button>
          </Link>
        </div>

        
        <div className="flex-1 bg-white rounded-md border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">BILLING ADDRESS</h3>
          <div className="mb-5">
            <p className="font-bold text-gray-900 mb-3">{displayName}</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {profile?.billing_address?.address
                ? `${profile.billing_address.address}${profile.billing_address.city ? `, ${profile.billing_address.city}` : ""}${profile.billing_address.region ? `, ${profile.billing_address.region}` : ""}${profile.billing_address.country ? `, ${profile.billing_address.country}` : ""}${profile.billing_address.zipCode ? ` - ${profile.billing_address.zipCode}` : ""}`
                : "No address saved yet."}
            </p>
          </div>
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <p><span className="font-medium text-gray-500">Phone Number:</span> {profile?.phone_number || "Not provided"}</p>
            <p><span className="font-medium text-gray-500">Email:</span> {profile?.email}</p>
          </div>
          <Link href="/account/cards-address">
            <Button variant="outline" className="border-brand-orange text-brand-orange hover:bg-orange-50 font-bold text-xs uppercase tracking-wide h-10 px-6">
              EDIT ADDRESS
            </Button>
          </Link>
        </div>

        
        <div className="w-full lg:w-48 flex flex-col gap-4">
          <div className="bg-white rounded-md border border-gray-100 p-5 shadow-sm text-center">
            <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Orders</p>
          </div>
          <div className="bg-white rounded-md border border-gray-100 p-5 shadow-sm text-center">
            <p className="text-3xl font-bold text-gray-900">{String(pendingOrders).padStart(2, "0")}</p>
            <p className="text-xs text-gray-500 mt-1">Pending Orders</p>
          </div>
          <div className="bg-white rounded-md border border-gray-100 p-5 shadow-sm text-center">
            <p className="text-3xl font-bold text-gray-900">{completedOrders}</p>
            <p className="text-xs text-gray-500 mt-1">Completed Orders</p>
          </div>
        </div>
      </div>

        
      <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">PAYMENT OPTION</h3>
          <Link href="/account/cards-address" className="text-brand-orange text-sm font-medium hover:underline flex items-center gap-1">
            Add Card <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {savedCards.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm w-full">No saved cards yet.</div>
          ) : (
            savedCards.map((card: any, idx: number) => (
              <div key={idx} className="w-[280px] h-[160px] bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl p-5 flex flex-col justify-between flex-shrink-0 relative">
                <div className="flex justify-between items-start">
                  <p className="text-white text-xl font-bold">₹{card.balance || "0"}</p>
                  <button className="text-white/80 hover:text-white text-xl">⋯</button>
                </div>
                <div>
                  <p className="text-teal-100 text-[10px] uppercase tracking-wider mb-0.5">CARD NUMBER</p>
                  <p className="text-white text-sm tracking-widest mb-3">**** **** **** {card.number?.slice(-4) || "****"}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-lg">{card.type || "CARD"}</span>
                    <span className="text-white text-sm">{card.name || ""}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    
      <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">RECENT ORDER</h3>
          <Link href="/account/orders" className="text-brand-orange text-sm font-medium hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 uppercase text-xs tracking-wider border-b border-gray-100">
                <th className="pb-3 font-medium">ORDER ID</th>
                <th className="pb-3 font-medium">STATUS</th>
                <th className="pb-3 font-medium">DATE</th>
                <th className="pb-3 font-medium">TOTAL</th>
                <th className="pb-3 font-medium">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No recent orders yet.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-4 font-medium text-gray-900">#{order.id.split("-")[0].toUpperCase()}</td>
                    <td className={`py-4 font-medium ${getStatusColor(order.status)}`}>{order.status.toUpperCase()}</td>
                    <td className="py-4 text-gray-500">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="py-4 text-gray-700">₹{Number(order.total_amount).toFixed(2)} ({order.order_items?.length ?? 0} Products)</td>
                    <td className="py-4">
                      <Link href={`/account/orders/${order.id}`} className="text-blue-500 hover:underline flex items-center gap-1 text-xs font-medium">
                        View Details <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      
      <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">BROWSING HISTORY</h3>
          <Link href="/account/browsing-history" className="text-brand-orange text-sm font-medium hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {recentItems.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-400 text-sm">No browsing history yet. Browse some products to see them here.</div>
          )}
          {recentItems.map((item: any, idx: number) => (
            <Link key={idx} href={item.id ? `/products/${item.id}` : '#'} className="border border-gray-100 rounded-md p-4 hover:shadow-md transition-shadow cursor-pointer relative group block">
              <div className="relative w-full h-32 mb-4">
                <Image src={fixImageUrl(item.image || item.images?.[0] || "https://placehold.co/120x120")} alt={item.name || item.title || ""} fill sizes="80px" className="object-contain" />
              </div>
              <h4 className="text-sm text-gray-700 mb-2 line-clamp-2 leading-snug group-hover:text-brand-orange transition-colors">{item.name || item.title || ""}</h4>
              <p className="font-bold text-blue-500">₹{Number(item.price || item.sale_price || 0).toFixed(2)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
