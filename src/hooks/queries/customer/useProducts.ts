import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchBestDealsProducts, ProductFilters } from "@/api/api-function/products.function";

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 1000 * 60 * 5, 
  });
}

export function useBestDeals() {
  return useQuery({
    queryKey: ["products", "best-deals"],
    queryFn: () => fetchBestDealsProducts(),
    staleTime: 1000 * 60 * 2, 
  });
}
