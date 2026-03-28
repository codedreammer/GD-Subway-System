"use client";

import { ListFilter } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import {
  CONTROL_STATUS_ORDER,
  ORDER_FILTERS,
  formatOrderAge,
  getControlStatus,
  isDelayedOrder,
  normalizeOrderStatus,
} from "@/features/admin/components/dashboard/orderControlPanel.helpers";

const statusBadgeStyles = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-sky-100 text-sky-700",
  preparing: "bg-cyan-100 text-cyan-700",
  ready: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

const filterPillConfig = [
  { key: ORDER_FILTERS.ALL, label: "All" },
  { key: "pending", label: "Pending" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
  { key: ORDER_FILTERS.DELAYED, label: "Delayed" },
];

function getVendorLabel(vendorId, vendorLookup) {
  return vendorLookup[vendorId] || `Vendor ${String(vendorId || "").slice(0, 6) || "N/A"}`;
}

function formatStatusLabel(status) {
  const normalized = getControlStatus(status);

  if (normalized === "preparing" && normalizeOrderStatus(status) === "accepted") {
    return "Accepted";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function OrderMonitoringTable({
  orders = [],
  activeFilter,
  onFilterChange,
  vendorLookup = {},
  now,
}) {
  return (
    <section className="premium-card p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-green-100 to-emerald-50">
            <ListFilter className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Action queue</p>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Order monitoring table</h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterPillConfig.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => onFilterChange(filter.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                activeFilter === filter.key
                  ? "bg-green-700 text-white shadow-[0_18px_36px_-22px_rgba(22,101,52,0.82)]"
                  : "bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Vendor</th>
              <th className="px-4 py-2">Student</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Age</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Pickup</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => {
                const rawStatus = normalizeOrderStatus(order.status);
                const statusKey = CONTROL_STATUS_ORDER.includes(rawStatus) ? rawStatus : getControlStatus(rawStatus);
                const isDelayed = isDelayedOrder(order, now);

                return (
                  <tr key={order.id} className="bg-white/90 shadow-[0_18px_38px_-34px_rgba(15,23,42,0.45)]">
                    <td className="rounded-l-[1.25rem] px-4 py-4 align-middle">
                      <div>
                        <p className="font-semibold text-slate-900">#{order.order_code || order.id?.slice(0, 8)}</p>
                        {isDelayed ? (
                          <span className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                            Delayed
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-sm font-semibold text-slate-700">
                      {getVendorLabel(order.vendor_id, vendorLookup)}
                    </td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-600">
                      {order.student_id ? String(order.student_id).slice(0, 8) : "--"}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusBadgeStyles[statusKey] || "bg-slate-100 text-slate-600"}`}>
                        {formatStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle text-sm font-semibold text-slate-700">
                      {formatOrderAge(order.created_at, now)}
                    </td>
                    <td className="px-4 py-4 align-middle text-sm text-slate-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="rounded-r-[1.25rem] px-4 py-4 align-middle text-sm text-slate-600">
                      {order.pickup_time ? formatDate(order.pickup_time) : "--"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-0 py-6">
                  <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                    <p className="text-sm font-semibold text-slate-700">No orders match this filter.</p>
                    <p className="mt-2 text-sm text-slate-500">Realtime updates will appear here automatically.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
