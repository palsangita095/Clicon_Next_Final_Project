import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminOrderMetrics,
  fetchAdminOrders,
  updateOrderStatus,
  updateOrderAddress,
  deleteOrder,
} from "@/api/api-function/adminOrders.function";
import { OrderStatus } from "@/types/database.types";

const ORDERS_KEY = ["admin-store", "orders"];
const METRICS_KEY = ["admin-store", "orders", "metrics"];

export function useAdminOrderMetrics() {
  return useQuery({
    queryKey: ["admin-store", "orders", "metrics"],
    queryFn: () => fetchAdminOrderMetrics(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ORDERS_KEY,
    queryFn: () => fetchAdminOrders(),
    staleTime: 1000 * 60,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
      queryClient.invalidateQueries({ queryKey: METRICS_KEY });
    },
  });
}

export function useUpdateOrderAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      billingAddress,
    }: {
      orderId: string;
      billingAddress: Record<string, unknown>;
    }) => updateOrderAddress(orderId, billingAddress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
      queryClient.invalidateQueries({ queryKey: METRICS_KEY });
    },
  });
}
