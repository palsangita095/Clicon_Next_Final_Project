"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";
import NotificationItem from "./NotificationItem";
import {
  useNotifications,
  useMarkAllNotificationsAsRead,
  getUnreadCount,
} from "@/hooks/queries/useNotifications";
import { RefreshCwIcon } from "lucide-react";

export default function NotificationPanel({
  profileId,
}: {
  profileId?: string;
}) {
  const {
    data: notifications,
    isLoading,
    isFetching,
    refetch,
  } = useNotifications(profileId);
  const markAllAsRead = useMarkAllNotificationsAsRead(profileId);

  
  const hasAutoMarkedRef = useRef(false);

  useEffect(() => {
    if (hasAutoMarkedRef.current) return;
    if (!notifications) return;

    const unread = getUnreadCount(notifications);
    if (unread > 0) {
      markAllAsRead.mutate();
    }
    hasAutoMarkedRef.current = true;

    
    return () => {
      hasAutoMarkedRef.current = false;
    };
    
  }, [notifications === undefined]);

  return (
    <div className="w-80">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-sm font-semibold">Notifications</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCwIcon
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => markAllAsRead.mutate()}
            disabled={!notifications?.length || markAllAsRead.isPending}
          >
            Mark all read
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 py-6 text-xs text-muted-foreground text-center">
          Loading notifications...
        </div>
      ) : !notifications?.length ? (
        <Empty>
          <EmptyHeader>
            <EmptyDescription>No notifications found</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ScrollArea className="max-h-96">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </ScrollArea>
      )}
    </div>
  );
}
