"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStorefront } from "@/store/useStorefront";
import { createClient } from "@/lib/supabase/client";

export function GuestSyncProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticate = useAuthStore((s) => s.isAuthenticate);
  const { rehydrate, loadGuestData, setGuestMode } = useStorefront();

  useEffect(() => {
    let mounted = true;
    
    async function checkAuthAndSync() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!mounted) return;
      
      if (user) {
        setGuestMode(false);
        rehydrate();
      } else {
        // Cookie was stale, clear auth state
        setGuestMode(true);
        loadGuestData();
      }
    }

    checkAuthAndSync();
    return () => { mounted = false; };
  }, [isAuthenticate, rehydrate, loadGuestData, setGuestMode]);

  return <>{children}</>;
}
