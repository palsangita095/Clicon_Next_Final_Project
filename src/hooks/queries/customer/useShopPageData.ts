import { useQuery } from "@tanstack/react-query";
import { fetchShopPageData } from "@/api/api-function/products.function";

export function useShopPageData() {
  return useQuery({
    queryKey: ["shop", "page-data"],
    queryFn: () => fetchShopPageData(),
    staleTime: 1000 * 60 * 5,
  });
}