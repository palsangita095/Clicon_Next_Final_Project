"use client";

import { createClient } from "@/lib/supabase/client";
import { useStorefront } from "@/store/useStorefront";

// ! Central auth-transition handler that loads cart / wishlist / compare from
// ! the Supabase tables for the signed-in user. It runs once at the app root
// ! so EVERY login path (login form, /signin page, Google OAuth, admin flows)
// ! is covered — regardless of which store/flow writes the app cookies.
export function setupStorefrontSessionIsolation() {
  const supabase = createClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      // ! Explicit sign-out: clear ONLY the in-memory state. The user's rows
      // ! stay in the Supabase cart / wishlist / compare tables so their data
      // ! restores automatically on the next login.
      useStorefront.getState().reset();
      return;
    }

    // ! Signed in OR guest browsing on a fresh page load: load this user's
    // ! rows from Supabase (guests resolve to empty state).
    useStorefront.getState().rehydrate();
  });

  return () => subscription.unsubscribe();
}
