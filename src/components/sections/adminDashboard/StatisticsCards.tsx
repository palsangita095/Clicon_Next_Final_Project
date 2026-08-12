"use client";

import { Truck, Car, Route as RouteIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStatistics } from "@/types/interface/admin/dashboard.interface";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ActivityIcon,
  IndianRupeeIcon,
  PackageOpenIcon,
  UserCogIcon,
  UsersIcon,
} from "@animateicons/react/lucide";

interface StatisticsCardsProps {
  statistics: DashboardStatistics | undefined;
  loading?: boolean;
}

interface StatItem {
  label: string;
  value: string;
  icon: React.ElementType;
  // Full color value, not a Tailwind class — see note below.
  accent: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

function buildStats(statistics: DashboardStatistics): StatItem[] {
  return [
    {
      label: "Total Shipments",
      value: formatNumber(statistics.total_shipments),
      icon: PackageOpenIcon,
      accent: "hsl(var(--chart-1))",
    },
    {
      label: "Active Deliveries",
      value: formatNumber(statistics.active_deliveries),
      icon: ActivityIcon,
      accent: "hsl(var(--chart-2))",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(statistics.total_revenue),
      icon: IndianRupeeIcon,
      accent: "hsl(var(--chart-3))",
    },
    {
      label: "Customers",
      value: formatNumber(statistics.total_customers),
      icon: UsersIcon,
      accent: "hsl(var(--chart-4))",
    },
    {
      label: "Drivers",
      value: formatNumber(statistics.total_drivers),
      icon: Truck,
      accent: "hsl(var(--chart-5))",
    },
    {
      label: "Dispatchers",
      value: formatNumber(statistics.total_dispatchers),
      icon: UserCogIcon,
      accent: "hsl(var(--chart-1))",
    },
    {
      label: "Vehicles",
      value: formatNumber(statistics.total_vehicles),
      icon: Car,
      accent: "hsl(var(--chart-2))",
    },
    {
      label: "Routes",
      value: formatNumber(statistics.total_routes),
      icon: RouteIcon,
      accent: "hsl(var(--chart-3))",
    },
  ];
}

function StatCardSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center gap-4 p-4">
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StatisticsCards({ statistics, loading }: StatisticsCardsProps) {
  if (loading || !statistics) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const stats = buildStats(statistics);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 ">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-border/60 transition-shadow hover:shadow-sm"
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted"
              style={{ color: stat.accent }}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground truncate">
                {stat.label}
              </span>
              <span className="text-lg font-semibold text-foreground truncate">
                {stat.value}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
