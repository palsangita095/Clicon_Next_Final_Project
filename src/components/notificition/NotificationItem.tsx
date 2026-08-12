"use client";

import { cn } from "@/lib/utils";
import { AppNotification } from "@/types/interface/notification.interface";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationItem({
  notification,
}: {
  notification: AppNotification;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 px-4 py-3 border-b last:border-b-0 transition-colors",
        !notification.read && "bg-muted/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium leading-none">
          {notification.title}
        </span>
        {!notification.read && (
          <span className="h-2 w-2 rounded-full bg-red-600 mt-1 shrink-0" />
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-snug">
        {notification.message}
      </p>
      <span className="text-[11px] text-muted-foreground/70 mt-0.5">
        {timeAgo(notification.created_at)}
      </span>
    </div>
  );
}
