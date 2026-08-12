"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  useAdminUsers,
  useUserDetail,
  useUpdateUserAccountStatus,
  useReplyToSupportQuery,
} from "@/hooks/queries/admin/useAdminStoreUsers";

const ITEMS_PER_PAGE = 10;

const resolveAccountStatus = (user: any) =>
  user.account_status || (user.is_active === false ? "suspended" : "active");

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "banned": return "bg-red-50 text-red-600";
    case "suspended": return "bg-yellow-50 text-yellow-700";
    default: return "bg-green-50 text-green-600";
  }
};

const getStatusBadgeLabel = (status: string) => {
  switch (status) {
    case "banned": return "Banned";
    case "suspended": return "Suspended";
    default: return "Active";
  }
};

export default function AdminUsersPage() {
  const { data: adminData, isLoading: loading } = useAdminUsers();
  const updateUserAccountStatusMutation = useUpdateUserAccountStatus();
  const replyToSupportQueryMutation = useReplyToSupportQuery();

  const [users, setUsers] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [joinDateFilter, setJoinDateFilter] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [queryPage, setQueryPage] = useState(1);
  const [replyModal, setReplyModal] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [detailUser, setDetailUser] = useState<any>(null);
  const { data: detailData, isLoading: detailLoading } = useUserDetail(detailUser?.id ?? null);

  useEffect(() => {
    if (adminData) {
      setUsers(adminData.users);
      setQueries(adminData.queries);
    }
  }, [adminData]);

  const updateAccountStatus = async (user: any, newStatus: string) => {
    try {
      await updateUserAccountStatusMutation.mutateAsync({ userId: user.id, newStatus });
    } catch (err: any) {
      console.error("Failed to update account status:", err);
      toast.error(err?.message || "Failed to update account status. Check admin permissions.");
      return;
    }
    const updated = { ...user, account_status: newStatus, is_active: newStatus === "active" };
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    if (detailUser?.id === user.id) setDetailUser(updated);
    toast.success(`Account marked as ${getStatusBadgeLabel(newStatus)}`);
  };

  const openDetail = (user: any) => {
    setDetailUser(user);
  };

  const handleReply = async () => {
    if (!replyModal || !replyText.trim()) return;
    setSendingReply(true);
    try {
      await replyToSupportQueryMutation.mutateAsync({ queryId: replyModal.id, reply: replyText });
      setReplyModal(null);
      setReplyText("");
    } catch {
      // keep modal open on failure
    }
    setSendingReply(false);
  };

  const formatAddress = (addr: any): string[] => {
    if (!addr || typeof addr !== "object") return ["No address on file"];
    const lines = [];
    const fullName = [addr.firstName, addr.lastName].filter(Boolean).join(" ");
    if (fullName) lines.push(fullName);
    if (addr.address) lines.push(addr.address);
    const cityLine = [addr.city, addr.region, addr.country, addr.zipCode].filter(Boolean).join(", ");
    if (cityLine) lines.push(cityLine);
    if (addr.phone) lines.push(`Phone: ${addr.phone}`);
    if (addr.email) lines.push(`Email: ${addr.email}`);
    return lines.length ? lines : ["No address on file"];
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchesQuery = !q ||
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q);
    const matchesStatus = !statusFilter || resolveAccountStatus(u) === statusFilter;
    const matchesJoin = !joinDateFilter || (u.created_at && u.created_at.slice(0, 10) >= joinDateFilter);
    return matchesQuery && matchesStatus && matchesJoin;
  });
  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice((userPage - 1) * ITEMS_PER_PAGE, userPage * ITEMS_PER_PAGE);

  const totalQueryPages = Math.max(1, Math.ceil(queries.length / ITEMS_PER_PAGE));
  const paginatedQueries = queries.slice((queryPage - 1) * ITEMS_PER_PAGE, queryPage * ITEMS_PER_PAGE);

  const detailAddr = detailUser && (
    (detailUser.billing_address && Object.keys(detailUser.billing_address || {}).length)
      ? detailUser.billing_address
      : detailData?.orders?.[0]?.billing_address
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B]">Users</h1>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-50 flex flex-wrap items-center gap-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input placeholder="Search users..." value={userSearch} onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }} className="pl-10 h-9 border-gray-200 text-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setUserPage(1); }}
            className="h-9 border border-gray-200 rounded-md px-3 text-sm text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange cursor-pointer">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 whitespace-nowrap">Joined after:</span>
            <input type="date" value={joinDateFilter} onChange={(e) => { setJoinDateFilter(e.target.value); setUserPage(1); }}
              className="h-9 border border-gray-200 rounded-md px-3 text-sm text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 font-medium border-b border-gray-50">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No users found</td></tr>
              ) : (
                paginatedUsers.map((user) => {
                  const status = resolveAccountStatus(user);
                  return (
                    <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-[#1E293B]">{user.full_name || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-500">{user.email || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-500 capitalize">{user.role || "customer"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${getStatusBadgeClass(status)}`}>
                          {getStatusBadgeLabel(status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(user.created_at).toLocaleDateString('en-US')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <select value={status} onChange={(e) => updateAccountStatus(user, e.target.value)}
                            className="text-xs font-medium bg-transparent border border-gray-200 rounded px-1 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-orange">
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="banned">Banned</option>
                          </select>
                          <button onClick={() => openDetail(user)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-brand-orange" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredUsers.length > 0 && (
          <div className="p-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
            <span>Showing {(userPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(userPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setUserPage(Math.max(1, userPage - 1))} disabled={userPage === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-3 h-3" /></button>
              {Array.from({ length: Math.min(totalUserPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setUserPage(p)} className={`px-2 py-0.5 rounded ${p === userPage ? 'bg-brand-orange text-white' : 'hover:bg-gray-100'}`}>{p}</button>
              ))}
              <button onClick={() => setUserPage(Math.min(totalUserPages, userPage + 1))} disabled={userPage === totalUserPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-3 h-3" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Queries with Reply */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-50 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-orange" />
          <h2 className="font-bold text-[#1E293B]">Customer Queries ({queries.length})</h2>
        </div>
        {paginatedQueries.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No customer queries found.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {paginatedQueries.map((query) => (
              <div key={query.id} className="p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-[#1E293B]">{query.name || query.email}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${query.status === "resolved" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-700"}`}>
                        {query.status || "open"}
                      </span>
                    </div>
                    {query.subject && <p className="text-sm font-medium text-gray-700">{query.subject}</p>}
                    <p className="text-sm text-gray-500 mt-1">{query.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{query.email} &middot; {new Date(query.created_at).toLocaleString()}</p>
                    {query.reply && (
                      <div className="mt-3 pl-4 border-l-2 border-green-300 bg-green-50/50 p-3 rounded-r">
                        <p className="text-xs font-medium text-green-700 mb-1">Your Reply:</p>
                        <p className="text-sm text-gray-700">{query.reply}</p>
                        {query.replied_at && <p className="text-xs text-gray-400 mt-1">{new Date(query.replied_at).toLocaleString()}</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    {query.status !== "resolved" && (
                      <Button onClick={() => setReplyModal(query)} className="h-9 bg-brand-orange hover:bg-orange-600 text-sm gap-1">
                        <Send className="w-3 h-3" /> Reply
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {queries.length > 0 && (
          <div className="p-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
            <span>Showing {(queryPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(queryPage * ITEMS_PER_PAGE, queries.length)} of {queries.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setQueryPage(Math.max(1, queryPage - 1))} disabled={queryPage === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-3 h-3" /></button>
              {Array.from({ length: Math.min(totalQueryPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setQueryPage(p)} className={`px-2 py-0.5 rounded ${p === queryPage ? 'bg-brand-orange text-white' : 'hover:bg-gray-100'}`}>{p}</button>
              ))}
              <button onClick={() => setQueryPage(Math.min(totalQueryPages, queryPage + 1))} disabled={queryPage === totalQueryPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-3 h-3" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Reply to {replyModal.name}</h3>
              <button onClick={() => setReplyModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">Original Message:</p>
              <p className="text-sm text-gray-800">{replyModal.message}</p>
            </div>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange resize-none"
              placeholder="Type your reply..." />
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setReplyModal(null)} className="h-10">Cancel</Button>
              <Button onClick={handleReply} disabled={sendingReply || !replyText.trim()} className="bg-brand-orange hover:bg-orange-600 text-white h-10 font-bold gap-2">
                {sendingReply ? "Sending..." : <><Send className="w-4 h-4" /> Send Reply</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {detailUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between mb-5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold text-lg">
                  {(detailUser.full_name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{detailUser.full_name || "Unknown"}</h3>
                  <p className="text-sm text-gray-500">{detailUser.email || "No email"}</p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">Joined {detailUser.created_at ? new Date(detailUser.created_at).toLocaleDateString('en-US') : "N/A"} &middot; {detailUser.role || "customer"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${getStatusBadgeClass(resolveAccountStatus(detailUser))}`}>
                  {getStatusBadgeLabel(resolveAccountStatus(detailUser))}
                </span>
                <button onClick={() => setDetailUser(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 mb-5 flex-shrink-0">
              <span className="text-sm font-medium text-gray-700">Account Status:</span>
              <select value={resolveAccountStatus(detailUser)} onChange={(e) => updateAccountStatus(detailUser, e.target.value)}
                className="h-9 border border-gray-200 rounded-md px-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange cursor-pointer">
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5 flex-shrink-0">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Total Spend</p>
                <p className="text-xl font-bold text-[#1E293B]">₹{Number(detailData?.totalSpend || 0).toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Orders</p>
                <p className="text-xl font-bold text-[#1E293B]">{detailData?.orders?.length ?? 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Reviews</p>
                <p className="text-xl font-bold text-[#1E293B]">{detailData?.reviews?.length ?? 0}</p>
              </div>
            </div>

            <div className="overflow-y-auto space-y-6">
              {detailLoading ? (
                <p className="text-sm text-gray-500">Loading customer details...</p>
              ) : (
                <>
                  {/* Order History */}
                  <div>
                    <h4 className="font-bold text-[#1E293B] mb-3">Order History</h4>
                    {detailData?.orders?.length === 0 ? (
                      <p className="text-sm text-gray-500">No orders placed yet.</p>
                    ) : (
                      <div className="border border-gray-100 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-400 font-medium bg-gray-50/50">
                              <th className="px-4 py-3">Order</th>
                              <th className="px-4 py-3">Items</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailData?.orders.map((order: any) => (
                              <tr key={order.id} className="border-t border-gray-50">
                                <td className="px-4 py-3 font-medium text-[#1E293B]">#{order.id.split('-')[0]}</td>
                                <td className="px-4 py-3 text-gray-500">{order.order_items?.length || 0} items</td>
                                <td className="px-4 py-3">
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    order.status === "Delivered" || order.status === "Completed"
                                      ? "bg-green-50 text-green-600"
                                      : order.status === "Cancelled" || order.status === "Failed"
                                        ? "bg-gray-100 text-gray-500"
                                        : "bg-yellow-50 text-yellow-700"
                                  }`}>{order.status}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-500">₹{Number(order.total_amount).toFixed(2)}</td>
                                <td className="px-4 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString('en-US')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Address Book */}
                  <div>
                    <h4 className="font-bold text-[#1E293B] mb-3">Address Book</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {formatAddress(detailAddr).map((line, i) => (
                        <p key={i} className="text-sm text-gray-600">{line}</p>
                      ))}
                    </div>
                  </div>

                  {/* Submitted Reviews */}
                  <div>
                    <h4 className="font-bold text-[#1E293B] mb-3">Submitted Reviews</h4>
                    {detailData?.reviews?.length === 0 ? (
                      <p className="text-sm text-gray-500">No reviews submitted.</p>
                    ) : (
                      <div className="space-y-3">
                        {detailData?.reviews.map((review: any) => (
                          <div key={review.id} className="border border-gray-100 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-[#1E293B]">{review.products?.name || "Unknown product"}</p>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                review.moderation_status === "rejected"
                                  ? "bg-red-50 text-red-600"
                                  : review.is_approved
                                    ? "bg-green-50 text-green-600"
                                    : "bg-yellow-50 text-yellow-700"
                              }`}>
                                {review.moderation_status === "rejected" ? "Rejected" : review.is_approved ? "Approved" : "Pending"}
                              </span>
                            </div>
                            <p className="text-sm text-amber-500 mb-1">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                            {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                            <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString('en-US')}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
