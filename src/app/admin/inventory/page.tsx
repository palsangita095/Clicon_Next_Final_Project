"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdminInventory, useUpdateProductStock } from "@/hooks/queries/admin/useAdminStoreInventory";
import { fixImageUrl } from "@/lib/imageFallback";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Boxes, Search } from "lucide-react";

interface InventoryProduct {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  status: string;
  image_urls: string[] | null;
  category: { name: string } | null;
}

const LOW_STOCK_LIMIT = 10;

export default function AdminInventoryPage() {
  const { data: fetchedProducts, isLoading } = useAdminInventory();
  const updateStockMutation = useUpdateProductStock();

  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [search, setSearch] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draftStock, setDraftStock] = useState<Record<string, number>>({});

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    const normalizedProducts = (fetchedProducts ?? []) as InventoryProduct[];
    setProducts(normalizedProducts);
    setDraftStock(
      normalizedProducts.reduce<Record<string, number>>((acc, product) => {
        acc[product.id] = product.stock_quantity;
        return acc;
      }, {}),
    );
  }, [fetchedProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesLowStock = !onlyLowStock || product.stock_quantity <= LOW_STOCK_LIMIT;
      return matchesSearch && matchesLowStock;
    });
  }, [products, search, onlyLowStock]);

  const stats = useMemo(() => {
    const totalStock = products.reduce((acc, product) => acc + product.stock_quantity, 0);
    const lowStock = products.filter((product) => product.stock_quantity > 0 && product.stock_quantity <= LOW_STOCK_LIMIT).length;
    const outOfStock = products.filter((product) => product.stock_quantity <= 0).length;
    return { totalStock, lowStock, outOfStock };
  }, [products]);

  const updateStock = async (productId: string) => {
    setSavingId(productId);
    const quantity = Math.max(0, draftStock[productId] ?? 0);
    try {
      await updateStockMutation.mutateAsync({ productId, quantity });
      setProducts((state) =>
        state.map((product) =>
          product.id === productId ? { ...product, stock_quantity: quantity } : product,
        ),
      );
      setDraftStock((state) => ({ ...state, [productId]: quantity }));
      toast.success("Stock updated successfully.");
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to update stock.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor stock levels and respond to low-stock alerts.</p>
        </div>
        <Button
          onClick={() => setOnlyLowStock((value) => !value)}
          variant={onlyLowStock ? "default" : "outline"}
          className={onlyLowStock ? "bg-brand-orange hover:bg-orange-600" : "border-gray-200"}
        >
          <AlertTriangle className="w-4 h-4 mr-2" /> Low Stock
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Units", value: stats.totalStock, tone: "text-[#1E293B]" },
          { label: "Low Stock", value: stats.lowStock, tone: "text-yellow-600" },
          { label: "Out of Stock", value: stats.outOfStock, tone: "text-red-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
              <h3 className={`text-2xl font-bold ${stat.tone}`}>{stat.value}</h3>
            </div>
            <Boxes className="w-8 h-8 text-brand-orange" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-50 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="font-bold text-[#1E293B]">Stock Levels</h2>
          <div className="relative w-full md:w-72">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="pl-10 h-10 border-gray-200" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 font-medium bg-gray-50/50">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Alert</th>
                <th className="px-6 py-4">Adjust</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">Loading...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">No inventory records found.</td></tr>
              ) : (
                filteredProducts.map((product) => {
                  const out = product.stock_quantity <= 0;
                  const low = !out && product.stock_quantity <= LOW_STOCK_LIMIT;

                  return (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gray-100 rounded relative overflow-hidden flex-shrink-0">
                            {product.image_urls?.[0] && <Image src={fixImageUrl(product.image_urls[0], product.name)} alt={product.name} fill sizes="40px" className="object-cover" />}
                          </div>
                          <Link href={`/admin/products/${product.id}`} className="font-medium text-[#1E293B] hover:text-brand-orange line-clamp-1">
                            {product.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{product.category?.name ?? "Uncategorized"}</td>
                      <td className="px-6 py-4 font-medium text-[#1E293B]">{product.stock_quantity}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          out ? "bg-red-50 text-red-600" : low ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-600"
                        }`}>
                          {out ? "Out of Stock" : low ? "Low Stock" : "Healthy"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          min={0}
                          value={draftStock[product.id] ?? 0}
                          onChange={(event) => setDraftStock((state) => ({ ...state, [product.id]: Number(event.target.value) }))}
                          className="w-24 h-9"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button onClick={() => updateStock(product.id)} disabled={savingId === product.id} className="bg-brand-orange hover:bg-orange-600 h-9">
                          Save
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
