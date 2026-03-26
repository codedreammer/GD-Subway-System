"use client";

import { useEffect, useState } from "react";
import { Clock3, ShoppingBag, Store, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/supabaseClient";
import StatsCard from "@/features/admin/components/dashboard/StatsCard";

function normalizeStatus(status) {
  return String(status || "").toLowerCase();
}

function isTodayUtc(isoDate, todayKey) {
  if (!isoDate) return false;
  const key = new Date(isoDate).toISOString().split("T")[0];
  return key === todayKey;
}

function adjustStatusCounters(nextState, status, delta) {
  const normalized = normalizeStatus(status);

  if (normalized === "pending") {
    nextState.queueOrders = Math.max(0, nextState.queueOrders + delta);
  }

  if (normalized === "rejected") {
    nextState.rejectedOrders = Math.max(0, nextState.rejectedOrders + delta);
  }
}

export default function LiveKpiCards({ initialCounts }) {
  const [counts, setCounts] = useState({
    totalOrders: Number(initialCounts?.totalOrders || 0),
    activeVendors: Number(initialCounts?.activeVendors || 0),
    queueOrders: Number(initialCounts?.queueOrders || 0),
    rejectedOrders: Number(initialCounts?.rejectedOrders || 0),
    totalVendors: Number(initialCounts?.totalVendors || 0),
  });

  useEffect(() => {
    const todayKey = new Date().toISOString().split("T")[0];

    const ordersChannel = supabase
      .channel("admin-kpi-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          setCounts((prev) => {
            const next = { ...prev };
            const eventType = payload.eventType;
            const currentRow = payload.new || {};
            const previousRow = payload.old || {};

            if (eventType === "INSERT") {
              if (isTodayUtc(currentRow.created_at, todayKey)) {
                next.totalOrders += 1;
              }
              adjustStatusCounters(next, currentRow.status, 1);
              return next;
            }

            if (eventType === "UPDATE") {
              adjustStatusCounters(next, previousRow.status, -1);
              adjustStatusCounters(next, currentRow.status, 1);
              return next;
            }

            if (eventType === "DELETE") {
              if (isTodayUtc(previousRow.created_at, todayKey)) {
                next.totalOrders = Math.max(0, next.totalOrders - 1);
              }
              adjustStatusCounters(next, previousRow.status, -1);
            }

            return next;
          });
        }
      )
      .subscribe();

    const vendorsChannel = supabase
      .channel("admin-kpi-vendors")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vendors" },
        (payload) => {
          setCounts((prev) => {
            const next = { ...prev };
            const eventType = payload.eventType;
            const currentRow = payload.new || {};
            const previousRow = payload.old || {};

            if (eventType === "INSERT") {
              next.totalVendors += 1;
              if (currentRow.is_online) next.activeVendors += 1;
              return next;
            }

            if (eventType === "UPDATE") {
              const wasOnline = Boolean(previousRow.is_online);
              const isOnline = Boolean(currentRow.is_online);
              if (wasOnline && !isOnline) {
                next.activeVendors = Math.max(0, next.activeVendors - 1);
              } else if (!wasOnline && isOnline) {
                next.activeVendors += 1;
              }
              return next;
            }

            if (eventType === "DELETE") {
              next.totalVendors = Math.max(0, next.totalVendors - 1);
              if (previousRow.is_online) {
                next.activeVendors = Math.max(0, next.activeVendors - 1);
              }
            }

            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(vendorsChannel);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Orders Today"
        value={counts.totalOrders}
        color="blue"
        icon={ShoppingBag}
      />
      <StatsCard
        title="Active Vendors"
        value={counts.activeVendors}
        subtitle={`of ${counts.totalVendors} total`}
        color="green"
        icon={Store}
      />
      <StatsCard
        title="Orders in Queue"
        value={counts.queueOrders}
        color="orange"
        icon={Clock3}
      />
      <StatsCard
        title="Rejected Orders"
        value={counts.rejectedOrders}
        color="red"
        icon={XCircle}
      />
    </div>
  );
}
