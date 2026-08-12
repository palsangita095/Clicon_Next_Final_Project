"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { fixImageUrl } from "@/lib/imageFallback";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  MapPin,
  RefreshCcw,
  Headphones,
  Info,
  PhoneCall,
  Menu,
  ChevronDown,
  ChevronRight,
  X,
  ArrowRight,
  Laptop,
  Smartphone,
  Headphones as HeadphonesIcon,
  Watch,
  Gamepad2,
  Camera,
  Tv,
  Cpu,
  Navigation,
  Package,
  Moon,
  Sun
} from "lucide-react";
import { CartDropdown } from "@/components/store/CartDropdown";
import { useStorefront } from "@/store/useStorefront";


const CATEGORY_ICONS: Record<string, any> = {
  "Computer & Laptop": Laptop,
  "SmartPhone": Smartphone,
  "Headphone": HeadphonesIcon,
  "Mobile Accessories": Watch,
  "Gaming Console": Gamepad2,
  "Camera & Photo": Camera,
  "TV & Homes Appliances": Tv,
  "Watchs & Accessories": Watch,
  "GPS & Navigation": Navigation,
  "Wearable Technology": Cpu,
};

const Header = () => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const cart = useStorefront((s) => s.cart);
  const wishlist = useStorefront((s) => s.wishlist);
  const settings = useStoreSettings();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [themeReady, setThemeReady] = useState(false);

 
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<any | null>(null);
  const [hoveredBrand, setHoveredBrand] = useState<any | null>(null);
  const [categoryBrands, setCategoryBrands] = useState<any[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchCategory, setSelectedSearchCategory] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setThemeReady(true);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

 
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

 
  useEffect(() => {
    if (!hoveredCategory) {
      setCategoryProducts([]);
      setCategoryBrands([]);
      setHoveredBrand(null);
      return;
    }
    let cancelled = false;
    const fetchDetails = async () => {
      setLoadingProducts(true);
      const supabase = createClient();
      
      let productsQuery = supabase
        .from('products')
        .select('id, name, slug, price, old_price, image_urls, brand:brands!products_brand_id_fkey(name)')
        .eq('category_id', hoveredCategory.id)
        .eq('status', 'active');

      if (hoveredBrand) {
        productsQuery = productsQuery.eq('brand_id', hoveredBrand.id);
      }

      productsQuery = productsQuery.limit(5);

      const [prodRes, brandRes] = await Promise.all([
        productsQuery,
        supabase
          .from('products')
          .select('brand_id, brand:brands!products_brand_id_fkey(id, name, slug)')
          .eq('category_id', hoveredCategory.id)
          .eq('status', 'active')
          .not('brand_id', 'is', null),
      ]);

      if (!cancelled) {
        if (prodRes.data) setCategoryProducts(prodRes.data);
        if (brandRes.data) {
          const brandMap = new Map<string, any>();
          brandRes.data.forEach((p: any) => {
            const b = Array.isArray(p.brand) ? p.brand[0] : p.brand;
            if (b?.id) brandMap.set(b.id, b);
          });
          setCategoryBrands(
            Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
          );
        }
        setLoadingProducts(false);
      }
    };
    fetchDetails();
    return () => { cancelled = true; };
  }, [hoveredCategory, hoveredBrand]);

  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      const supabase = createClient();
      let q = supabase
        .from('products')
        .select('id, name, slug, price, image_urls')
        .eq('status', 'active')
        .or(`name.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`)
        .limit(6);

      if (selectedSearchCategory) {
        q = q.eq('category_id', selectedSearchCategory);
      }

      const { data } = await q;
      if (data) {
        setSearchResults(data);
        setIsSearchOpen(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedSearchCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() && !selectedSearchCategory) return;
    setIsSearchOpen(false);

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedSearchCategory) {
      const cat = categories.find(c => c.id === selectedSearchCategory);
      if (cat) params.set("category", cat.slug);
    }
    router.push(`/shop?${params.toString()}`);
  };

  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
        setHoveredCategory(null);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full flex flex-col font-sans">
      
      <div className="bg-[#191C1F] text-white w-full py-2 px-4 relative flex items-center justify-center text-sm md:text-base">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="bg-brand-yellow text-black font-bold px-2 py-0.5 rounded-sm mr-2 text-xs md:text-sm">
              Black
            </span>
            <span className="font-semibold text-white">Friday</span>
          </div>
          <div className="hidden md:flex items-center text-gray-300">
            <span className="mr-2">Up to</span>
            <span className="text-brand-yellow font-bold text-xl mr-2">59%</span>
            <span className="font-bold">OFF</span>
          </div>
          <Link href="/shop" className="bg-brand-yellow text-black px-4 py-1.5 font-semibold text-sm rounded flex items-center hover:bg-yellow-500 transition-colors">
            SHOP NOW <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <button className="absolute right-4 text-gray-400 hover:text-white bg-gray-800 p-1 rounded-sm" aria-label="Close announcement banner">
          <X className="w-4 h-4" />
        </button>
      </div>

      
      <div className="bg-[#1B6392] text-white py-2 px-4 md:px-8 flex justify-between items-center text-xs border-b border-blue-800/30">
        <div className="hidden md:block">
          Welcome to {settings.storeName} online eCommerce store.
        </div>
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-3">
            <span>Follow us:</span>
            <div className="flex gap-4">
        
          <span className="text-gray-400 hover:text-white cursor-pointer">Twitter</span>
          <span className="text-gray-400 hover:text-white cursor-pointer">Facebook</span>
          <span className="text-gray-400 hover:text-white cursor-pointer">Instagram</span>
          <span className="text-gray-400 hover:text-white cursor-pointer">Youtube</span>
        </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center cursor-pointer hover:text-brand-yellow border-l border-white/20 pl-4">
              Eng <ChevronDown className="w-3 h-3 ml-1" />
            </div>
            <div className="flex items-center cursor-pointer hover:text-brand-yellow">
              INR <ChevronDown className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>
      </div>

      
      <div className="bg-[#1B6392] py-5 px-4 md:px-8 text-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/" className="flex items-center gap-2">
              {settings.logoUrl ? (
                <Image src={settings.logoUrl} alt={settings.storeName} width={160} height={40} className="h-10 w-auto max-w-[160px] object-contain" />
              ) : (
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-brand-orange rounded-full"></div>
                </div>
              )}
              <span className="text-2xl font-bold tracking-tight">{settings.storeName.toUpperCase()}</span>
            </Link>
            <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle mobile menu" aria-expanded={isMobileMenuOpen}>
              <Menu className="w-6 h-6" />
            </button>
          </div>

         
          <div className="w-full md:max-w-2xl flex-1 px-0 md:px-8 hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center bg-white rounded-sm overflow-hidden">
              
              <select
                value={selectedSearchCategory}
                onChange={(e) => setSelectedSearchCategory(e.target.value)}
                className="bg-gray-100 text-gray-700 text-xs px-3 h-11 border-r border-gray-200 outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <Input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for anything..." 
                className="w-full bg-white text-black border-none rounded-none pr-10 focus-visible:ring-0 h-11 text-sm"
              />
              <button type="submit" className="p-3 text-gray-500 hover:text-brand-orange transition-colors" aria-label="Search products">
                <Search className="w-5 h-5" />
              </button>

             
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-xl rounded-b-md z-50 max-h-80 overflow-y-auto">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug || product.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                    >
                      <Image
                        src={fixImageUrl(product.image_urls?.[0], product.name)}
                        alt={product.name}
                        width={40}
                        height={40}
                        sizes="40px"
                        className="w-10 h-10 object-contain bg-gray-50 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</p>
                        <span className="text-xs font-bold text-brand-blue">₹{Number(product.price).toFixed(2)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </form>
          </div>

        
          <div className="hidden md:flex items-center gap-6">
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="cursor-pointer hover:text-brand-yellow transition-colors"
              title="Toggle color mode"
              aria-label="Toggle color mode"
            >
              {themeReady ? (
                resolvedTheme === "dark" ? (
                  <Sun className="w-6 h-6" />
                ) : (
                  <Moon className="w-6 h-6" />
                )
              ) : (
                <Moon className="w-6 h-6 opacity-0" aria-hidden="true" />
              )}
            </button>
            <CartDropdown />
            <Link href="/wishlist" aria-label={`Wishlist (${wishlist.length} items)`} className="relative cursor-pointer hover:text-brand-yellow transition-colors">
              <Heart className="w-6 h-6" />
              {wishlist.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-white text-[#1B6392] hover:bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center p-0 text-[10px] font-bold border-2 border-[#1B6392]">
                  {wishlist.length > 9 ? '9+' : `0${wishlist.length}`.slice(-2)}
                </Badge>
              )}
            </Link>
            {loading ? (
              <div className="w-6 h-6 rounded-full bg-blue-800/50 animate-pulse"></div>
            ) : user ? (
              <Link href="/account" aria-label="My account" className="cursor-pointer hover:text-brand-yellow transition-colors">
                <User className="w-6 h-6" />
              </Link>
            ) : (
              <Link href="/signin" aria-label="Sign in" className="cursor-pointer hover:text-brand-yellow transition-colors">
                <User className="w-6 h-6" />
              </Link>
            )}
          </div>
        </div>

       
        {isMobileMenuOpen && (
          <div className="mt-4 flex flex-col gap-4 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for anything..." 
                className="w-full bg-white text-black border-none rounded-sm pr-10 focus-visible:ring-0 h-11 text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-orange" aria-label="Search products">
                <Search className="w-5 h-5" />
              </button>

              
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-xl rounded-b-md z-50 max-h-80 overflow-y-auto text-black">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug || product.id}`}
                      onClick={() => { setIsSearchOpen(false); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                    >
                      <Image
                        src={fixImageUrl(product.image_urls?.[0], product.name)}
                        alt={product.name}
                        width={40}
                        height={40}
                        sizes="40px"
                        className="w-10 h-10 object-contain bg-gray-50 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</p>
                        <span className="text-xs font-bold text-brand-blue">₹{Number(product.price).toFixed(2)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </form>

            <nav className="flex flex-col bg-white/10 rounded-sm overflow-hidden">
              <Link href="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors">
                <MapPin className="w-4 h-4 text-brand-yellow" /> Track Order
              </Link>
              <Link href="/compare" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors border-t border-white/10">
                <RefreshCcw className="w-4 h-4 text-brand-yellow" /> Compare
              </Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors border-t border-white/10">
                <Info className="w-4 h-4 text-brand-yellow" /> About Us
              </Link>
              <Link href="/customer-support" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors border-t border-white/10">
                <Headphones className="w-4 h-4 text-brand-yellow" /> Customer Support
              </Link>
              <Link href="/need-help" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors border-t border-white/10">
                <Info className="w-4 h-4 text-brand-yellow" /> Need Help
              </Link>
              <div className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white font-semibold border-t border-white/10">
                <PhoneCall className="w-4 h-4 text-brand-yellow" />
                <span>{settings.contactPhone}</span>
              </div>
            </nav>

            <div className="flex justify-around py-2 border-t border-blue-700/50">
               <button
                 type="button"
                 onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                 className="flex flex-col items-center gap-1"
               >
                 {themeReady && resolvedTheme === "dark" ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                 <span className="text-xs mt-1">{resolvedTheme === "dark" ? "Light" : "Dark"}</span>
               </button>
               <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-1">
                 <div className="relative">
                   <ShoppingCart className="w-6 h-6" />
                   {cartCount > 0 && (
                     <span className="absolute -top-2 -right-2 bg-brand-yellow text-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                       {cartCount}
                     </span>
                   )}
                 </div>
                 <span className="text-xs mt-1">Cart</span>
               </Link>
               <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-1">
                 <Heart className="w-6 h-6" />
                 <span className="text-xs mt-1">Wishlist</span>
               </Link>
               <Link href={user ? "/account" : "/signin"} onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-1">
                 <User className="w-6 h-6" />
                 <span className="text-xs mt-1">Account</span>
               </Link>
            </div>
          </div>
        )}
      </div>

      
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-2 md:px-8">
          <div className="flex items-center h-14">
            
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                onClick={() => { setIsCategoryOpen(!isCategoryOpen); setHoveredCategory(null); }}
                className="bg-brand-orange text-white font-semibold h-14 px-3 md:px-6 flex items-center gap-2 border-none hover:bg-orange-600 transition-colors text-xs md:text-sm"
              >
                <span className="whitespace-nowrap">All Category</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`} />
              </button>

              
              {isCategoryOpen && (
                <div className="absolute top-full left-0 z-50 bg-white shadow-2xl border border-gray-200 rounded-b-lg overflow-hidden">
                 
                  <div className="md:hidden w-[80vw] max-w-[320px] py-2 max-h-[70vh] overflow-y-auto">
                    {categories.length === 0 && (
                      <p className="text-sm text-gray-400 px-4 py-3">No categories found.</p>
                    )}
                    {categories.map((cat) => {
                      const Icon = CATEGORY_ICONS[cat.name] || Package;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            router.push(`/shop?category=${encodeURIComponent(cat.name)}`);
                            setIsCategoryOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-gray-400" />
                            {cat.name}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                        </button>
                      );
                    })}
                  </div>

                 
                  <div className="hidden md:flex min-w-[700px]">
                    <div className="w-[240px] border-r border-gray-100 py-2 flex-shrink-0">
                      {categories.length === 0 && (
                        <p className="text-sm text-gray-400 px-4 py-3">No categories found.</p>
                      )}
                      {categories.map((cat) => {
                        const Icon = CATEGORY_ICONS[cat.name] || Package;
                        const isHovered = hoveredCategory?.id === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onMouseEnter={() => { setHoveredCategory(cat); setHoveredBrand(null); }}
                            onClick={() => {
                              router.push(`/shop?category=${encodeURIComponent(cat.name)}`);
                              setIsCategoryOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-5 py-2.5 text-sm transition-colors ${
                              isHovered
                                ? "bg-gray-50 text-gray-900 font-semibold"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <Icon className="w-4 h-4 text-gray-400" />
                              {cat.name}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex-1 p-5 min-h-[300px]">
                      {!hoveredCategory && (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                          Hover a category to see products
                        </div>
                      )}
                      {hoveredCategory && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                              {hoveredCategory.name}
                            </h3>
                          </div>

                          
                          {categoryBrands.length > 0 && (
                            <div className="mb-4">
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Featured Brands</span>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onMouseEnter={() => setHoveredBrand(null)}
                                  className={`text-xs px-2.5 py-1 rounded transition-colors font-medium ${!hoveredBrand ? 'bg-brand-orange text-white' : 'bg-gray-100 hover:bg-brand-orange hover:text-white text-gray-700'}`}
                                >
                                  All
                                </button>
                                {categoryBrands.map((brand) => (
                                  <button
                                    key={brand.id}
                                    onMouseEnter={() => setHoveredBrand(brand)}
                                    onClick={() => {
                                      router.push(`/shop?category=${encodeURIComponent(hoveredCategory.slug || hoveredCategory.name)}&brand=${encodeURIComponent(brand.slug || brand.name)}`);
                                      setIsCategoryOpen(false);
                                    }}
                                    className={`text-xs px-2.5 py-1 rounded transition-colors font-medium ${hoveredBrand?.id === brand.id ? 'bg-brand-orange text-white' : 'bg-gray-100 hover:bg-brand-orange hover:text-white text-gray-700'}`}
                                  >
                                    {brand.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {loadingProducts ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                              <div className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
                              Loading products...
                            </div>
                          ) : categoryProducts.length === 0 ? (
                            <p className="text-sm text-gray-400 py-2">No products in this category yet.</p>
                          ) : (
                            <div className="space-y-3">
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">{hoveredBrand ? `${hoveredBrand.name} Items` : 'Top Items'}</span>
                              {categoryProducts.map((product) => (
                                <Link
                                  key={product.id}
                                  href={`/products/${product.slug || product.id}`}
                                  onClick={() => setIsCategoryOpen(false)}
                                  className="flex items-center gap-3 group hover:bg-gray-50 p-1.5 rounded-md transition-colors"
                                >
                                  <div className="w-12 h-12 bg-gray-50 rounded border border-gray-100 flex-shrink-0 relative overflow-hidden">
                                    <Image
                                      src={fixImageUrl(product.image_urls?.[0], product.name)}
                                      alt={product.name}
                                      fill
                                      sizes="48px"
                                      className="object-contain p-1"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {product.brand && (
                                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                                        {Array.isArray(product.brand) ? product.brand[0]?.name : product.brand?.name}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-700 line-clamp-1 group-hover:text-brand-orange transition-colors font-medium">
                                      {product.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-brand-blue font-semibold text-xs">
                                        ₹{product.price?.toLocaleString()}
                                      </span>
                                      {product.old_price && (
                                        <span className="text-gray-400 text-[10px] line-through">
                                          ₹{product.old_price.toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                              <Link
                                href={`/shop?category=${encodeURIComponent(hoveredCategory.slug || hoveredCategory.name)}`}
                                onClick={() => setIsCategoryOpen(false)}
                                className="inline-flex items-center gap-1 text-brand-orange text-xs font-semibold hover:underline mt-2"
                              >
                                SHOP ALL {hoveredCategory.name.toUpperCase()} <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            
            <nav className="flex items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-600 font-medium overflow-x-auto flex-1 min-w-0 px-2 md:px-4 h-14 no-scrollbar">
              <Link href="/track-order" className="flex items-center gap-1 md:gap-2 whitespace-nowrap hover:text-brand-orange transition-colors">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" /> Track Order
              </Link>
              <Link href="/compare" className="flex items-center gap-1 md:gap-2 whitespace-nowrap hover:text-brand-orange transition-colors">
                <RefreshCcw className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" /> Compare
              </Link>
              <Link href="/about" className="flex items-center gap-1 md:gap-2 whitespace-nowrap hover:text-brand-orange transition-colors">
                <Info className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" /> About Us
              </Link>
              <Link href="/customer-support" className="flex items-center gap-1 md:gap-2 whitespace-nowrap hover:text-brand-orange transition-colors">
                <Headphones className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" /> Customer Support
              </Link>
              <Link href="/need-help" className="flex items-center gap-1 md:gap-2 whitespace-nowrap hover:text-brand-orange transition-colors">
                <Info className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" /> Need Help
              </Link>
              <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap font-semibold text-gray-800 md:ml-auto md:pl-4 md:border-l md:border-gray-200">
                <PhoneCall className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                <span>{settings.contactPhone}</span>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
