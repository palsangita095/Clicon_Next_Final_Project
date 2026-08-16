"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import {
  Home,
  FileText,
  ShoppingBag,
  User,
  Boxes,
  FolderTree,
  Tag,
  MessageSquare,
  Gift,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/orders", label: "Orders", icon: FileText },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/users", label: "Users", icon: User },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/promotions", label: "Promotions", icon: Gift },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const settings = useStoreSettings();

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/signin';
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F8F9FA] overflow-hidden font-sans">
   
      <div className="md:hidden bg-brand-orange text-white px-4 py-3 flex items-center justify-between shadow-sm z-50">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-wide">
          {settings.logoUrl ? (
            <Image src={settings.logoUrl} alt={settings.storeName} width={128} height={32} className="h-8 w-auto object-contain brightness-0 invert" />
          ) : null}
          {settings.storeName.toUpperCase()} ADMIN
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1 rounded text-white hover:bg-white/10"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      
      <aside className="hidden md:flex w-24 bg-brand-orange flex-shrink-0 flex-col items-center py-6 h-full overflow-y-auto z-40">
        <Link href="/admin/dashboard" className="mb-10 flex items-center justify-center">
          {settings.logoUrl ? (
            <Image src={settings.logoUrl} alt={settings.storeName} width={40} height={40} className="h-10 w-10 object-contain brightness-0 invert" />
          ) : (
            <span className="text-white font-bold text-xl">{settings.storeName.slice(0, 4).toLowerCase()}</span>
          )}
        </Link>
        
        <nav className="flex flex-col gap-4 w-full px-4 mb-4">
          {SIDEBAR_ITEMS.map((item, idx) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={idx}
                href={item.href}
                className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-white text-brand-orange shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
                title={item.label}
              >
                <item.icon className="w-7 h-7" />
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto mb-4 w-full px-4 space-y-2">
          <Link href="/" target="_blank" className="w-16 h-16 rounded-xl flex items-center justify-center transition-all text-white/70 hover:bg-white/10 hover:text-white" title="View Store">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </Link>
          <button
            onClick={handleLogout}
            className="w-16 h-16 rounded-xl flex items-center justify-center transition-all text-white/70 hover:bg-white/10 hover:text-red-300"
            title="Logout"
          >
            <LogOut className="w-7 h-7" />
          </button>
        </div>
      </aside>

      
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 flex">
          <div className="w-64 bg-brand-orange text-white p-6 flex flex-col h-full shadow-2xl overflow-y-auto">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8 shrink-0">
                <span className="font-bold text-xl">Admin Menu</span>
                <button onClick={() => setIsMobileOpen(false)} className="text-white/80 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-2 shrink-0">
                {SIDEBAR_ITEMS.map((item, idx) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-white text-brand-orange font-bold shadow-sm"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="mt-8 space-y-2 shrink-0">
              <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors w-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <span>View Store</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-red-200 transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileOpen(false)}></div>
        </div>
      )}

     
      <main className="flex-1 h-full overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
