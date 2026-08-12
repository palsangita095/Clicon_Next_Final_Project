"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { RouteAnalytics } from "@/types/interface/admin/dashboard.interface";

interface RouteAnalyticsChartProps {
  data: RouteAnalytics | undefined;
  loading?: boolean;
}

const chartConfig = {
  value: { label: "Routes", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export function RouteAnalyticsChart({
  data,
  loading,
}: RouteAnalyticsChartProps) {
  const chartData = data
    ? [
        { label: "Total", value: data.total_routes },
        { label: "Active", value: data.active_routes },
        { label: "Completed", value: data.completed_routes },
      ]
    : [];

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Routes</CardTitle>
        <CardDescription>Total, active, and completed routes</CardDescription>
      </CardHeader>
      <CardContent>
        {loading || !data ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="max-h-56 w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={6} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
