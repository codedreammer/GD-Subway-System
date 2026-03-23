"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Clock3,
  PackageCheck,
  Receipt,
  Store,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import formatCurrency from "@/utils/formatCurrency";

const statusConfig = {
  pending: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    progress: "from-amber-500 to-yellow-400",
    icon: Clock3,
    message: "Waiting for vendor confirmation",
  },
  accepted: {
    badge: "bg-sky-100 text-sky-700 border-sky-200",
    progress: "from-sky-500 to-blue-500",
    icon: Receipt,
    message: "Kitchen is preparing your order",
  },
  ready: {
    badge: "bg-green-100 text-green-700 border-green-200",
    progress: "from-green-600 to-emerald-400",
    icon: PackageCheck,
    message: "Ready for pickup",
  },
  completed: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    progress: "from-emerald-500 to-green-500",
    icon: CheckCircle2,
    message: "Order completed successfully",
  },
  rejected: {
    badge: "bg-red-100 text-red-700 border-red-200",
    progress: "from-red-500 to-rose-400",
    icon: CircleAlert,
    message: "Vendor rejected this order",
  },
  cancelled: {
    badge: "bg-red-100 text-red-700 border-red-200",
    progress: "from-red-500 to-rose-400",
    icon: CircleAlert,
    message: "Order was cancelled",
  },
};

const steps = [
  { key: "pending", label: "Placed" },
  { key: "accepted", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Picked up" },
];

function TrackingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="rounded-b-[2.5rem] bg-gradient-to-r from-[#0f3d22] via-[#166534] to-[#22c55e] px-5 pb-16 pt-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="skeleton h-10 w-10 rounded-2xl" />
          <div className="skeleton h-5 w-44 rounded-full" />
        </div>
        <div className="skeleton h-24 rounded-[2rem]" />
      </div>
      <div className="-mt-7 space-y-4 px-5">
        <div className="premium-card p-5">
          <div className="skeleton h-6 w-40 rounded-full" />
          <div className="mt-6 skeleton h-20 rounded-[1.5rem]" />
          <div className="mt-6 skeleton h-20 rounded-[1.5rem]" />
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasNotified = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    hasNotified.current = false;
  }, [id]);

  const triggerNotification = () => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("Order ready", {
        body: "Your order is ready for pickup.",
        icon: "/logo.png",
      });
    } else {
      alert("Your order is ready for pickup.");
    }
  };

  const playSound = () => {
    if (typeof window !== "undefined") {
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(
            `
            *,
            vendors (shop_name, is_online),
            order_items (
              id, quantity, price_at_time,
              items (name)
            )
          `,
          )
          .eq("id", id)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }

    const channel = supabase
      .channel("orders-live")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setOrder((prev) => ({ ...prev, ...payload.new }));

          if (payload.new.status === "ready" && !hasNotified.current) {
            triggerNotification();
            playSound();
            hasNotified.current = true;
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return <TrackingSkeleton />;
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="premium-card w-full max-w-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Order not found</h2>
          <button
            onClick={() => router.push("/student/orders")}
            className="premium-button mt-5 px-5 py-3 text-sm font-semibold"
          >
            Back to orders
          </button>
        </div>
      </div>
    );
  }

  const stepIndexMap = {
    pending: 0,
    accepted: 1,
    ready: 2,
    completed: 3,
  };

  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const currentIndex = stepIndexMap[order.status] ?? -1;
  const progressWidth = currentIndex < 0 ? 0 : (currentIndex / 3) * 100;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="sticky top-0 z-40 bg-slate-50/70 px-4 pt-4 backdrop-blur-xl">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0f3d22] via-[#166534] to-[#22c55e] px-5 pb-6 pt-4 text-white shadow-[0_24px_60px_-34px_rgba(22,101,52,0.88)]">
          <div className="mb-5 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="glass-panel flex h-11 w-11 items-center justify-center rounded-2xl transition hover:scale-105"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">Live tracking</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight">Order #{order.order_code || order.id?.slice(0, 6)}</h1>
            </div>
          </div>

          <div className="glass-panel rounded-[1.75rem] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-emerald-100">Current status</p>
                <h2 className="mt-2 text-2xl font-bold">{config.message}</h2>
              </div>
              <div className="rounded-[1.25rem] bg-white/14 p-3">
                <StatusIcon className="h-7 w-7" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 pt-5">
        <section className="premium-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Order status</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Pickup progress</h2>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] ${config.badge}`}>
              {order.status}
            </span>
          </div>

          {order.status !== "cancelled" && order.status !== "rejected" ? (
            <div className="mt-8">
              <div className="relative mb-6 h-2 rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${config.progress} transition-all duration-700`}
                  style={{ width: `${progressWidth}%` }}
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                {steps.map((step, index) => {
                  const completed = currentIndex >= index;

                  return (
                    <div key={step.key} className="text-center">
                      <div
                        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-500 ${
                          completed
                            ? "border-green-200 bg-green-100 text-green-700 shadow-[0_14px_30px_-18px_rgba(34,197,94,0.8)]"
                            : "border-slate-200 bg-white text-slate-300"
                        }`}
                      >
                        {completed ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-bold">{index + 1}</span>}
                      </div>
                      <p className={`mt-3 text-xs font-semibold ${completed ? "text-slate-900" : "text-slate-400"}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={`mt-5 rounded-[1.5rem] border p-4 ${config.badge}`}>
              This order can no longer move forward. Check the details below for the latest status.
            </div>
          )}
        </section>

        <section className="premium-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
              <Store className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Pickup details</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">{order.vendors?.shop_name}</h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-amber-500" />
                Estimated pickup time
              </span>
              <span className="font-semibold text-slate-900">15-20 min</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>Vendor availability</span>
              <span className={`font-semibold ${order.vendors?.is_online === false ? "text-amber-600" : "text-green-700"}`}>
                {order.vendors?.is_online === false ? "Offline" : "Online"}
              </span>
            </div>
          </div>
        </section>

        <section className="premium-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
              <Receipt className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Bill summary</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Items in this order</h2>
            </div>
          </div>

          <div className="space-y-3">
            {order.order_items?.map((item) => (
              <div key={item.id} className="rounded-[1.4rem] bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.items?.name}</p>
                    <p className="mt-1 text-sm text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {formatCurrency(item.price_at_time * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-gradient-to-r from-green-900 to-green-600 px-4 py-4 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-100">Order total</span>
              <span className="text-2xl font-bold">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
