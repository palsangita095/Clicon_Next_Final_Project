import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminPromotions,
  createAdminPromotion,
  togglePromotionActive,
  deleteAdminPromotion,
  PromotionPayload,
} from "@/api/api-function/adminPromotions.function";

const PROMOTIONS_KEY = ["admin-store", "promotions"];

export function useAdminPromotions() {
  return useQuery({
    queryKey: PROMOTIONS_KEY,
    queryFn: () => fetchAdminPromotions(),
    staleTime: 1000 * 60,
  });
}

export function useCreateAdminPromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PromotionPayload) => createAdminPromotion(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROMOTIONS_KEY }),
  });
}

export function useTogglePromotionActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, current }: { id: string; current: boolean }) =>
      togglePromotionActive(id, current),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROMOTIONS_KEY }),
  });
}

export function useDeleteAdminPromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminPromotion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROMOTIONS_KEY }),
  });
}
