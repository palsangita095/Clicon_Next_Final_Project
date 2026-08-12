"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchIcon, SettingsIcon, BellIcon } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getInitials } from "@/services/helper/global.helper";
import { useDebounce } from "@/hooks/useDebounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import NotificationBell from "@/components/notificition/NotificationBell";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter()
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      console.log("Ready to send to server:", debouncedSearchTerm);
     
    }
  }, [debouncedSearchTerm]);

  return (
    <header className="sticky top-0 z-20 flex justify-between items-center h-16 border-b bg-background px-4 md:px-6 overflow-hidden">
      
      <div className="flex items-center gap-4 flex-1">
        <div
        
        >
          <SidebarTrigger />
        </div>

        
        <div className="hidden sm:flex relative w-fit max-w-md items-center">
          <SearchIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-9 bg-muted/50 focus-visible:bg-background rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

     
      <div className="flex items-center gap-3 md:gap-4">
        
        <Button variant="ghost" size="icon" className="sm:hidden">
          <SearchIcon className="h-5 w-5" />
        </Button>

        
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit">
            <DropdownMenuGroup>
              
              {user?.role !== "admin" && (
                <DropdownMenuItem
                  onClick={() => router.push(`/${user?.role}/profile`)}
                >
                  Profile
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-red-500 hover:text-red-400"
                onClick={() => logout()}
              >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <AnimatedThemeToggler />

        
        <div className="flex items-center gap-3 pl-2 border-l">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium leading-none capitalize">
              {user?.full_name ?? "Admin User"}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              {user?.email || "admin@clicon.com"}
            </span>
          </div>

          <Avatar className="h-9 w-9 border cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage
              src={user?.avatar_url ?? ""}
              alt={getInitials(user?.full_name || "Admin")}
            />
            <AvatarFallback>
              {getInitials(user?.full_name || "AD")}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
