"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
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
import type { CustomerAnalytics } from "@/types/interface/admin/dashboard.interface";

interface CustomerAnalyticsChartProps {
  data: CustomerAnalytics | undefined;
  loading?: boolean;
}

const chartConfig = {
  active: { label: "Active", color: "hsl(var(--chart-1))" },
  inactive: { label: "Inactive", color: "hsl(var(--chart-3))" },
  new: { label: "New", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

export function CustomerAnalyticsChart({
  data,
  loading,
}: CustomerAnalyticsChartProps) {
  const chartData = data
    ? [
        { key: "active", label: "Active", value: data.active_customers },
        { key: "inactive", label: "Inactive", value: data.inactive_customers },
        { key: "new", label: "New", value: data.new_customers },
      ]
    : [];

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">Customers</CardTitle>
        <CardDescription>
          {data?.top_customer
            ? `Top customer: ${data.top_customer}`
            : "Active, inactive, and newly onboarded"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading || !data ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="max-h-56 w-full">
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
                width={70}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={6}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={
                      chartConfig[entry.key as keyof typeof chartConfig].color
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
