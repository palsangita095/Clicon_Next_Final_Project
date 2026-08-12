"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  MessageSquare,
  Boxes,
  FolderTree,
  ArrowLeftIcon, 
  XIcon 
} from "lucide-react";

const adminLinks = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/products", label: "Products", icon: Package },
  { path: "/admin/categories", label: "Categories", icon: FolderTree },
  { path: "/admin/inventory", label: "Inventory", icon: Boxes },
  { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { path: "/admin/users", label: "Customers", icon: Users },
  { path: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const settings = useStoreSettings();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r min-w-fit flex items-center justify-center z-50 overflow-hidden"
    >
      <SidebarHeader className="p-4 flex flex-row items-center justify-between md:justify-center w-full">
        <div className="flex items-center justify-center gap-2 overflow-hidden w-full font-bold text-2xl tracking-tight text-brand-blue group-data-[collapsible=icon]:hidden">
          {settings.logoUrl ? (
            <Image src={settings.logoUrl} alt={settings.storeName} width={120} height={32} className="h-8 w-auto max-w-[120px] object-contain" />
          ) : (
            <div className="w-8 h-8 bg-brand-blue rounded flex items-center justify-center">
               <div className="w-3 h-3 bg-brand-orange rounded-full"></div>
            </div>
          )}
          {settings.storeName.toUpperCase()}
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full">
          {settings.logoUrl ? (
            <Image src={settings.logoUrl} alt={settings.storeName} width={32} height={32} className="h-8 w-8 object-contain rounded" />
          ) : (
            <div className="w-8 h-8 bg-brand-blue rounded flex items-center justify-center">
               <div className="w-3 h-3 bg-brand-orange rounded-full"></div>
            </div>
          )}
        </div>

        <button
          onClick={() => setOpenMobile(false)}
          className="md:hidden p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          aria-label="Close Sidebar"
        >
          <XIcon className="h-6 w-6" />
        </button>
      </SidebarHeader>

      <SidebarContent className="border-t pt-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-2">
              {adminLinks.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.path || (item.path !== "/admin/dashboard" && pathname.startsWith(item.path));

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => router.push(item.path)}
                      className="group text-muted-foreground hover:bg-white/5 hover:text-foreground hover:translate-x-1.5 data-[active=true]:bg-brand-blue/10 data-[active=true]:text-brand-blue transition-all duration-200 ease-in-out"
                    >
                      <IconComponent className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                      <span className="font-medium">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t flex flex-col items-center gap-3">
        <SidebarMenuButton
          onClick={async () => {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/signin');
          }}
          className="flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-300 ease-in-out py-5"
        >
          <svg xmlns="http://www.3w.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
          <span className="group-data-[collapsible=icon]:hidden font-medium ml-2">
            Logout
          </span>
        </SidebarMenuButton>

        <SidebarMenuButton
          onClick={() => router.push('/')}
          className="flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-brand-blue hover:text-white transition-all duration-300 ease-in-out py-5"
        >
          <ArrowLeftIcon className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="group-data-[collapsible=icon]:hidden font-medium">
            Back to Store
          </span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
