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
import type { DispatcherAnalytics } from "@/types/interface/admin/dashboard.interface";

interface DispatcherAnalyticsChartProps {
  data: DispatcherAnalytics | undefined;
  loading?: boolean;
}

const chartConfig = {
  value: { label: "Count", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

export function DispatcherAnalyticsChart({
  data,
  loading,
}: DispatcherAnalyticsChartProps) {
  const chartData = data
    ? [
        { label: "Active Dispatchers", value: data.active_dispatchers },
        { label: "Total Assignments", value: data.total_assignments },
        { label: "Pending Assignments", value: data.pending_assignments },
      ]
    : [];

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Dispatchers</CardTitle>
        <CardDescription>Workload across your dispatch team</CardDescription>
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
                fontSize={11}
                interval={0}
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
