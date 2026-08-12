"use client";

import { BellIcon } from "@animateicons/react/lucide";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import NotificationPanel from "./NotificationPanel";
import {
  getUnreadCount,
  useNotifications,
} from "@/hooks/queries/useNotifications";

export default function NotificationBell() {
  const user = useAuthStore((s) => s.user);
  const isOpen = useNotificationStore((s) => s.isOpen);
  const openPanel = useNotificationStore((s) => s.open);
  const close = useNotificationStore((s) => s.close);
  const { data: notifications } = useNotifications(user?.id);

  const unreadCount = getUnreadCount(notifications);

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => (open ? openPanel() : close())}
    >
      <DropdownMenuTrigger asChild>
        <Button className="relative" variant="outline" size="icon" aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}>
          <BellIcon className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-medium border border-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit p-0">
        <NotificationPanel profileId={user?.id} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
