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
import type { DeliveryAnalytics } from "@/types/interface/admin/dashboard.interface";

interface DeliveryAnalyticsChartProps {
  data: DeliveryAnalytics | undefined;
  loading?: boolean;
}

const chartConfig = {
  value: { label: "Deliveries", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function DeliveryAnalyticsChart({
  data,
  loading,
}: DeliveryAnalyticsChartProps) {
  const chartData = data
    ? [
        { label: "Today", value: data.today },
        { label: "This Week", value: data.this_week },
        { label: "This Month", value: data.this_month },
        { label: "Completed", value: data.completed },
        { label: "Failed", value: data.failed },
      ]
    : [];

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Delivery Performance</CardTitle>
        <CardDescription>Volume and outcomes across periods</CardDescription>
      </CardHeader>
      <CardContent>
        {loading || !data ? (
          <Skeleton className="h-52 w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="max-h-64 w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
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
