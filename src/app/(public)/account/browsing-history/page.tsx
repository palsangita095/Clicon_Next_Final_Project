"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, RefreshCw, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fixImageUrl } from "@/lib/imageFallback";

interface HistoryItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  viewed_at: string;
}

export default function BrowsingHistoryPage() {
  const [historyEnabled, setHistoryEnabled] = useState(true);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) { setLoading(false); return; }

      const baseQuery = () =>
        supabase
          .from("orders")
          .select("id, created_at, order_items(id, product_id, quantity, price_at_time, products(id, name, image_urls))")
          .order("created_at", { ascending: false })
          .limit(50);

      const mapOrders = (orders: any): HistoryItem[] => {
        const mapped: HistoryItem[] = [];
        for (const order of orders) {
          for (const oi of (order as any).order_items || []) {
            const p = oi.products;
            if (p) {
              mapped.push({
                id: oi.id,
                product_id: p.id,
                name: p.name,
                price: oi.price_at_time,
                quantity: oi.quantity,
                image: (p.image_urls && p.image_urls[0]) || "https://placehold.co/150x150",
                viewed_at: order.created_at,
              });
            }
          }
        }
        return mapped;
      };

      let result: HistoryItem[] = [];

      const { data: byUser } = await baseQuery().eq("user_id", user.id);
      if (byUser) result = mapOrders(byUser);

      if (result.length === 0 && user.email) {
        const { data: byEmail } = await baseQuery().filter("billing_address->>email", "eq", user.email);
        if (byEmail) result = mapOrders(byEmail);
      }

      setItems(result);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const filtered = items.filter((item) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFilter) {
      const itemDate = new Date(item.viewed_at).toISOString().slice(0, 10);
      const filterDate = dateFilter.split("/").reverse().join("-");
      if (itemDate !== filterDate) return false;
    }
    return true;
  });

  const groups: { date: string; items: HistoryItem[] }[] = [];
  const dateMap = new Map<string, HistoryItem[]>();
  for (const item of filtered) {
    const d = new Date(item.viewed_at);
    const key = `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("default", { month: "short" }).toUpperCase()}, ${d.getFullYear()}`;
    if (!dateMap.has(key)) dateMap.set(key, []);
    dateMap.get(key)!.push(item);
  }
  for (const [date, itms] of dateMap) {
    groups.push({ date, items: itms });
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-md border border-gray-100 p-16 shadow-sm text-center">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Sign in to view your browsing history</h2>
          <p className="text-gray-500 mb-6">Your purchase history will appear here once you sign in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-gray-900">Purchase History</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show History</span>
            <button
              onClick={() => setHistoryEnabled(!historyEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${historyEnabled ? 'bg-brand-orange' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${historyEnabled ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Search & Date Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search in purchase history"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10 border-gray-200"
            />
          </div>
          <div className="relative w-full sm:w-56">
            <Calendar className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-11 pl-10 border-gray-200"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        )}

        {/* Date Groups */}
        {!loading && historyEnabled && groups.length > 0 && (
          <div className="space-y-10">
            {groups.map((group, groupIdx) => (
              <div key={groupIdx}>
                <div className="border-b border-gray-100 pb-3 mb-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{group.date}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {group.items.map((item, idx) => (
                    <Link key={idx} href={`/products/${item.product_id}`} className="cursor-pointer group">
                      <div className="border border-gray-100 rounded-md p-4 hover:shadow-md transition-shadow relative">
                        <div className="relative w-full h-36 mb-4">
                          <Image src={fixImageUrl(item.image)} alt={item.name} fill sizes="80px" className="object-contain" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-sm text-gray-700 mb-1.5 line-clamp-2 leading-snug group-hover:text-brand-orange transition-colors">{item.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-500">₹{Number(item.price).toLocaleString()}</span>
                          <span className="text-xs text-gray-400">x{item.quantity}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Subtotal: ₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && historyEnabled && groups.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">No purchase history found.</p>
          </div>
        )}

        {/* Load More */}
        {groups.length > 0 && (
          <div className="flex justify-center mt-10">
            <Button variant="outline" className="border-brand-orange text-brand-orange hover:bg-orange-50 font-bold h-11 px-8 uppercase tracking-wide">
              <RefreshCw className="w-4 h-4 mr-2" /> LOAD MORE
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
