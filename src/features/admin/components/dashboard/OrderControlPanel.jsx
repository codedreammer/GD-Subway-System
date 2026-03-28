"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCheck, ChefHat, Clock3, PackageCheck, PackageX, TimerReset, TrendingUp } from "lucide-react";
import {
  ORDER_FILTERS,
  formatMinutes,
  formatOrdersPerMinute,
  getOrderFlowStages,
  getVendorLoadDistribution,
} from "@/features/admin/components/dashboard/orderControlPanel.helpers";

const statusCardConfig = [
  {
    key: "pending",
    label: "Pending",
    icon: Clock3,
    theme: {
      panel: "from-amber-50 to-yellow-100 text-amber-900",
      icon: "bg-white/80 text-amber-700",
      accent: "text-amber-700",
      active: "ring-2 ring-amber-300 shadow-[0_18px_40px_-28px_rgba(217,119,6,0.8)]",
    },
  },
  {
    key: "preparing",
    label: "Preparing",
    icon: ChefHat,
    theme: {
      panel: "from-sky-50 to-cyan-100 text-sky-900",
      icon: "bg-white/80 text-sky-700",
      accent: "text-sky-700",
      active: "ring-2 ring-sky-300 shadow-[0_18px_40px_-28px_rgba(2,132,199,0.75)]",
    },
  },
  {
    key: "ready",
    label: "Ready",
    icon: PackageCheck,
    theme: {
      panel: "from-emerald-50 to-green-100 text-emerald-900",
      icon: "bg-white/80 text-emerald-700",
      accent: "text-emerald-700",
      active: "ring-2 ring-emerald-300 shadow-[0_18px_40px_-28px_rgba(5,150,105,0.78)]",
    },
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCheck,
    theme: {
      panel: "from-lime-50 to-emerald-100 text-emerald-950",
      icon: "bg-white/80 text-lime-700",
      accent: "text-lime-700",
      active: "ring-2 ring-lime-300 shadow-[0_18px_40px_-28px_rgba(101,163,13,0.75)]",
    },
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: PackageX,
    theme: {
      panel: "from-rose-50 to-red-100 text-rose-950",
      icon: "bg-white/80 text-rose-700",
      accent: "text-rose-700",
      active: "ring-2 ring-rose-300 shadow-[0_18px_40px_-28px_rgba(225,29,72,0.72)]",
    },
  },
];

function FilterButton({ label, value, icon: Icon, count, theme, activeFilter, onFilterChange }) {
  const isActive = activeFilter === value;

  return (
    <button
      type="button"
      onClick={() => onFilterChange(value)}
      className={`rounded-[1.35rem] bg-gradient-to-br p-4 text-left transition duration-300 hover:-translate-y-1 ${
        theme.panel
      } ${isActive ? theme.active : "shadow-[0_18px_38px_-30px_rgba(15,23,42,0.35)]"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${theme.accent}`}>
          {isActive ? "Filtered" : "Live"}
        </span>
      </div>

      <p className="mt-4 text-3xl font-black tracking-tight">{count}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">{label}</p>
    </button>
  );
}

export default function OrderControlPanel({
  statusCounts,
  avgPrepTime,
  delayedOrders = [],
  ordersPerMinute,
  vendorLoad,
  activeFilter,
  onFilterChange,
  vendorLookup = {},
}) {
  const delayedOrdersCount = delayedOrders.length;
  const vendorLoadDistribution = useMemo(() => getVendorLoadDistribution(vendorLoad, vendorLookup), [vendorLoad, vendorLookup]);
  const flowStages = useMemo(() => getOrderFlowStages(statusCounts), [statusCounts]);

  return (
    <section className="premium-card p-6">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-emerald-100 to-green-50">
          <TrendingUp className="h-6 w-6 text-green-700" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Realtime controls</p>
          <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Order control panel</h3>
        </div>
        <div className="ml-auto inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.85)]" />
          Auto sync
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statusCardConfig.map((card) => (
          <FilterButton
            key={card.key}
            label={card.label}
            value={card.key}
            icon={card.icon}
            count={statusCounts[card.key] || 0}
            theme={card.theme}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
          />
        ))}

        <FilterButton
          label="Delayed"
          value={ORDER_FILTERS.DELAYED}
          icon={AlertTriangle}
          count={delayedOrdersCount}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          theme={{
            panel: "from-amber-100 via-yellow-50 to-rose-100 text-amber-950",
            icon: "bg-white/80 text-amber-700",
            accent: "text-red-600",
            active: "ring-2 ring-red-300 shadow-[0_20px_46px_-28px_rgba(239,68,68,0.75)]",
          }}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[1.5rem] border border-emerald-100 bg-white/85 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <TimerReset className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Avg prep time</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{formatMinutes(avgPrepTime)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-green-100 bg-white/85 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Orders / min</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{formatOrdersPerMinute(ordersPerMinute)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-slate-100 bg-white/85 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Vendor load</p>
            <h4 className="mt-1 text-lg font-black text-slate-900">Distribution</h4>
          </div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Top vendors</span>
        </div>

        <div className="mt-4 space-y-3">
          {vendorLoadDistribution.length > 0 ? (
            vendorLoadDistribution.map((vendor) => (
              <div key={vendor.vendorId} className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">{vendor.vendorName}</p>
                  <span className="text-sm font-black text-slate-900">{vendor.totalOrders}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#166534] to-[#22c55e]"
                    style={{
                      width: `${Math.max((vendor.totalOrders / Math.max(vendorLoadDistribution[0].totalOrders, 1)) * 100, 12)}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No vendor activity yet.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-slate-100 bg-white/85 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Flow view</p>
            <h4 className="mt-1 text-lg font-black text-slate-900">Order pipeline</h4>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Live stages</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {flowStages.map((stage) => {
            const isActive = activeFilter === stage.key;

            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => onFilterChange(stage.key)}
                className={`rounded-[1.2rem] border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-green-300 bg-green-50 shadow-[0_18px_35px_-24px_rgba(22,101,52,0.55)]"
                    : "border-slate-200 bg-slate-50 hover:border-green-200 hover:bg-green-50/60"
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{stage.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-2xl font-black tracking-tight text-slate-900">{stage.count}</p>
                  <span className="text-sm font-semibold text-green-700">View</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
