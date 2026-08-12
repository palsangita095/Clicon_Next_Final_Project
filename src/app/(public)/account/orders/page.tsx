"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Order {
  id: string;
  status: string;
  created_at: string;
  total_amount: number;
  order_items: { id: string }[];
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        let { data } = await supabase
          .from("orders")
          .select("id, status, created_at, total_amount, order_items(id)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!data || data.length === 0) {
          const { data: emailData } = await supabase
            .from("orders")
            .select("id, status, created_at, total_amount, order_items(id)")
            .filter("billing_address->>email", "eq", user.email)
            .order("created_at", { ascending: false });
          if (emailData && emailData.length > 0) data = emailData;
        }

        if (!data || data.length === 0) {
          const { data: allData } = await supabase
            .from("orders")
            .select("id, status, created_at, total_amount, order_items(id), billing_address, user_id")
            .order("created_at", { ascending: false })
            .limit(50);
          if (allData) {
            const matched = allData.filter((o: any) => {
              if (o.user_id === user.id) return true;
              const ba = o.billing_address;
              if (ba && typeof ba === "object" && (ba as any).email === user.email) return true;
              return false;
            });
            if (matched.length > 0) data = matched;
          }
        }

        if (data) setOrders(data);
      }

      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
      case "Processing":
      case "Shipping":
        return "text-yellow-500";
      case "Completed":
      case "Delivered":
        return "text-green-500";
      case "Cancelled":
      case "Refund":
        return "text-red-500";
      default:
        return "text-gray-900";
    }
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE));
  const paginatedOrders = orders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const activeOrder = orders.find((order) => ["Pending", "Processing", "Shipping"].includes(order.status));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-6">ORDER HISTORY</h2>

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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">You have no orders yet.</td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-4 font-medium text-gray-900">#{order.id.split("-")[0].toUpperCase()}</td>
                    <td className={`py-4 font-medium ${getStatusColor(order.status)} uppercase`}>{order.status}</td>
                    <td className="py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString('en-US')}</td>
                    <td className="py-4 text-gray-700">
                      ${Number(order.total_amount).toFixed(2)} ({order.order_items?.length || 0} Products)
                    </td>
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

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-brand-orange hover:bg-orange-50 hover:border-brand-orange transition-colors disabled:opacity-30">
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-full flex items-center justify-center font-medium shadow-sm ${p === page ? 'bg-brand-orange text-white' : 'border border-gray-200 text-brand-orange hover:bg-orange-50'}`}>
                {String(p).padStart(2, "0")}
              </button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-brand-orange hover:bg-orange-50 hover:border-brand-orange transition-colors disabled:opacity-30">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {activeOrder && (
        <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center">
            <div className="bg-yellow-500 text-white px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              IN PROGRESS
            </div>
            <div className="flex-1 px-6 py-3 flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500 mr-2">Order ID:</span>
                <span className="font-bold text-gray-900 text-sm">#{activeOrder.id.split("-")[0].toUpperCase()}</span>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-xs text-gray-500">
                  {new Date(activeOrder.created_at).toLocaleString()} · {activeOrder.order_items?.length || 0} Products
                </span>
              </div>
              <Link href={`/account/orders/${activeOrder.id}`} className="text-brand-orange hover:underline">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="px-6 pb-3">
            <span className="text-sm font-bold text-brand-orange">₹{Number(activeOrder.total_amount).toFixed(2)} INR</span>
          </div>
        </div>
      )}
    </div>
  );
}
