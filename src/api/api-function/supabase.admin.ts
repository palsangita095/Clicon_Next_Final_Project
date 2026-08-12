"server-only";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ! service-role client — bypasses RLS. Only use in trusted server code (webhooks, admin routes). Never import in client components.

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("Supabase credentials missing. Supabase Admin will fail if used.");
      // Return a dummy client to avoid crashing at build time if env vars are missing
      _supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
        process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy-key"
      );
    } else {
      _supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    }
  }
  return _supabaseAdmin;
}

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop];
  },
});
