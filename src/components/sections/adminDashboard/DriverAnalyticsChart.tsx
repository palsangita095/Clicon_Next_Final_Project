"use client";

import { Star } from "lucide-react";
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
import type { DriverAnalytics } from "@/types/interface/admin/dashboard.interface";

interface DriverAnalyticsChartProps {
  data: DriverAnalytics | undefined;
  loading?: boolean;
}

const chartConfig = {
  available: { label: "Available", color: "hsl(var(--chart-1))" },
  busy: { label: "Busy", color: "hsl(var(--chart-2))" },
  offline: { label: "Offline", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export function DriverAnalyticsChart({
  data,
  loading,
}: DriverAnalyticsChartProps) {
  const chartData = data
    ? [
        { key: "available", label: "Available", value: data.available },
        { key: "busy", label: "Busy", value: data.busy },
        { key: "offline", label: "Offline", value: data.offline },
      ]
    : [];

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Drivers</CardTitle>
        <CardDescription>Availability across your fleet</CardDescription>
      </CardHeader>
      <CardContent>
        {loading || !data ? (
          <Skeleton className="mx-auto h-48 w-48 rounded-full" />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-56"
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
                  innerRadius={50}
                  outerRadius={78}
                  strokeWidth={2}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={
                        chartConfig[entry.key as keyof typeof chartConfig].color
                      }
                    />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="label" />} />
              </PieChart>
            </ChartContainer>

            <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-chart-4 text-chart-4" />
              <span className="font-medium text-foreground">
                {data.average_rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">avg. rating</span>
              {data.top_driver && (
                <span className="text-muted-foreground">
                  · Top: {data.top_driver}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
