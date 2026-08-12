"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Tag as TagIcon, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAdminBrands, useDeleteAdminBrand } from "@/hooks/queries/admin/useAdminStoreBrands";

interface Brand {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  category?: { name: string } | null;
  categories?: string[];
  product_count?: number;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Brand | null>(null);

  const { data: brandsData, isLoading } = useAdminBrands();
  const deleteBrandMutation = useDeleteAdminBrand();

  useEffect(() => {
    if (isLoading) return;
    setBrands((brandsData as Brand[]) ?? []);
    setLoading(false);
  }, [brandsData, isLoading]);

  const confirmDelete = async (brand: Brand) => {
    setDeleting(true);
    try {
      await deleteBrandMutation.mutateAsync(brand.id);
      toast.success("Brand deleted.");
    } catch (error: any) {
      toast.error("Failed to delete brand: " + (error.message ?? "Unknown error"));
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const filteredBrands = useMemo(
    () => brands.filter((brand) => brand.name.toLowerCase().includes(search.toLowerCase())),
    [brands, search],
  );

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Brands</h1>
        <p className="text-sm text-gray-500 mt-1">Manage brands shown in the storefront (e.g. Popular Brands on the shop page).</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-50 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-brand-orange" />
            <h2 className="font-bold text-[#1E293B]">All Brands ({brands.length})</h2>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search brands..." className="pl-10 h-10 border-gray-200" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 font-medium bg-gray-50/50">
                <th scope="col" className="px-6 py-4">Brand</th>
                <th scope="col" className="px-6 py-4">Slug</th>
                <th scope="col" className="px-6 py-4">Category</th>
                <th scope="col" className="px-6 py-4">Products</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-500">Loading...</td></tr>
              ) : filteredBrands.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-500">No brands found.</td></tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-[#1E293B]">{brand.name}</td>
                    <td className="px-6 py-4 text-gray-500">{brand.slug}</td>
                    <td className="px-6 py-4 text-gray-500">{brand.categories?.length ? brand.categories.join(", ") : "General"}</td>
                    <td className="px-6 py-4 text-gray-500">{brand.product_count ?? 0}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setDeleteConfirm(brand)} className="text-gray-400 hover:text-red-500" aria-label={`Delete brand ${brand.name}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="delete-brand-title" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 id="delete-brand-title" className="text-lg font-bold text-gray-900">Delete Brand</h3>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
            </p>
            {deleteConfirm.product_count ? (
              <p className="text-xs text-amber-600 mb-4 bg-amber-50 rounded-lg px-3 py-2">
                {deleteConfirm.product_count} product(s) are linked to this brand. They will be unlinked (not deleted).
              </p>
            ) : (
              <p className="text-xs text-gray-400 mb-4">This action cannot be undone.</p>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="h-10">Cancel</Button>
              <Button onClick={() => confirmDelete(deleteConfirm)} disabled={deleting} className="bg-red-500 hover:bg-red-600 text-white h-10 font-bold">
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}