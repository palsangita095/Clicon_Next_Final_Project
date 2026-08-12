import { useQuery } from "@tanstack/react-query";
import { fetchBrandsByCategory } from "@/api/api-function/products.function";

export function useBrands(categoryId?: string) {
  return useQuery({
    queryKey: ["brands", categoryId],
    queryFn: () => fetchBrandsByCategory(categoryId),
    staleTime: 1000 * 60 * 10,
    enabled: true,
  });
}
