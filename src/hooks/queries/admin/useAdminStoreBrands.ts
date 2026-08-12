import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBrandsWithCounts,
  deleteBrand,
} from "@/api/api-function/adminBrands.function";

const BRANDS_KEY = ["admin-store", "brands"];

export function useAdminBrands() {
  return useQuery({
    queryKey: BRANDS_KEY,
    queryFn: () => fetchBrandsWithCounts(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDeleteAdminBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (brandId: string) => deleteBrand(brandId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BRANDS_KEY }),
  });
}
