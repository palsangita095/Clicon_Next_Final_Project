"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Heart, Eye, Star, SlidersHorizontal, ChevronDown, X, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useStorefront } from "@/store/useStorefront";
import { createClient } from "@/lib/supabase/client";
import { useShopPageData } from "@/hooks/queries/customer/useShopPageData";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Product {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: "HOT" | "BEST DEAL" | "NEW" | "SALE";
  discount?: number;
  category?: string;
  categorySlug?: string;
  brand?: string;
  tags?: string[];
}

const BRANDS = ["Apple", "Google", "Microsoft", "Samsung", "Bose", "Huawei", "Sony", "Panasonic", "Dell", "Intel"];
const POPULAR_TAGS = ["Game", "iPhone", "TV", "Asus Laptops", "Macbook", "SSD", "Graphics Card", "Power Bank", "Smart TV", "Speaker"];

// ── Star Rating Component ─────────────────────────────────────────────────────
function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "fill-brand-yellow text-brand-yellow" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
      <span className="text-gray-400 text-xs ml-1">({reviewCount})</span>
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const addToCart = useStorefront((s) => s.addToCart);
  const addToWishlist = useStorefront((s) => s.addToWishlist);
  const isInWishlist = useStorefront((s) => s.isInWishlist);
  const addToCompare = useStorefront((s) => s.addToCompare);
  const isInCompare = useStorefront((s) => s.isInCompare);
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const handleAddToWishlist = async () => {
    addToWishlist({ id: product.id, name: product.name, price: product.price, image: product.image });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("wishlist").upsert(
      {
        user_id: user.id,
        product_id: product.id,
      },
      { onConflict: "user_id,product_id" },
    );
  };

  const handleAddToCompare = () => {
    const success = addToCompare({ id: product.id, name: product.name, price: product.price, image: product.image });
    if (!success) {
      toast.error("You can compare up to 4 products at a time.");
    }
  };

  const badgeColors: Record<string, string> = {
    HOT: "bg-red-500",
    "BEST DEAL": "bg-brand-orange",
    NEW: "bg-green-500",
    SALE: "bg-red-500",
  };

  return (
    <div className="group bg-white border border-gray-100 rounded overflow-hidden hover:shadow-lg transition-shadow duration-200 relative">
      {/* Badge */}
      {product.badge && (
        <span className={`absolute top-2 left-2 z-10 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm ${badgeColors[product.badge]}`}>
          {product.badge}
        </span>
      )}
      {product.discount && (
        <span className="absolute top-2 right-2 z-10 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm bg-green-500">
          {product.discount}% OFF
        </span>
      )}

      {/* Image */}
      <div className="relative w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />

        {/* Hover actions */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image: product.image })}
            className="bg-white shadow-md rounded-full p-2 hover:bg-brand-orange hover:text-white transition-colors text-gray-700"
            title="Add to Cart"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button
            onClick={handleAddToWishlist}
            className={`bg-white shadow-md rounded-full p-2 transition-colors ${inWishlist ? "text-red-500" : "hover:bg-brand-orange hover:text-white text-gray-700"}`}
            title="Add to Wishlist"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-red-500" : ""}`} />
          </button>
          <button
            onClick={handleAddToCompare}
            className={`bg-white shadow-md rounded-full p-2 transition-colors ${inCompare ? "text-brand-orange" : "hover:bg-brand-orange hover:text-white text-gray-700"}`}
            title="Add to Compare"
            aria-label="Add to compare"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <Link
            href={`/products/${product.id}`}
            className="bg-white shadow-md rounded-full p-2 hover:bg-brand-orange hover:text-white transition-colors text-gray-700"
            title="View Details"
            aria-label="View details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Details */}
      <div className="p-3">
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        <Link href={`/products/${product.id}`} className="block mt-1">
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug hover:text-brand-orange transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-brand-blue font-semibold">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-gray-400 text-xs line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Shop Page ─────────────────────────────────────────────────────────────
export default function ShopPage() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlSearch = searchParams.get('search');
  const urlBrand = searchParams.get('brand');

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState("Most Popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{name: string; count?: number}[]>([]);
  const [brands, setBrands] = useState<{name: string}[]>([]);
  const [priceMax, setPriceMax] = useState(5000);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync URL search params with state
  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
    if (urlSearch) setSearchQuery(urlSearch);
    if (urlBrand) setSelectedBrands([urlBrand]);
  }, [urlCategory, urlSearch, urlBrand]);

  const { data: shopData } = useShopPageData();

  // Fetch Data
  useEffect(() => {
    if (!shopData) return;
    setCategories(shopData.categories);
    setBrands(shopData.brands);
    setProducts(shopData.products);
    setPriceMax(shopData.priceMax);
    setPriceRange([0, shopData.priceMax]);
    setIsLoading(false);
  }, [shopData]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const filteredProducts = products.filter(p => {
    const pCatName = (p.category || "").toLowerCase();
    const pCatSlug = (p.categorySlug || "").toLowerCase();
    const selCat = (selectedCategory || "").toLowerCase();

    const matchesCategory = !selectedCategory || pCatName === selCat || pCatSlug === selCat || pCatName.includes(selCat);
    const matchesBrand = selectedBrands.length === 0 || (p.brand && selectedBrands.some(b => b.toLowerCase() === p.brand?.toLowerCase()));
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return matchesCategory && matchesBrand && matchesSearch && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "Price: Low to High") return a.price - b.price;
    if (sortBy === "Price: High to Low") return b.price - a.price;
    if (sortBy === "Most Popular") return (b.reviewCount * b.rating) - (a.reviewCount * a.rating);
    return 0;
  });

  const removeFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter));
    if (filter === selectedCategory) setSelectedCategory(null);
  };

  const filterSidebar = (
    <>
      {/* Categories */}
      <div className="bg-white rounded border border-gray-100 p-4 mb-4">
        <h3 className="font-bold text-[#191C1F] mb-4">CATEGORY</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="radio" name="category" className="accent-brand-orange w-4 h-4 cursor-pointer"
                   checked={selectedCategory === null} 
                   onChange={() => setSelectedCategory(null)} />
            <span className={`text-sm group-hover:text-gray-900 transition-colors ${selectedCategory === null ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
              All Categories
            </span>
          </label>
          {categories.map(c => (
            <label key={c.name} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="category" className="accent-brand-orange w-4 h-4 cursor-pointer"
                     checked={selectedCategory === c.name}
                     onChange={() => setSelectedCategory(c.name)} />
              <span className={`text-sm group-hover:text-gray-900 transition-colors ${selectedCategory === c.name ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {c.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="bg-white rounded border border-gray-100 p-4 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-3">Price Range</h3>
        <input
          type="range"
          min={0}
          max={priceMax}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([0, Number(e.target.value)])}
          className="w-full accent-brand-orange"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>₹0</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Popular Brands */}
      <div className="bg-white rounded border border-gray-100 p-4 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-3">Popular Brands</h3>
        <div className="grid grid-cols-2 gap-2">
          {(brands.length > 0 ? brands : BRANDS.map((name) => ({ name }))).map((brand) => (
            <label key={brand.name} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.name)}
                onChange={() => toggleBrand(brand.name)}
                className="w-4 h-4 accent-brand-orange"
              />
              <span className="text-sm text-gray-600">{brand.name}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex gap-6">

          {/* ── Left Sidebar ────────────────────────────────────── */}
          <aside className="hidden lg:block w-64 shrink-0">
            {filterSidebar}
          </aside>

          {showMobileFilters && (
            <div className="lg:hidden w-full">
              <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 space-y-4">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="ml-auto flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-orange"
                  aria-label="Close filters"
                >
                  <X className="w-4 h-4" /> Close
                </button>
                {filterSidebar}
              </div>
            </div>
          )}

          {/* ── Main Content ─────────────────────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* Search bar + sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
              <button
                onClick={() => setShowMobileFilters((v) => !v)}
                className="lg:hidden inline-flex items-center justify-center gap-2 bg-white border border-gray-200 rounded px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-orange hover:text-brand-orange"
                aria-expanded={showMobileFilters}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showMobileFilters ? "Hide Filters" : "Filters"}
              </button>
              <div className="relative flex-1 max-w-lg">
                <Input
                  placeholder="Search for anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto text-sm text-gray-600">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange"
                >
                  <option>Most Popular</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-gray-400">
                <SlidersHorizontal className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm mt-1">Try adjusting your filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
