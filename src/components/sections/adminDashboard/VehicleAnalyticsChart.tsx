"use client";

import { Cell, Pie, PieChart } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { VehicleAnalytics } from "@/types/interface/admin/dashboard.interface";

interface VehicleAnalyticsChartProps {
  data: VehicleAnalytics | undefined;
  loading?: boolean;
}

const chartConfig = {
  available: { label: "Available", color: "hsl(var(--chart-1))" },
  assigned: { label: "Assigned", color: "hsl(var(--chart-2))" },
  maintenance: { label: "Maintenance", color: "hsl(var(--chart-4))" },
  inactive: { label: "Inactive", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export function VehicleAnalyticsChart({
  data,
  loading,
}: VehicleAnalyticsChartProps) {
  const chartData = data
    ? (Object.keys(chartConfig) as (keyof VehicleAnalytics)[]).map((key) => ({
        key,
        label: chartConfig[key].label,
        value: data[key],
        fill: chartConfig[key].color,
      }))
    : [];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Vehicle Fleet</CardTitle>
        <CardDescription>Current status of all vehicles</CardDescription>
      </CardHeader>
      <CardContent>
        {loading || !data ? (
          <Skeleton className="mx-auto h-52 w-52 rounded-full" />
        ) : total === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No vehicle data yet.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-64"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                innerRadius={55}
                outerRadius={85}
                strokeWidth={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="label" />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
