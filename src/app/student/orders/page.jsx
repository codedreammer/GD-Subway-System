"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Clock3,
  ListOrdered,
  PackageCheck,
  Store,
  TimerReset,
} from "lucide-react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { getCurrentUser } from "@/features/auth/services/authService";
import formatCurrency from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

const statusTheme = {
  pending: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    progress: "from-amber-500 to-yellow-400",
  },
  accepted: {
    badge: "bg-sky-100 text-sky-700 border-sky-200",
    progress: "from-sky-500 to-blue-500",
  },
  ready: {
    badge: "bg-green-100 text-green-700 border-green-200",
    progress: "from-green-600 to-emerald-400",
  },
  completed: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    progress: "from-emerald-500 to-green-500",
  },
  rejected: {
    badge: "bg-red-100 text-red-700 border-red-200",
    progress: "from-red-500 to-rose-400",
  },
};

function OrdersSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="rounded-b-[2.5rem] bg-gradient-to-r from-[#0f3d22] via-[#166534] to-[#22c55e] px-6 pb-16 pt-10">
        <div className="skeleton h-7 w-36 rounded-full" />
        <div className="mt-3 skeleton h-4 w-48 rounded-full" />
        <div className="mt-6 grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-20 rounded-[1.4rem]" />
          ))}
        </div>
      </div>
      <div className="-mt-7 space-y-4 px-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="premium-card p-4">
            <div className="flex items-center gap-4">
              <div className="skeleton h-14 w-14 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <div className="skeleton h-4 w-32 rounded-full" />
                <div className="skeleton h-3 w-40 rounded-full" />
              </div>
              <div className="skeleton h-10 w-20 rounded-xl" />
            </div>
            <div className="mt-4 skeleton h-2 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order, isActive, onClick }) {
  const theme = statusTheme[order.status] || {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    progress: "from-slate-500 to-slate-400",
  };

  const progressMap = {
    pending: 25,
    accepted: 55,
    ready: 85,
    completed: 100,
    rejected: 100,
  };

  const progressWidth = progressMap[order.status] || 0;

  return (
    <button
      onClick={onClick}
      className="premium-card group block w-full p-4 text-left"
      type="button"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-green-50 to-emerald-100 text-green-800 shadow-inner">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-green-700">
                {order.vendors?.shop_name}
              </h3>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${theme.badge}`}>
                {order.status}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
              <Clock3 className="h-4 w-4" />
              {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(order.total_amount)}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{isActive ? "Live progress" : "Completed flow"}</span>
          <span className="flex items-center gap-1 text-green-700">
            {isActive ? "Track order" : "View details"}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${theme.progress} transition-all duration-500`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
    </button>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }

        const { data, error } = await supabase
          .from("orders")
          .select(
            `
            *,
            vendors (shop_name)
          `,
          )
          .eq("student_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error("Orders fetching error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const activeOrders = useMemo(
    () => orders.filter((order) => ["pending", "accepted", "ready"].includes(order.status)),
    [orders],
  );
  const pastOrders = useMemo(
    () => orders.filter((order) => ["completed", "rejected"].includes(order.status)),
    [orders],
  );

  if (loading) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="overflow-hidden rounded-b-[2.75rem] bg-gradient-to-r from-[#0f3d22] via-[#166534] to-[#22c55e] px-6 pb-16 pt-10 text-white shadow-[0_24px_70px_-34px_rgba(22,101,52,0.95)]">
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">Order center</p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-black tracking-tight">
            <ListOrdered className="h-7 w-7" />
            My Orders
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-emerald-100/90">
            Follow every order from placed to pickup with a cleaner, faster tracking experience.
          </p>
        </div>

        <div className="mt-7 grid grid-cols-3 gap-3">
          <div className="glass-panel rounded-[1.5rem] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">All orders</p>
            <p className="mt-2 text-2xl font-bold">{orders.length}</p>
          </div>
          <div className="glass-panel rounded-[1.5rem] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Active</p>
            <p className="mt-2 text-2xl font-bold">{activeOrders.length}</p>
          </div>
          <div className="glass-panel rounded-[1.5rem] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Completed</p>
            <p className="mt-2 text-2xl font-bold">{pastOrders.length}</p>
          </div>
        </div>
      </div>

      <div className="-mt-7 space-y-6 px-5">
        {orders.length === 0 ? (
          <div className="premium-card px-8 py-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <PackageCheck className="h-9 w-9 text-slate-400" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-900">No orders yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Start exploring campus food and your latest orders will show up here.
            </p>
            <button
              onClick={() => router.push("/student")}
              className="premium-button mt-6 px-6 py-3 text-sm font-semibold"
            >
              Browse vendors
            </button>
          </div>
        ) : (
          <>
            {activeOrders.length > 0 ? (
              <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.7)]" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-600">Active orders</h2>
                </div>
                {activeOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isActive
                    onClick={() => router.push(`/student/orders/${order.id}`)}
                  />
                ))}
              </section>
            ) : null}

            {pastOrders.length > 0 ? (
              <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <TimerReset className="h-4 w-4 text-slate-400" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Past orders</h2>
                </div>
                {pastOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isActive={false}
                    onClick={() => router.push(`/student/orders/${order.id}`)}
                  />
                ))}
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
