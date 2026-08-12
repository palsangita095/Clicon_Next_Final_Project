"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ShoppingCart, Heart, Star, Plus, ArrowUpDown, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStorefront, Product } from "@/store/useStorefront";
import { createClient } from "@/lib/supabase/client";
import { getCookie } from "cookies-next";
import { fixImageUrl } from "@/lib/imageFallback";
import AccountSidebar from "@/components/account/AccountSidebar";

interface CompareProductItem {
  id: string | number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  soldBy: string;
  brand: string;
  model: string;
  stockStatus: string;
  size: string;
  weight: string;
  rawProduct?: any;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "fill-brand-yellow text-brand-yellow" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function ComparePage() {
  const compareItems = useStorefront((s) => s.compareItems);
  const removeFromCompare = useStorefront((s) => s.removeFromCompare);
  const clearCompare = useStorefront((s) => s.clearCompare);
  const addToCompare = useStorefront((s) => s.addToCompare);
  const addToCart = useStorefront((s) => s.addToCart);
  const addToWishlist = useStorefront((s) => s.addToWishlist);
  const isInWishlist = useStorefront((s) => s.isInWishlist);
  const [detailedItems, setDetailedItems] = useState<CompareProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<"price" | "brand" | "stockStatus" | "rating" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getCookie("token"));
  }, []);

  // Search modal state to add products
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch product details from Supabase
  useEffect(() => {
    async function loadCompareDetails() {
      setLoading(true);
      const supabase = createClient();

      if (compareItems.length === 0) {
        setDetailedItems([]);
      } else {
        const uniqueItems = compareItems.filter(
          (item, index, self) => self.findIndex((i) => String(i.id) === String(item.id)) === index
        );
        const productIds = uniqueItems.map((i) => i.id);
        const { data } = await supabase
          .from("products")
          .select("*, categories!products_category_id_fkey(name), brands!products_brand_id_fkey(name)")
          .in("id", productIds);

        // Compute real review stats (approved reviews only)
        const { data: reviewData } = productIds.length
          ? await supabase
              .from("reviews")
              .select("product_id, rating")
              .eq("is_approved", true)
              .in("product_id", productIds)
          : { data: [] };

        const reviewStats = new Map<string, { sum: number; count: number }>();
        (reviewData ?? []).forEach((r: any) => {
          const cur = reviewStats.get(r.product_id) || { sum: 0, count: 0 };
          cur.sum += Number(r.rating) || 0;
          cur.count += 1;
          reviewStats.set(r.product_id, cur);
        });
        const statsFor = (id: any) => {
          const s = reviewStats.get(String(id));
          return s
            ? { rating: Math.round((s.sum / s.count) * 10) / 10, reviews: s.count }
            : { rating: 0, reviews: 0 };
        };

        if (data && data.length > 0) {
          const formatted: CompareProductItem[] = uniqueItems.map((ci) => {
            const fetched = data.find((d) => String(d.id) === String(ci.id));
            if (fetched) {
              const stats = statsFor(fetched.id);
              return {
                id: fetched.id,
                name: fetched.name,
                image: fixImageUrl(fetched.image_urls?.[0] || ci.image, fetched.name),
                rating: stats.rating,
                reviews: stats.reviews,
                price: Number(fetched.price) || ci.price,
                soldBy: fetched.brands?.name || "Clicon",
                brand: fetched.brands?.name || fetched.categories?.name || "Clicon",
                model: fetched.slug || fetched.name.substring(0, 15),
                stockStatus: fetched.stock_quantity > 0 ? "IN STOCK" : "OUT OF STOCK",
                size: fetched.specifications?.Size || "Standard",
                weight: fetched.specifications?.Weight || "350 g",
                rawProduct: fetched,
              };
            }
            const stats = statsFor(ci.id);
            return {
              id: ci.id,
              name: ci.name,
              image: fixImageUrl(ci.image, ci.name),
              rating: stats.rating,
              reviews: stats.reviews,
              price: ci.price,
              soldBy: "Clicon",
              brand: "Clicon",
              model: "Standard",
              stockStatus: "IN STOCK",
              size: "Standard",
              weight: "350 g",
            };
          });
          setDetailedItems(formatted);
        } else {
          setDetailedItems(
            uniqueItems.map((ci) => {
              const stats = statsFor(ci.id);
              return {
                id: ci.id,
                name: ci.name,
                image: fixImageUrl(ci.image, ci.name),
                rating: stats.rating,
                reviews: stats.reviews,
                price: ci.price,
                soldBy: "Clicon",
                brand: "Clicon",
                model: "Standard",
                stockStatus: "IN STOCK",
                size: "Standard",
                weight: "350 g",
              };
            })
          );
        }
      }
      setLoading(false);
    }

    loadCompareDetails();
  }, [compareItems]);

  // Handle opening modal to add products
  const handleOpenAddModal = async () => {
    setIsAddModalOpen(true);
    setModalLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("products").select("*").limit(20);
    setAllProducts(data || []);
    setModalLoading(false);
  };

  const handleAddProductFromModal = (prod: any) => {
    const success = addToCompare({
      id: prod.id,
      name: prod.name,
      price: Number(prod.price),
      image: fixImageUrl(prod.image_urls?.[0], prod.name),
    });
    if (!success) {
      toast.error("You can compare up to 4 products at a time.");
    } else {
      setIsAddModalOpen(false);
    }
  };

  const handleRemove = (id: string | number) => {
    removeFromCompare(id);
    setDetailedItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  const handleSort = (field: "price" | "brand" | "stockStatus" | "rating") => {
    const isSameField = sortField === field;
    const newOrder = isSameField && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);

    const sorted = [...detailedItems].sort((a, b) => {
      let valA: any = a[field];
      let valB: any = b[field];

      if (field === "price" || field === "rating") {
        return newOrder === "asc" ? valA - valB : valB - valA;
      }
      if (field === "brand") {
        return newOrder === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      }
      if (field === "stockStatus") {
        const rankA = valA === "IN STOCK" ? 1 : 0;
        const rankB = valB === "IN STOCK" ? 1 : 0;
        return newOrder === "asc" ? rankB - rankA : rankA - rankB;
      }
      return 0;
    });

    setDetailedItems(sorted);
  };

  const filteredModalProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(modalSearch.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center justify-between">
          <div>
            <Link href="/" className="hover:text-brand-orange">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-800 font-medium">Compare</span>
          </div>
          {detailedItems.length > 0 && (
            <button
              onClick={() => { clearCompare(); setDetailedItems([]); }}
              className="text-xs text-red-500 hover:underline flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All Compare
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {isLoggedIn && <AccountSidebar />}
          <div className="flex-1 min-w-0">
        {/* Controls / Sorting Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Sort Columns By:</span>
            <button
              onClick={() => handleSort("price")}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors flex items-center gap-1 ${
                sortField === "price" ? "bg-brand-orange text-white border-brand-orange" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Price <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSort("brand")}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors flex items-center gap-1 ${
                sortField === "brand" ? "bg-brand-orange text-white border-brand-orange" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Brand <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSort("stockStatus")}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors flex items-center gap-1 ${
                sortField === "stockStatus" ? "bg-brand-orange text-white border-brand-orange" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Stock Status <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSort("rating")}
              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors flex items-center gap-1 ${
                sortField === "rating" ? "bg-brand-orange text-white border-brand-orange" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Rating <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>

          {detailedItems.length < 4 && (
            <Button
              onClick={handleOpenAddModal}
              className="bg-brand-orange text-white font-semibold text-xs gap-1.5 h-9"
            >
              <Plus className="w-4 h-4" /> Add Product ({detailedItems.length}/4)
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : detailedItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <h3 className="text-xl font-bold text-gray-700 mb-2">No products to compare</h3>
            <p className="text-sm text-gray-500 mb-6">Add up to 4 products from our shop or click below to search products.</p>
            <Button onClick={handleOpenAddModal} className="bg-brand-orange text-white font-semibold gap-2">
              <Plus className="w-4 h-4" /> Add Products To Compare
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full min-w-[800px] border-collapse bg-white">
              <tbody>
                {/* Products Header Row */}
                <tr>
                  <td className="w-[200px] p-6 border-b border-r border-gray-200 bg-gray-50 align-top">
                    <span className="font-bold text-gray-800 text-sm">Product Summary</span>
                  </td>
                  {detailedItems.map((item) => (
                    <td key={item.id} className="p-6 border-b border-r border-gray-200 align-top w-[300px] relative">
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Remove item"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <div className="relative flex justify-center mb-4 h-36">
                        <Image src={fixImageUrl(item.image, item.name)} alt={item.name} fill sizes="80px" className="object-contain" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 mb-4 h-10">
                        {item.name}
                      </h3>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image })}
                          className="flex-1 font-semibold text-xs h-9 gap-1.5 text-white shadow-sm"
                          style={{ backgroundColor: item.stockStatus === 'OUT OF STOCK' ? '#9CA3AF' : '#FA8232' }}
                          disabled={item.stockStatus === 'OUT OF STOCK'}
                        >
                          ADD TO CART <ShoppingCart className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          onClick={() => addToWishlist({ id: item.id, name: item.name, price: item.price, image: item.image })}
                          variant="outline"
                          size="icon"
                          className={`h-9 w-9 flex-shrink-0 border-gray-200 ${isInWishlist(item.id) ? "text-red-500" : "text-gray-400 hover:text-brand-orange"}`}
                        >
                          <Heart className={`w-4 h-4 ${isInWishlist(item.id) ? "fill-red-500" : ""}`} />
                        </Button>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Customer Feedback */}
                <tr className="bg-gray-50/50">
                  <td className="p-4 border-b border-r border-gray-200 text-sm font-semibold text-gray-700">Customer feedback:</td>
                  {detailedItems.map((item) => (
                    <td key={item.id} className="p-4 border-b border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <StarRating rating={item.rating} />
                        <span className="text-xs text-gray-500 font-medium">({item.reviews.toLocaleString()})</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Price */}
                <tr>
                  <td className="p-4 border-b border-r border-gray-200 text-sm font-semibold text-gray-700">Price:</td>
                  {detailedItems.map((item) => (
                    <td key={item.id} className="p-4 border-b border-r border-gray-200">
                      <span className="font-bold text-brand-blue text-base">₹{item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </td>
                  ))}
                </tr>

                {/* Sold By */}
                <tr className="bg-gray-50/50">
                  <td className="p-4 border-b border-r border-gray-200 text-sm font-semibold text-gray-700">Sold by:</td>
                  {detailedItems.map((item) => (
                    <td key={item.id} className="p-4 border-b border-r border-gray-200 text-sm text-gray-800">{item.soldBy}</td>
                  ))}
                </tr>

                {/* Brand */}
                <tr>
                  <td className="p-4 border-b border-r border-gray-200 text-sm font-semibold text-gray-700">Brand:</td>
                  {detailedItems.map((item) => (
                    <td key={item.id} className="p-4 border-b border-r border-gray-200 text-sm text-gray-800">{item.brand}</td>
                  ))}
                </tr>

                {/* Model */}
                <tr className="bg-gray-50/50">
                  <td className="p-4 border-b border-r border-gray-200 text-sm font-semibold text-gray-700">Model / Slug:</td>
                  {detailedItems.map((item) => (
                    <td key={item.id} className="p-4 border-b border-r border-gray-200 text-sm text-gray-800 line-clamp-1">{item.model}</td>
                  ))}
                </tr>

                {/* Stock Status */}
                <tr>
                  <td className="p-4 border-b border-r border-gray-200 text-sm font-semibold text-gray-700">Stock status:</td>
                  {detailedItems.map((item) => (
                    <td key={item.id} className="p-4 border-b border-r border-gray-200 text-sm font-bold">
                      <span className={item.stockStatus === 'IN STOCK' ? 'text-green-600' : 'text-red-500'}>
                        {item.stockStatus}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Size */}
                <tr className="bg-gray-50/50">
                  <td className="p-4 border-b border-r border-gray-200 text-sm font-semibold text-gray-700">Size:</td>
                  {detailedItems.map((item) => (
                    <td key={item.id} className="p-4 border-b border-r border-gray-200 text-sm text-gray-800">{item.size}</td>
                  ))}
                </tr>

                {/* Weight */}
                <tr>
                  <td className="p-4 border-r border-gray-200 text-sm font-semibold text-gray-700">Weight:</td>
                  {detailedItems.map((item) => (
                    <td key={item.id} className="p-4 border-r border-gray-200 text-sm text-gray-800">{item.weight}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Product to Compare</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <Input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Search products to compare..."
                className="pr-10"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {modalLoading ? (
                <div className="py-10 text-center text-sm text-gray-500">Loading products...</div>
              ) : filteredModalProducts.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">No matching products found.</div>
              ) : (
                filteredModalProducts.map((prod) => {
                  const isAlreadyIn = detailedItems.some((d) => String(d.id) === String(prod.id));
                  return (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Image
                          src={fixImageUrl(prod.image_urls?.[0], prod.name)}
                          alt={prod.name}
                          width={40}
                          height={40}
                          sizes="40px"
                          className="w-10 h-10 object-contain rounded bg-gray-50 border"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">{prod.name}</p>
                          <span className="text-xs font-bold text-brand-blue">₹{Number(prod.price).toFixed(2)}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddProductFromModal(prod)}
                        disabled={isAlreadyIn}
                        size="sm"
                        className={isAlreadyIn ? "bg-gray-200 text-gray-500" : "bg-brand-orange text-white"}
                      >
                        {isAlreadyIn ? "Added" : "Select"}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
