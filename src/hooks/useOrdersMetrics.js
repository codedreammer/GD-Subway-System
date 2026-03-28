"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { createEmptyStatusCounts, getControlStatus, isDelayedOrder, normalizeOrderStatus } from "@/features/admin/components/dashboard/orderControlPanel.helpers";

function buildStatusCounts(orders = []) {
  return orders.reduce((accumulator, order) => {
    const statusKey = getControlStatus(order?.status);

    if (statusKey in accumulator) {
      accumulator[statusKey] += 1;
    }

    return accumulator;
  }, createEmptyStatusCounts());
}

function buildAveragePrepTime(orders = []) {
  const completedOrders = orders.filter(
    (order) => normalizeOrderStatus(order?.status) === "completed" && order?.pickup_time && order?.created_at,
  );

  if (completedOrders.length === 0) {
    return 0;
  }

  const totalPrepTime = completedOrders.reduce((sum, order) => {
    return sum + (new Date(order.pickup_time).getTime() - new Date(order.created_at).getTime());
  }, 0);

  return totalPrepTime / completedOrders.length / 60000;
}

function buildVendorLoad(orders = []) {
  return orders.reduce((accumulator, order) => {
    if (!order?.vendor_id) {
      return accumulator;
    }

    accumulator[order.vendor_id] = (accumulator[order.vendor_id] || 0) + 1;
    return accumulator;
  }, {});
}

export default function useOrdersMetrics({ initialOrders = [], dashboardWindowStart }) {
  const [orders, setOrders] = useState(initialOrders);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    let isActive = true;

    async function fetchOrders() {
      let query = supabase
        .from("orders")
        .select("id, order_code, status, created_at, pickup_time, vendor_id, student_id")
        .order("created_at", { ascending: false });

      if (dashboardWindowStart) {
        query = query.gte("created_at", dashboardWindowStart);
      }

      const { data, error } = await query;

      if (!isActive || error || !data) {
        return;
      }

      setOrders(data);
    }

    if (!initialOrders.length) {
      fetchOrders();
    }

    const channel = supabase
      .channel(`orders-metrics-${dashboardWindowStart || "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: dashboardWindowStart ? `created_at=gte.${dashboardWindowStart}` : undefined,
        },
        () => {
          fetchOrders();
        },
      )
      .subscribe();

    return () => {
      isActive = false;
      supabase.removeChannel(channel);
    };
  }, [dashboardWindowStart, initialOrders]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const statusCounts = useMemo(() => buildStatusCounts(orders), [orders]);

  const avgPrepTime = useMemo(() => buildAveragePrepTime(orders), [orders]);

  const delayedOrders = useMemo(
    () => orders.filter((order) => isDelayedOrder(order, now)),
    [orders, now],
  );

  const ordersPerMinute = useMemo(() => {
    const recentOrders = orders.filter((order) => now - new Date(order.created_at).getTime() <= 5 * 60 * 1000);
    return recentOrders.length / 5;
  }, [orders, now]);

  const vendorLoad = useMemo(() => buildVendorLoad(orders), [orders]);

  return {
    orders,
    statusCounts,
    avgPrepTime,
    delayedOrders,
    ordersPerMinute,
    vendorLoad,
  };
}
