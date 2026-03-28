"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import ActivityFeed from "@/features/admin/components/dashboard/ActivityFeed";
import OrderControlPanel from "@/features/admin/components/dashboard/OrderControlPanel";
import OrderMonitoringTable from "@/features/admin/components/dashboard/OrderMonitoringTable";
import PeakHoursChart from "@/features/admin/components/dashboard/PeakHoursChart";
import { ORDER_FILTERS, filterOrdersByMetric } from "@/features/admin/components/dashboard/orderControlPanel.helpers";
import useOrdersMetrics from "@/hooks/useOrdersMetrics";

export default function OrderControlCenter({
  initialOrders = [],
  initialVendors = [],
  dashboardWindowStart,
}) {
  const [activeFilter, setActiveFilter] = useState(ORDER_FILTERS.ALL);
  const [now, setNow] = useState(() => Date.now());
  const { orders, statusCounts, avgPrepTime, delayedOrders, ordersPerMinute, vendorLoad } = useOrdersMetrics({
    initialOrders,
    dashboardWindowStart,
  });

  const vendorLookup = useMemo(
    () =>
      initialVendors.reduce((lookup, vendor) => {
        if (vendor?.id) {
          lookup[vendor.id] = vendor.name || `Vendor ${String(vendor.id).slice(0, 6)}`;
        }

        return lookup;
      }, {}),
    [initialVendors],
  );

  const delayedOrderIds = useMemo(() => new Set(delayedOrders.map((order) => order.id)), [delayedOrders]);

  const filteredOrders = useMemo(
    () =>
      activeFilter === ORDER_FILTERS.DELAYED
        ? orders.filter((order) => delayedOrderIds.has(order.id))
        : filterOrdersByMetric(orders, activeFilter, now),
    [orders, activeFilter, delayedOrderIds, now],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  function handleFilterChange(nextFilter) {
    startTransition(() => {
      setActiveFilter((currentFilter) => (currentFilter === nextFilter ? ORDER_FILTERS.ALL : nextFilter));
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ActivityFeed activities={orders.slice(0, 10)} subscribeToRealtime={false} />
        </div>
        <div className="lg:col-span-1">
          <OrderControlPanel
            statusCounts={statusCounts}
            avgPrepTime={avgPrepTime}
            delayedOrders={delayedOrders}
            ordersPerMinute={ordersPerMinute}
            vendorLoad={vendorLoad}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            vendorLookup={vendorLookup}
          />
        </div>
        <div className="lg:col-span-1">
          <PeakHoursChart />
        </div>
      </div>

      <OrderMonitoringTable
        orders={filteredOrders}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        vendorLookup={vendorLookup}
        now={now}
      />
    </div>
  );
}
