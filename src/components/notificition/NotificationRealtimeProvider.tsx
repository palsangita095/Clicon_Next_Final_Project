"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase.config";
import { useAuthStore } from "@/store/useAuthStore";
import { notificationKeys } from "@/hooks/queries/useNotifications";
import { AppNotification } from "@/types/interface/notification.interface";

export default function NotificationRealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const profileId = user?.id;
  const role = user?.role;

  useEffect(() => {
    if (!profileId) return;

    const key = notificationKeys.all(profileId);
    let roleChannel: ReturnType<typeof supabase.channel> | null = null;
    let isMounted = true;

  
    const profileChannel = supabase
      .channel(`notifications-${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          const newRow = {
            ...(payload.new as AppNotification),
            source: "profile" as const,
          };
          queryClient.setQueryData<AppNotification[]>(key, (old) =>
            old ? [newRow, ...old] : [newRow],
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          const updatedRow = {
            ...(payload.new as AppNotification),
            source: "profile" as const,
          };
          queryClient.setQueryData<AppNotification[]>(key, (old) =>
            old?.map((n) =>
              n.id === updatedRow.id && n.source === "profile" ? updatedRow : n,
            ),
          );
        },
      )
      .subscribe();

  
    const setupRoleChannel = async () => {
      if (role === "customer") {
        const { data: row } = await supabase
          .from("customers")
          .select("id")
          .eq("profile_id", profileId)
          .single();

        if (!row?.id || !isMounted) return;

        roleChannel = supabase
          .channel(`customer-notifications-${row.id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "customer_notifications",
              filter: `customer_id=eq.${row.id}`,
            },
            (payload) => {
              const newRow = {
                ...(payload.new as AppNotification),
                source: "customer" as const,
              };
              queryClient.setQueryData<AppNotification[]>(key, (old) =>
                old ? [newRow, ...old] : [newRow],
              );
            },
          )
          .subscribe();
      }

      if (role === "driver") {
        const { data: row } = await supabase
          .from("drivers")
          .select("id")
          .eq("profile_id", profileId)
          .single();

        if (!row?.id || !isMounted) return;

        roleChannel = supabase
          .channel(`driver-notifications-${row.id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "driver_notifications",
              filter: `driver_id=eq.${row.id}`,
            },
            (payload) => {
              const newRow = {
                ...(payload.new as AppNotification),
                source: "driver" as const,
              };
              queryClient.setQueryData<AppNotification[]>(key, (old) =>
                old ? [newRow, ...old] : [newRow],
              );
            },
          )
          .subscribe();
      }
    };

    setupRoleChannel();

    return () => {
      isMounted = false;
      supabase.removeChannel(profileChannel);
      if (roleChannel) supabase.removeChannel(roleChannel);
    };
  }, [profileId, role, queryClient]);

  return <>{children}</>;
}


