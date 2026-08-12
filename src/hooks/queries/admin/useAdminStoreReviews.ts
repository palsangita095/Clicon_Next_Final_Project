import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminReviews,
  moderateReview,
} from "@/api/api-function/adminReviews.function";

const REVIEWS_KEY = ["admin-store", "reviews"];

export function useAdminReviews() {
  return useQuery({
    queryKey: REVIEWS_KEY,
    queryFn: () => fetchAdminReviews(),
    staleTime: 1000 * 60,
  });
}

export function useModerateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      moderateReview(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REVIEWS_KEY }),
  });
}
