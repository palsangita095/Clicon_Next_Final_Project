import { useQuery } from "@tanstack/react-query";
import { fetchPromotionalBanners } from "@/api/api-function/products.function";

export function usePromotionalBanners(section?: string) {
  return useQuery({
    queryKey: ["promotionalBanners", section],
    queryFn: () => fetchPromotionalBanners(section),
    staleTime: 1000 * 60 * 5,
  });
}
