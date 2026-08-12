"use client";

import { createClient } from "@/lib/supabase/client";
import { useStorefront } from "@/store/useStorefront";


// ! the Supabase tables for the signed-in user. It runs once at the app root
// ! so EVERY login path (login form, /signin page, Google OAuth, admin flows)
// ! is covered — regardless of which store/flow writes the app cookies.
export function setupStorefrontSessionIsolation() {
  const supabase = createClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      
      useStorefront.getState().reset();
      return;
    }

  
    useStorefront.getState().rehydrate();
  });

  return () => subscription.unsubscribe();
}
