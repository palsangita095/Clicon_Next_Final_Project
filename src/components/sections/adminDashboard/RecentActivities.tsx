"use client";

import {
  Package,
  Truck,
  UserPlus,
  AlertCircle,
  Fuel,
  Route as RouteIcon,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecentActivity } from "@/types/interface/admin/dashboard.interface";

interface RecentActivitiesProps {
  activities: RecentActivity[] | undefined;
  loading?: boolean;
}

const ICON_BY_TYPE: Record<string, React.ElementType> = {
  shipment: Package,
  delivery: Truck,
  customer: UserPlus,
  driver: Truck,
  fuel: Fuel,
  route: RouteIcon,
  alert: AlertCircle,
};

function relativeTime(dateString: string) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-3">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="flex w-full flex-col gap-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

export function RecentActivities({
  activities,
  loading,
}: RecentActivitiesProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <CardDescription>Latest events across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <ActivitySkeleton key={i} />
            ))}
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Nothing to show yet. Activity will appear here as it happens.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {activities.map((activity) => {
              const Icon = ICON_BY_TYPE[activity.type] ?? Bell;
              return (
                <li key={activity.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {activity.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {relativeTime(activity.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
