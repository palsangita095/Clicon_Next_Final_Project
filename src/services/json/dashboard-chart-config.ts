import { ChartConfig } from "@/components/ui/chart";


export const STATUS_CHART_CONFIG: ChartConfig = {
  pending: { label: "Pending", color: "hsl(var(--chart-1))" },
  in_transit: { label: "In Transit", color: "hsl(var(--chart-2))" },
  out_for_delivery: { label: "Out for Delivery", color: "hsl(var(--chart-3))" },
  completed: { label: "Completed", color: "hsl(var(--chart-4))" },
  cancelled: { label: "Cancelled", color: "hsl(var(--chart-5))" },
};

export const TREND_CHART_CONFIG: ChartConfig = {
  shipments: { label: "Shipments", color: "hsl(var(--chart-1))" },
  spend: { label: "Spend", color: "hsl(var(--chart-2))" },
};
