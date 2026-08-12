export const ADMIN_DASHBOARD_PATH = "/admin/dashboard";
export const CUSTOMER_DASHBOARD_PATH = "/account";

export function getDashboardPath(role?: string | null) {
  return role === "admin" ? ADMIN_DASHBOARD_PATH : CUSTOMER_DASHBOARD_PATH;
}

export function isAllowedRedirect(path: string, role?: string | null) {
  if (path.startsWith("/admin")) return role === "admin";
  if (path.startsWith("/account")) return role !== "admin";
  return true;
}
