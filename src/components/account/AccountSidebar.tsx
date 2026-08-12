"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  ClipboardList,
  Truck,
  ShoppingCart,
  Heart,
  GitCompareArrows,
  CreditCard,
  History,
  Settings,
  LogOut,
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", href: "/account", icon: LayoutDashboard },
  { label: "Order History", href: "/account/orders", icon: ClipboardList },
  { label: "Track Order", href: "/track-order", icon: Truck },
  { label: "Shopping Cart", href: "/cart", icon: ShoppingCart },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Compare", href: "/compare", icon: GitCompareArrows },
  { label: "Cards & Address", href: "/account/cards-address", icon: CreditCard },
  { label: "Browsing History", href: "/account/browsing-history", icon: History },
  { label: "Setting", href: "/account/settings", icon: Settings },
  { label: "Log out", href: "/signin", icon: LogOut },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  return (
    <aside className="w-full lg:w-[260px] flex-shrink-0">
      <nav className="border border-gray-100 rounded-md bg-white shadow-sm overflow-hidden">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive =
            item.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(item.href) && item.href !== "/account";

          if (item.label === "Log out") {
            return (
              <button
                key={item.label}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-l-4 text-gray-600 border-l-transparent hover:bg-gray-50 hover:text-brand-orange text-left"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-l-4 ${
                isActive
                  ? "bg-brand-orange text-white border-l-brand-orange"
                  : "text-gray-600 border-l-transparent hover:bg-gray-50 hover:text-brand-orange"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
