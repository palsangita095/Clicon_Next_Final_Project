import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInventoryProducts,
  updateProductStock,
} from "@/api/api-function/adminInventory.function";

const INVENTORY_KEY = ["admin-store", "inventory"];

export function useAdminInventory() {
  return useQuery({
    queryKey: INVENTORY_KEY,
    queryFn: () => fetchInventoryProducts(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateProductStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      updateProductStock(productId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INVENTORY_KEY }),
  });
}
