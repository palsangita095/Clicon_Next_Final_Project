"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase.config";
import { OrderStatus } from "@/types/database.types";

const ADMIN_ORDERS_KEYS = [
  ["admin-store", "orders"],
  ["admin-store", "orders", "metrics"],
];


export function useOrderStatusRealtime(
  orderId: string | null,
  onStatusChange?: (status: OrderStatus) => void,
) {
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const next = payload.new as { status?: OrderStatus };
          if (next?.status) onStatusChangeRef.current?.(next.status);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);
}


export function useAdminOrdersRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          for (const queryKey of ADMIN_ORDERS_KEYS) {
            void queryClient.invalidateQueries({ queryKey });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}