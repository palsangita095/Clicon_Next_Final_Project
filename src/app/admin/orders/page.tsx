"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Search,
  ArrowUpRight, 
  ArrowDownRight, 
  MoreHorizontal,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Eye
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts";
import {
  useAdminOrderMetrics,
  useAdminOrders,
  useUpdateOrderStatus,
  useUpdateOrderAddress,
  useDeleteOrder,
} from "@/hooks/queries/admin/useAdminStoreOrders";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useAdminOrdersRealtime } from "@/hooks/realtime/useOrderRealtime";
import { OrderStatus } from "@/types/database.types";

const ITEMS_PER_PAGE = 5;

export default function AdminOrdersPage() {
  const [dateRange] = useState(() => {
    const now = new Date();
    const start = new Date(now); start.setDate(now.getDate() - 28);
    return `${start.toLocaleDateString('en-US')} - ${now.toLocaleDateString('en-US')}`;
  });
  const { data: ordersData, isLoading: isLoadingOrders } = useAdminOrders();
  const { data: metricsData } = useAdminOrderMetrics();
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const updateOrderAddressMutation = useUpdateOrderAddress();
  const deleteOrderMutation = useDeleteOrder();

  useAdminOrdersRealtime();

  const [realOrders, setRealOrders] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [metrics, setMetrics] = useState([
    { label: "Revenue", value: "₹0", change: "0%", isPositive: true, data: [0, 0, 0] },
    { label: "Orders", value: "0", change: "0%", isPositive: true, data: [0, 0, 0] },
    { label: "Visitors", value: "0", change: "0%", isPositive: true, data: [0, 0, 0] },
    { label: "Conversion", value: "0%", change: "0%", isPositive: true, data: [0, 0, 0] },
  ]);
  const [ordersUpdateData, setOrdersUpdateData] = useState<{ name: string; value: number }[]>([
    { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 0 },
    { name: 'Thu', value: 0 }, { name: 'Fri', value: 0 }, { name: 'Sat', value: 0 }, { name: 'Sun', value: 0 },
  ]);

 
  const [editModalOrder, setEditModalOrder] = useState<any>(null);
  const [editAddress, setEditAddress] = useState({ address: "", city: "", state: "", zip: "" });

  useEffect(() => {
    if (ordersData) setRealOrders(ordersData);
  }, [ordersData]);

  useEffect(() => {
    if (!metricsData) return;
    const { totalRevenue, totalOrders, totalUsers, lastWeekOrders } = metricsData;
    setMetrics([
      { label: "Revenue", value: `₹${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, change: "+0%", isPositive: true, data: [totalRevenue > 0 ? 4 : 0, 1] },
      { label: "Orders", value: `${totalOrders || 0}`, change: "0%", isPositive: true, data: [totalOrders || 0, 0] },
      { label: "Visitors", value: `${totalUsers || 0}`, change: "0%", isPositive: true, data: [totalUsers || 0, 0] },
      { label: "Conversion", value: totalOrders && totalUsers ? `${((totalOrders / totalUsers) * 100).toFixed(1)}%` : "0%", change: `+${lastWeekOrders || 0}%`, isPositive: true, data: [totalOrders || 0, lastWeekOrders || 0] },
    ]);
  }, [metricsData]);

  useEffect(() => {
    const weekDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const count = (realOrders || []).filter((o: any) => o.created_at?.startsWith(dayStr)).length;
      weekDays.push({ name: d.toLocaleDateString('en-US', { weekday: 'short' }), value: count });
    }
    setOrdersUpdateData(weekDays);
  }, [realOrders]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatusMutation.mutate(
      { orderId, status: newStatus },
      {
        onSuccess: () => toast.success(`Order status updated to ${newStatus}.`),
        onError: (err: Error) => toast.error(err?.message || "Failed to update order status."),
      },
    );
  };

  const handleEditAddress = () => {
    if (!editModalOrder) return;
    const existingAddress = editModalOrder.billing_address || {};
    const mergedAddress = { ...(typeof existingAddress === 'object' ? existingAddress : {}), ...editAddress };
    updateOrderAddressMutation.mutate(
      { orderId: editModalOrder.id, billingAddress: mergedAddress },
      {
        onSuccess: () => toast.success("Order address updated."),
        onError: (err: Error) => toast.error(err?.message || "Failed to update address."),
      },
    );
    setEditModalOrder(null);
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrderMutation.mutate(orderId, {
      onSuccess: () => toast.success("Order deleted."),
      onError: (err: Error) => toast.error(err?.message || "Failed to delete order."),
    });
  };

  const openEditModal = (order: any) => {
    const addr = typeof order.billing_address === 'object' && order.billing_address ? order.billing_address : {};
    setEditAddress({ address: addr.address || "", city: addr.city || "", state: addr.state || "", zip: addr.zip || "" });
    setEditModalOrder(order);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "text-red-500";
      case "Processing": return "text-orange-500";
      case "Shipping": return "text-gray-900";
      case "Delivered": return "text-green-500";
      case "Completed": return "text-green-500";
      case "Cancelled": return "text-gray-400";
      case "Refund": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };

  const filteredOrders = realOrders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const idMatch = o.id.toLowerCase().includes(q);
    const nameMatch = (o.profile?.full_name || "").toLowerCase().includes(q);
    const emailMatch = (o.profile?.email || "").toLowerCase().includes(q);
    return idMatch || nameMatch || emailMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 pb-12">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B]">Orders</h1>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-200 rounded-md px-4 py-2 text-sm text-gray-600 flex items-center gap-2 cursor-pointer shadow-sm">
            {dateRange}
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{metric.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-sm font-bold flex items-center gap-1 ${metric.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change}
                {metric.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </span>
              <div className="h-10 w-20 mt-2">
                {mounted && <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metric.data.map((val, i) => ({ val, i }))}>
                    <Line type="monotone" dataKey="val" stroke={metric.isPositive ? "#FF8C00" : "#EF4444"} strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>}
              </div>
            </div>
          </div>
        ))}
      </div>

      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-orange"></div>
            <h3 className="font-bold text-[#1E293B]">Orders Update (Last 7 Days)</h3>
          </div>
        </div>
        <div className="h-72">
          {mounted && <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ordersUpdateData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#FF8C00" strokeWidth={3} dot={{ r: 4, fill: "#FF8C00", stroke: "#fff", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>}
        </div>
      </div>

    
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50">
          <h3 className="font-bold text-[#1E293B] text-lg">All Orders</h3>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input placeholder="Search by ID, name, or email..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="pl-10 h-9 border-gray-200 text-sm" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 font-medium bg-gray-50/50">
                <th scope="col" className="px-6 py-4">Order ID</th>
                <th scope="col" className="px-6 py-4">Products</th>
                <th scope="col" className="px-6 py-4">Date</th>
                <th scope="col" className="px-6 py-4">Customer</th>
                <th scope="col" className="px-6 py-4">Revenue</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingOrders ? (
                <tr><td colSpan={7} className="py-12 text-center"><div className="flex justify-center"><div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div></div></td></tr>
              ) : paginatedOrders.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">{searchQuery ? "No orders match your search." : "No orders found in database."}</td></tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-[#1E293B]">#{order.id.split('-')[0]}</td>
                    <td className="px-6 py-4"><span className="text-xs text-gray-500">{order.order_items?.length || 0} Items</span></td>
                    <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString('en-US')}</td>
                    <td className="px-6 py-4 text-[#1E293B] font-medium">{order.profile?.full_name || order.profile?.email || 'Guest'}</td>
                    <td className="px-6 py-4 text-gray-500">₹{Number(order.total_amount).toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium">
                      <select value={order.status} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-sm font-medium bg-transparent border border-gray-200 rounded px-1 py-0.5 cursor-pointer focus:outline-none ${getStatusColor(order.status)}`}>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipping">Shipping</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Refund">Refund</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3 text-gray-400">
                        <button onClick={() => openEditModal(order)} className="hover:text-brand-orange" title="Edit Address" aria-label="Edit order address"><Edit2 className="w-4 h-4" /></button>
                        <Link href={`/account/orders/${order.id}`} className="hover:text-blue-500" title="View Order" aria-label="View order details"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => toast("Delete this order?", { description: "This action cannot be undone.", action: { label: "Delete", onClick: () => handleDeleteOrder(order.id) }, cancel: { label: "Cancel", onClick: () => {} } })} className="hover:text-red-500" title="Delete Order" aria-label="Delete order"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        
        {!isLoadingOrders && filteredOrders.length > 0 && (
          <div className="p-4 border-t border-gray-50 flex justify-between items-center text-sm text-gray-500">
            <span>Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30" aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded ${p === page ? 'bg-brand-orange text-white' : 'hover:bg-gray-100'}`} aria-label={`Go to page ${p}`} aria-current={p === page ? "page" : undefined}>{p}</button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30" aria-label="Next page"><ChevronRightIcon className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

     
      {editModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Address</h3>
              <button onClick={() => setEditModalOrder(null)} className="text-gray-400 hover:text-gray-600" aria-label="Close modal"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label htmlFor="order-address" className="text-xs font-medium text-gray-700">Address</label><input id="order-address" value={editAddress.address} onChange={(e) => setEditAddress({ ...editAddress, address: e.target.value })} className="w-full h-10 border border-gray-200 rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange mt-1" /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><label htmlFor="order-city" className="text-xs font-medium text-gray-700">City</label><input id="order-city" value={editAddress.city} onChange={(e) => setEditAddress({ ...editAddress, city: e.target.value })} className="w-full h-10 border border-gray-200 rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange mt-1" /></div>
                <div><label htmlFor="order-state" className="text-xs font-medium text-gray-700">State</label><input id="order-state" value={editAddress.state} onChange={(e) => setEditAddress({ ...editAddress, state: e.target.value })} className="w-full h-10 border border-gray-200 rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange mt-1" /></div>
                <div><label htmlFor="order-zip" className="text-xs font-medium text-gray-700">Zip</label><input id="order-zip" value={editAddress.zip} onChange={(e) => setEditAddress({ ...editAddress, zip: e.target.value })} className="w-full h-10 border border-gray-200 rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange mt-1" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setEditModalOrder(null)} className="h-10">Cancel</Button>
              <Button onClick={handleEditAddress} className="bg-brand-orange hover:bg-orange-600 text-white h-10 font-bold">Save Address</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
