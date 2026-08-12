"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { fixImageUrl } from "@/lib/imageFallback";
import { useAdminStoreDashboard } from "@/hooks/queries/admin/useAdminStoreDashboard";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreHorizontal,
  Info,
  Edit2,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from "recharts";
import { NumberTicker } from "@/components/ui/number-ticker";

function buildDateRange(days: number) {
  const daysArr = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    daysArr.push(d.toISOString().slice(0, 10));
  }
  return daysArr;
}

const DEFAULT_BAR = [
  { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 0 },
  { name: 'Thu', value: 0 }, { name: 'Fri', value: 0 }, { name: 'Sat', value: 0 }, { name: 'Sun', value: 0 },
];

const CATEGORY_COLORS = ["#FF8C00", "#6366F1", "#00BFFF", "#FF3030", "#22C55E", "#EAB308", "#EC4899", "#14B8A6"];

function MetricCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between animate-pulse">
      <div className="flex-1">
        <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
        <div className="h-7 w-28 bg-gray-200 rounded" />
      </div>
      <div className="h-10 w-20 bg-gray-200 rounded" />
    </div>
  );
}

function ChartSkeleton({ className = "h-64" }: { className?: string }) {
  return <div className={`${className} bg-gray-100 rounded-lg animate-pulse`} />;
}

