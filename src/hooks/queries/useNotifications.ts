import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getCombinedNotificationsFns,
  markAllCombinedNotificationsReadFns,
} from "@/api/api-function/notifications.function";
import { AppNotification } from "@/types/interface/notification.interface";

export const notificationKeys = {
  all: (profileId?: string) => ["notifications", profileId] as const,
};

export const useNotifications = (profileId?: string) => {
  const role = useAuthStore((s) => s.user?.role);

  return useQuery({
    queryKey: notificationKeys.all(profileId),
    queryFn: () => getCombinedNotificationsFns(profileId as string, role),
    enabled: !!profileId,
    staleTime: 60_000,
  });
};

export const useMarkAllNotificationsAsRead = (profileId?: string) => {
  const role = useAuthStore((s) => s.user?.role);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      markAllCombinedNotificationsReadFns(profileId as string, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all(profileId),
      });
    },
  });
};

export const getUnreadCount = (notifications?: AppNotification[]) =>
  notifications?.filter((n) => !n.read).length ?? 0;


