"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Edit2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fixImageUrl } from "@/lib/imageFallback";
import { toast } from "sonner";
import {
  useAdminProducts,
  useDeleteAdminProduct,
  useRemoveProductTag,
} from "@/hooks/queries/admin/useAdminStoreProducts";

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  status: string;
  category: { name: string } | null;
  image_urls: string[];
  tags?: { id: string; name: string }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useAdminProducts();
  const deleteMutation = useDeleteAdminProduct();
  const removeTagMutation = useRemoveProductTag();

  useEffect(() => {
    if (data) {
      setProducts(
        (data as any[]).map((product) => ({
          ...product,
          category: Array.isArray(product.category)
            ? product.category[0] ?? null
            : product.category,
        }))
      );
    }
  }, [data]);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const deleteProduct = async (productId: string) => {
    toast("Delete this product?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteMutation.mutateAsync(productId);
            setProducts((prev) => prev.filter((product) => product.id !== productId));
            toast.success("Product deleted.");
          } catch (error: any) {
            toast.error(error?.message ?? "Failed to delete product.");
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  const removeTag = async (productId: string, tagId: string) => {
    await removeTagMutation.mutateAsync({ productId, tagId });
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              tags: product.tags?.filter((tag) => tag.id !== tagId) ?? [],
            }
          : product
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B]">Products</h1>
        <Link href="/admin/products/new">
          <Button className="bg-brand-orange hover:bg-orange-600 font-bold px-6 flex items-center gap-2 h-11">
            <Plus className="w-5 h-5" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 border-gray-200" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 font-medium bg-gray-50/50">
                <th className="px-6 py-4 rounded-tl-2xl">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex justify-center"><div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div></div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">No products found.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 relative overflow-hidden">
                          {product.image_urls?.[0] && <Image src={fixImageUrl(product.image_urls[0], product.name)} alt={product.name} fill sizes="40px" className="object-cover" />}
                        </div>
                        <span className="font-medium text-[#1E293B] line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{product.category?.name || "None"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-56">
                        {product.tags && product.tags.length > 0 ? (
                          product.tags.map((tag) => (
                            <span key={tag.id} className="inline-flex items-center gap-1 rounded-full bg-orange-50 text-brand-orange px-2 py-0.5 text-xs font-medium">
                              {tag.name}
                              <button onClick={() => removeTag(product.id, tag.id)} title={`Remove tag "${tag.name}"`} className="hover:text-red-500">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#1E293B] font-medium">₹{product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-500">{product.stock_quantity}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        product.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3 text-gray-400">
                        <Link href={`/admin/products/${product.id}`} className="hover:text-blue-500"><Search className="w-4 h-4" /></Link>
                        <Link href={`/admin/products/${product.id}`} className="hover:text-brand-orange"><Edit2 className="w-4 h-4" /></Link>
                        <button onClick={() => deleteProduct(product.id)} className="hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
