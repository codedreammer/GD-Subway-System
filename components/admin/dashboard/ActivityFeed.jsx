"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, CheckCircle2, Clock3, PackageX } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

function formatStatus(status) {
  return String(status || "updated").toLowerCase();
}

function formatActivityTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--:--";

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

function toActivityRow(row, source = "init") {
  const status = formatStatus(row?.status);
  const createdAt = row?.created_at || new Date().toISOString();

  return {
    eventId: `${source}-${row?.id || "unknown"}-${createdAt}-${status}`,
    id: row?.id || "unknown",
    order_code: row?.order_code || row?.id || "N/A",
    status,
    created_at: createdAt,
  };
}

function EventIcon({ status }) {
  if (status === "rejected") {
    return <PackageX className="h-5 w-5 text-red-600" />;
  }

  if (status === "ready" || status === "accepted") {
    return <CheckCircle2 className="h-5 w-5 text-green-600" />;
  }

  return <Clock3 className="h-5 w-5 text-amber-600" />;
}

export default function ActivityFeed({ activities = [] }) {
  const [events, setEvents] = useState(() => activities.slice(0, 10).map((row) => toActivityRow(row, "init")));

  useEffect(() => {
    setEvents(activities.slice(0, 10).map((row) => toActivityRow(row, "init")));
  }, [activities]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-dashboard-activity-feed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const row = payload.new || payload.old;
          if (!row?.id) return;

          const realtimeActivity = toActivityRow(
            {
              ...row,
              status: row.status || payload.eventType.toLowerCase(),
              created_at: row.created_at || new Date().toISOString(),
            },
            "rt",
          );

          setEvents((prev) => [realtimeActivity, ...prev].slice(0, 10));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const kpis = useMemo(() => {
    let pending = 0;
    let rejected = 0;
    let ready = 0;

    events.forEach((event) => {
      if (event.status === "pending") pending += 1;
      if (event.status === "rejected") rejected += 1;
      if (event.status === "ready") ready += 1;
    });

    return { total: events.length, pending, rejected, ready };
  }, [events]);

  return (
    <section className="premium-card p-6">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-green-100 to-emerald-50">
          <Activity className="h-6 w-6 text-green-700" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Realtime activity</p>
          <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Live feed</h3>
        </div>
        <div className="ml-auto inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_16px_rgba(34,197,94,0.8)]" />
          Live
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Events <span className="ml-2 font-bold text-slate-900">{kpis.total}</span>
        </div>
        <div className="rounded-[1.25rem] bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Pending <span className="ml-2 font-bold">{kpis.pending}</span>
        </div>
        <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm text-red-700">
          Rejected <span className="ml-2 font-bold">{kpis.rejected}</span>
        </div>
        <div className="rounded-[1.25rem] bg-green-50 px-4 py-3 text-sm text-green-700">
          Ready <span className="ml-2 font-bold">{kpis.ready}</span>
        </div>
      </div>

      <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
        {events.length > 0 ? (
          events.map((activity, index) => (
            <div
              key={activity.eventId}
              className={`rounded-[1.5rem] border p-4 ${
                index === 0 ? "border-green-200 bg-green-50" : "border-slate-100 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <EventIcon status={activity.status} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Order #{activity.order_code} {activity.status}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatActivityTime(activity.created_at)}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No recent activity found.
          </div>
        )}
      </div>
    </section>
  );
}
