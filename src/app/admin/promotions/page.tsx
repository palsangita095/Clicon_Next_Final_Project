"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAdminPromotions,
  useCreateAdminPromotion,
  useTogglePromotionActive,
  useDeleteAdminPromotion,
} from "@/hooks/queries/admin/useAdminStorePromotions";
import { PromotionPayload } from "@/api/api-function/adminPromotions.function";
import { Plus, X, Percent, Tag, Calendar, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Promotion {
  id: string;
  name: string;
  code: string;
  discount_percent: number;
  discount_amount: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  min_order_amount: number;
  usage_limit: number;
  usage_count: number;
}

export default function AdminPromotionsPage() {
  const { data: fetchedPromotions, isLoading } = useAdminPromotions();
  const createPromotionMutation = useCreateAdminPromotion();
  const toggleActiveMutation = useTogglePromotionActive();
  const deletePromotionMutation = useDeleteAdminPromotion();

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    discount_percent: 0,
    discount_amount: 0,
    is_active: true,
    starts_at: "",
    expires_at: "",
    min_order_amount: 0,
    usage_limit: 0,
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (fetchedPromotions) setPromotions(fetchedPromotions as Promotion[]);
  }, [fetchedPromotions]);

  const savePromotion = async () => {
    setFormError(null);
    if (!form.name.trim() || !form.code.trim()) { setFormError("Name and code are required."); return; }
    if (form.discount_percent < 0 || form.discount_percent > 100) { setFormError("Discount percent must be 0-100."); return; }
    setSaving(true);
    const payload: PromotionPayload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      discount_percent: form.discount_percent,
      discount_amount: form.discount_amount,
      is_active: form.is_active,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      min_order_amount: form.min_order_amount,
      usage_limit: form.usage_limit,
    };
    try {
      await createPromotionMutation.mutateAsync(payload);
      setSaving(false);
      toast.success("Promotion created successfully.");
    } catch (error: any) {
      setSaving(false);
      if (error?.code === "23505") setFormError("Duplicate coupon code. This code already exists.");
      else setFormError(error?.message ?? "Failed to create promotion.");
      return;
    }
    setShowForm(false);
    setForm({ name: "", code: "", discount_percent: 0, discount_amount: 0, is_active: true, starts_at: "", expires_at: "", min_order_amount: 0, usage_limit: 0 });
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await toggleActiveMutation.mutateAsync({ id, current });
      setPromotions((state) => state.map((p) => (p.id === id ? { ...p, is_active: !current } : p)));
      toast.success(current ? "Promotion disabled." : "Promotion enabled.");
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to update promotion.");
    }
  };

  const deletePromotion = async (id: string) => {
    toast("Delete this promotion?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deletePromotionMutation.mutateAsync(id);
            setPromotions((state) => state.filter((p) => p.id !== id));
            toast.success("Promotion deleted.");
          } catch (error: any) {
            toast.error(error?.message ?? "Failed to delete promotion.");
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  const filtered = promotions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Promotions & Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Create discount campaigns and coupon codes.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-brand-orange hover:bg-orange-600 font-bold gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "New Promotion"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-[#1E293B] flex items-center gap-2"><Percent className="w-5 h-5 text-brand-orange" /> Create Coupon Campaign</h2>
          {formError && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100">{formError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-xs font-medium text-gray-700">Campaign Name</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Sale" className="h-10" /></div>
            <div><label className="text-xs font-medium text-gray-700">Coupon Code</label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SUMMER20" className="h-10 font-mono uppercase" /></div>
            <div><label className="text-xs font-medium text-gray-700">Discount %</label><Input type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })} className="h-10" /></div>
            <div><label className="text-xs font-medium text-gray-700">Fixed Discount (₹)</label><Input type="number" value={form.discount_amount} onChange={(e) => setForm({ ...form, discount_amount: Number(e.target.value) })} className="h-10" /></div>
            <div><label className="text-xs font-medium text-gray-700">Min Order (₹)</label><Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })} className="h-10" /></div>
            <div><label className="text-xs font-medium text-gray-700">Usage Limit (0 = unlimited)</label><Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: Number(e.target.value) })} className="h-10" /></div>
            <div><label className="text-xs font-medium text-gray-700">Start Date</label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="h-10" /></div>
            <div><label className="text-xs font-medium text-gray-700">End Date</label><Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="h-10" /></div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-brand-orange" /><span className="text-sm font-medium text-gray-700">Active on creation</span></label>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={savePromotion} disabled={saving} className="bg-brand-orange hover:bg-orange-600 font-bold h-10">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Tag className="w-4 h-4 mr-2" /> Create Promotion</>}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-50 flex items-center gap-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input placeholder="Search promotions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-9 border-gray-200 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 font-medium bg-gray-50/50">
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Campaign</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Valid</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">{search ? "No matching promotions." : "No promotions yet. Create your first campaign."}</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-brand-orange">{p.code}</td>
                    <td className="px-6 py-4 text-[#1E293B] font-medium">{p.name}</td>
                    <td className="px-6 py-4">
                      {p.discount_percent > 0 ? `${p.discount_percent}%` : ""}
                      {p.discount_percent > 0 && p.discount_amount > 0 ? " + " : ""}
                      {p.discount_amount > 0 ? `₹${p.discount_amount}` : ""}
                      {p.discount_percent === 0 && p.discount_amount === 0 ? "None" : ""}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{p.usage_count}/{p.usage_limit || '∞'}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {p.expires_at ? new Date(p.expires_at).toLocaleDateString('en-US') : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${p.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {p.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleActive(p.id, p.is_active)} className="text-xs text-gray-500 hover:text-brand-orange">{p.is_active ? 'Disable' : 'Enable'}</button>
                        <button onClick={() => deletePromotion(p.id)} className="text-xs text-gray-500 hover:text-red-500">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
