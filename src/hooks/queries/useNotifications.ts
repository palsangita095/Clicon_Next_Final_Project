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

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   fetchNotificationsByProfile,
//   markNotificationAsRead,
//   markAllNotificationsAsRead,
// } from "@/api/api-function/notifications.function";
// import { AppNotification } from "@/types/interface/notification.interface";

// export const notificationKeys = {
//   all: (profileId: string) => ["notifications", profileId] as const,
// };

// export function useNotifications(profileId?: string) {
//   return useQuery({
//     queryKey: notificationKeys.all(profileId ?? ""),
//     queryFn: () => fetchNotificationsByProfile(profileId as string),
//     enabled: !!profileId,
//     staleTime: 15_000,
//   });
// }

// /** Derived, memo-free helper — call alongside useNotifications() */
// export function getUnreadCount(notifications?: AppNotification[]) {
//   if (!notifications?.length) return 0;
//   return notifications.filter((n) => !n.read).length;
// }

// export function useMarkNotificationAsRead(profileId?: string) {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (id: string) => markNotificationAsRead(id),
//     onMutate: async (id) => {
//       if (!profileId) return;
//       const key = notificationKeys.all(profileId);
//       await queryClient.cancelQueries({ queryKey: key });
//       const previous = queryClient.getQueryData<AppNotification[]>(key);

//       queryClient.setQueryData<AppNotification[]>(key, (old) =>
//         old?.map((n) => (n.id === id ? { ...n, read: true } : n)),
//       );

//       return { previous };
//     },
//     onError: (_err, _id, context) => {
//       if (profileId && context?.previous) {
//         queryClient.setQueryData(
//           notificationKeys.all(profileId),
//           context.previous,
//         );
//       }
//     },
//   });
// }

// export function useMarkAllNotificationsAsRead(profileId?: string) {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: () => markAllNotificationsAsRead(profileId as string),
//     onMutate: async () => {
//       if (!profileId) return;
//       const key = notificationKeys.all(profileId);
//       await queryClient.cancelQueries({ queryKey: key });
//       const previous = queryClient.getQueryData<AppNotification[]>(key);

//       queryClient.setQueryData<AppNotification[]>(key, (old) =>
//         old?.map((n) => ({ ...n, read: true })),
//       );

//       return { previous };
//     },
//     onError: (_err, _vars, context) => {
//       if (profileId && context?.previous) {
//         queryClient.setQueryData(
//           notificationKeys.all(profileId),
//           context.previous,
//         );
//       }
//     },
//   });
// }
