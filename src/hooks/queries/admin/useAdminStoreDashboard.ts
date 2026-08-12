import { useQuery } from "@tanstack/react-query";
import { fetchStoreDashboardData } from "@/api/api-function/storeDashboard.function";

export function useAdminStoreDashboard() {
  return useQuery({
    queryKey: ["admin-store", "dashboard"],
    queryFn: () => fetchStoreDashboardData(),
    staleTime: 1000 * 60,
  });
}