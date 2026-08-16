/**
 * Returns the canonical base URL for the site.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (set in .env — change this when deploying)
 * 2. window.location.origin (browser client-side fallback)
 * 3. http://localhost:3000 (ultimate fallback for SSR)
 *
 * When you deploy to Vercel (or any host), update NEXT_PUBLIC_SITE_URL in
 * your hosting environment's variables to your deployed URL, e.g.:
 *   NEXT_PUBLIC_SITE_URL=https://clicon-next-final-project.vercel.app
 */
export function getSiteUrl(): string {
  // Highest priority: explicit env variable (works in both server and client)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  // Client-side fallback: use the browser's current origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Server-side ultimate fallback
  return "http://localhost:3000";
}