export default function AdminDashboardPage() {
  const [dateRange] = useState(() => {
    const now = new Date();
    const start = new Date(now); start.setDate(now.getDate() - 28);
    return `${start.toLocaleDateString('en-US')} - ${now.toLocaleDateString('en-US')}`;
  });
  const [mounted, setMounted] = useState(false);
  const [realOrders, setRealOrders] = useState<any[]>([]);
  const [metrics, setMetrics] = useState([
    { label: "Total Sales", value: "₹0", raw: 0, change: "+0%", isPositive: true, data: [0, 0] },
    { label: "Total Orders", value: "0", raw: 0, change: "0%", isPositive: true, data: [0, 0] },
    { label: "Users", value: "0", raw: 0, change: "0%", isPositive: true, data: [0, 0] },
    { label: "Out of Stock", value: "0", raw: 0, change: "0%", isPositive: false, data: [0, 0] },
  ]);
  const [barChartData, setBarChartData] = useState(DEFAULT_BAR);
  const [pieData, setPieData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [pieCenter, setPieCenter] = useState<{ label: string; percent: number } | null>(null);
  const [dailySalesData, setDailySalesData] = useState<{ name: string; revenue: number }[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: dashboardData, isLoading, isError, refetch } = useAdminStoreDashboard();

  const totalSalesValue = dashboardData?.totalSalesValue ?? 0;
  const totalOrdersCount = dashboardData?.totalOrdersCount ?? 0;
  const totalUsersCount = dashboardData?.totalUsersCount ?? 0;
  const completedCount = dashboardData?.salesData?.length ?? 0;

  const conversionRate =
    dashboardData && totalUsersCount > 0
      ? Math.min(100, (totalOrdersCount / totalUsersCount) * 100)
      : 0;

  useEffect(() => {
    if (!dashboardData) return;
    const { salesData, totalSalesValue, totalOrdersCount, totalUsersCount, outOfStockCount, latestOrders } = dashboardData;

    const totalSalesVal = totalSalesValue || 0;

    // Weekly revenue for the bar chart + Total Sales sparkline (real data)
    const weeklyDays = buildDateRange(7);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyRevenue = weeklyDays.map((day) =>
      (salesData || []).filter((o) => o.created_at?.startsWith(day)).reduce((s, o) => s + (Number(o.total_amount) || 0), 0)
    );
    setBarChartData(weeklyDays.map((d, i) => ({ name: weekdays[new Date(d).getDay()], value: weeklyRevenue[i] || 0 })));

    setMetrics([
      { label: "Total Sales", value: `₹${totalSalesVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, raw: totalSalesVal, change: "+0%", isPositive: true, data: [0, ...weeklyRevenue] },
      { label: "Total Orders", value: `${totalOrdersCount || 0}`, raw: totalOrdersCount || 0, change: "0%", isPositive: true, data: [0, totalOrdersCount || 0] },
      { label: "Users", value: `${totalUsersCount || 0}`, raw: totalUsersCount || 0, change: "0%", isPositive: true, data: [0, totalUsersCount || 0] },
      { label: "Out of Stock", value: `${outOfStockCount || 0}`, raw: outOfStockCount || 0, change: "0%", isPositive: false, data: [0, outOfStockCount || 0] },
    ]);

    if (latestOrders) setRealOrders(latestOrders);

    
    const categoryRevenue = new Map<string, number>();
    (latestOrders || []).forEach((order) => {
      (order.order_items || []).forEach((item) => {
        const cat =
          Array.isArray(item.products?.categories)
            ? item.products?.categories[0]
            : item.products?.categories;
        const name = cat?.name || "Uncategorized";
        const revenue = (Number(item.price_at_time) || 0) * (Number(item.quantity) || 0);
        categoryRevenue.set(name, (categoryRevenue.get(name) || 0) + revenue);
      });
    });
    const categoryEntries = Array.from(categoryRevenue.entries());
    const totalCategoryRevenue = categoryEntries.reduce((s, [, v]) => s + v, 0);
    setPieData(
      categoryEntries.map(([name, value], i) => ({
        name,
        value: Math.round(value),
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }))
    );
    setPieCenter(
      totalCategoryRevenue > 0 && categoryEntries.length > 0
        ? {
            label: categoryEntries[0][0],
            percent: Math.round((categoryEntries[0][1] / totalCategoryRevenue) * 100),
          }
        : null
    );

    
    const salesDays = buildDateRange(16);
    setDailySalesData(
      salesDays.map((day) => ({
        name: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: (salesData || [])
          .filter((o) => o.created_at?.startsWith(day))
          .reduce((s, o) => s + (Number(o.total_amount) || 0), 0),
      }))
    );
  }, [dashboardData]);

  const hasSalesData = useMemo(
    () => dashboardData && (dashboardData.salesData?.length ?? 0) > 0,
    [dashboardData]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "text-red-500";
      case "Shipping": return "text-gray-900";
      case "Refund": return "text-yellow-500";
      case "Completed": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B]">Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-200 rounded-md px-4 py-2 text-sm text-gray-600 flex items-center gap-2 cursor-pointer shadow-sm">
            {dateRange} <ChevronRight className="w-4 h-4 rotate-90" />
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-md shadow-sm border border-gray-100">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

    
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-red-600">Failed to load dashboard data. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-800 border border-red-200 rounded-md px-3 py-1.5 hover:bg-red-100"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? [0, 1, 2, 3].map((i) => <MetricCardSkeleton key={i} />)
          : metrics.map((metric, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">{metric.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-baseline gap-1">
                    {metric.label === "Total Sales" && <span className="text-xl">₹</span>}
                    <NumberTicker
                      value={metric.raw}
                      decimalPlaces={metric.label === "Total Sales" ? 2 : 0}
                      className="text-2xl font-bold text-gray-900 tracking-tight"
                    />
                  </h3>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-bold flex items-center gap-1 ${metric.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.change}
                    {metric.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </span>
                  <div className="h-10 w-20 mt-2">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metric.data.map((val, i) => ({ val, i }))}>
                          <Line
                            type="monotone"
                            dataKey="val"
                            stroke={metric.isPositive ? "#FF8C00" : "#EF4444"}
                            strokeWidth={3}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            ))}
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-[#1E293B]">Weekly Revenue</h3>
            {!isLoading && !hasSalesData && (
              <span className="text-xs text-gray-400">No sales recorded yet</span>
            )}
          </div>
          <div className="h-64">
            {isLoading ? (
              <ChartSkeleton />
            ) : mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} barSize={20}>
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dx={-10} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 0 ? "#FF8C00" : "#E2E8F0"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

       
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[#1E293B]">Conversion Rate</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <Info className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center relative my-4">
            {isLoading ? (
              <ChartSkeleton className="w-48 h-48 rounded-full" />
            ) : (
              <div className="w-48 h-48 relative">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="100%"
                      barSize={12}
                      data={[{ name: "conversion", value: conversionRate, fill: "#6366F1" }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar background={{ fill: "#F1F5F9" }} dataKey="value" cornerRadius={12} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-[#1E293B]">{Math.round(conversionRate)}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-gray-500 font-medium">Total Orders</p>
              <p className="text-gray-500 font-medium">Total Users</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#1E293B]">{(totalOrdersCount || 0).toLocaleString()}</p>
              <p className="font-bold text-[#1E293B]">{(totalUsersCount || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#1E293B]">Revenue by Category</h3>
            {!isLoading && pieData.length === 0 && (
              <span className="text-xs text-gray-400">No order data yet</span>
            )}
          </div>
          <div className="h-64 relative flex items-center justify-center">
            {isLoading ? (
              <ChartSkeleton />
            ) : pieData.length === 0 ? (
              <p className="text-sm text-gray-400">No revenue data to display.</p>
            ) : mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            {pieCenter && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-[#1E293B]">{pieCenter.percent}%</span>
                <span className="text-xs text-gray-400 mt-0.5">{pieCenter.label}</span>
              </div>
            )}
          </div>
        </div>

        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#1E293B]">Daily Sales</h3>
            {!isLoading && !hasSalesData && (
              <span className="text-xs text-gray-400">No completed sales yet</span>
            )}
          </div>

          <div className="flex gap-8 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Sales</p>
              <div className="flex items-end gap-3">
                <span className="text-2xl font-bold text-[#1E293B]">₹{totalSalesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Completed Orders</p>
              <div className="flex items-end gap-3">
                <span className="text-2xl font-bold text-[#1E293B]">{completedCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-2">Last 16 days — completed order revenue</p>
          <div className="h-40">
            {isLoading ? (
              <ChartSkeleton className="h-40" />
            ) : dailySalesData.length === 0 || !hasSalesData ? (
              <p className="text-sm text-gray-400 h-40 flex items-center justify-center">No sales data to display.</p>
            ) : mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySalesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#FF8C00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF8C00"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-b-4 border-b-blue-500">
        <div className="p-6 flex justify-between items-center border-b border-gray-50">
          <h3 className="font-bold text-[#1E293B] text-lg">Latest Orders</h3>
          <button className="text-sm text-gray-500 flex items-center gap-1 hover:text-brand-orange">
            More →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 font-medium">
                <th className="px-6 py-4">Products</th>
                <th className="px-6 py-4">QTY ▾</th>
                <th className="px-6 py-4">Date ▾</th>
                <th className="px-6 py-4">Revenue ▾</th>
                <th className="px-6 py-4">Net Profit ▾</th>
                <th className="px-6 py-4">Status ▾</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [0, 1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-gray-50 animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full" />
                          <div className="h-3 w-40 bg-gray-200 rounded" />
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-3 w-6 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-3 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-3 w-14 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-3 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-3 w-8 bg-gray-200 rounded ml-auto" /></td>
                    </tr>
                  ))
                : realOrders.map((order) => {
                    const firstItem = order.order_items?.[0];
                    const productArray = firstItem?.products;
                    const product = Array.isArray(productArray) ? productArray[0] : productArray;
                    const image = fixImageUrl(product?.image_urls?.[0], product?.name);

                    return (
                      <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden relative flex-shrink-0">
                              <Image src={image} alt={firstItem?.product_name || "Product"} fill sizes="40px" className="object-cover" />
                            </div>
                            <span className="font-medium text-[#1E293B] max-w-[200px] truncate">{firstItem?.product_name || "Unknown Product"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">x{order.order_items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 1}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString('en-US')}</td>
                        <td className="px-6 py-4 text-gray-500">₹{Number(order.total_amount).toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-500">₹{(Number(order.total_amount) * 0.15).toFixed(2)}</td>
                        <td className="px-6 py-4 font-medium">
                          <span className={getStatusColor(order.status)}>{order.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3 text-gray-400">
                            <button className="hover:text-brand-orange"><Edit2 className="w-4 h-4" /></button>
                            <button className="hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              {!isLoading && realOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}