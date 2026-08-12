import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminUsers,
  updateUserAccountStatus,
  fetchUserDetail,
  replyToSupportQuery,
} from "@/api/api-function/adminUsers.function";

const USERS_KEY = ["admin-store", "users"];

export function useAdminUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: () => fetchAdminUsers(),
    staleTime: 1000 * 60,
  });
}

export function useUserDetail(userId: string | null) {
  return useQuery({
    queryKey: ["admin-store", "user", userId],
    queryFn: () => fetchUserDetail(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}

export function useUpdateUserAccountStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, newStatus }: { userId: string; newStatus: string }) =>
      updateUserAccountStatus(userId, newStatus),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useReplyToSupportQuery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ queryId, reply }: { queryId: string; reply: string }) =>
      replyToSupportQuery(queryId, reply),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}
