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
  const [events, setEvents] = useState(() =>
    activities.slice(0, 10).map((row) => toActivityRow(row, "init"))
  );

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
            "rt"
          );

          setEvents((prev) => [realtimeActivity, ...prev].slice(0, 10));
        }
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
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
          <Activity className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">Live Activity Feed</h3>
          <p className="text-sm text-gray-500">Real-time order updates</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-sm text-gray-500">Live</span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">Events: <span className="font-semibold text-gray-900">{kpis.total}</span></div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">Pending: <span className="font-semibold">{kpis.pending}</span></div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">Rejected: <span className="font-semibold">{kpis.rejected}</span></div>
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">Ready: <span className="font-semibold">{kpis.ready}</span></div>
      </div>

      <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
        {events.length > 0 ? (
          events.map((activity, index) => (
            <div
              key={activity.eventId}
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                index === 0 ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
              }`}
            >
              <EventIcon status={activity.status} />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Order #{activity.order_code} {activity.status}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {formatActivityTime(activity.created_at)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">No recent activity found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
