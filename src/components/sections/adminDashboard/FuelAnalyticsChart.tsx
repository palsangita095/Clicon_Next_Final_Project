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
import type { FuelAnalytics } from "@/types/interface/admin/dashboard.interface";

interface FuelAnalyticsChartProps {
  data: FuelAnalytics | undefined;
  loading?: boolean;
}

const chartConfig = {
  value: { label: "Refuels", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function FuelAnalyticsChart({ data, loading }: FuelAnalyticsChartProps) {
  const chartData = data
    ? [
        { label: "Refuels", value: data.total_refuels },
        { label: "Liters", value: Math.round(data.total_liters) },
      ]
    : [];

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Fuel Usage</CardTitle>
        <CardDescription>Refuel volume and cost overview</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading || !data ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Total Cost</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(data.total_cost)}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">
                  Avg. Cost / Refuel
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(data.average_cost_per_refuel)}
                </p>
              </div>
            </div>

            <ChartContainer config={chartConfig} className="max-h-40 w-full">
              <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  dataKey="label"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={55}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={6} />
              </BarChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
