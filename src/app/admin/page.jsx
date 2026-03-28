import Link from "next/link";
import { ArrowRight, ClipboardList, ShieldCheck, Sparkles, Users } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import LiveKpiCards from "@/features/admin/components/dashboard/LiveKpiCards";

export default async function AdminDashboard() {
  const today = new Date().toISOString().split("T")[0];

  const [
    { count: totalOrders },
    { count: activeVendors },
    { count: queueOrders },
    { count: rejectedOrders },
    { count: totalVendors },
  ] = await Promise.all([
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today),
    supabaseAdmin.from("vendors").select("*", { count: "exact", head: true }).eq("is_online", true),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    supabaseAdmin.from("vendors").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-6">
      <section className="premium-card overflow-hidden p-6">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-700">Overview</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Daily command center</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Watch order velocity, vendor availability, and queue pressure in one cleaner control surface.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-green-50 to-emerald-100 p-4">
              <Sparkles className="h-5 w-5 text-green-700" />
              <p className="mt-4 text-2xl font-black text-slate-900">{totalOrders || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">Orders today</p>
            </div>
            <div className="rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
              <Users className="h-5 w-5 text-sky-700" />
              <p className="mt-4 text-2xl font-black text-slate-900">{activeVendors || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">Vendors live</p>
            </div>
            <div className="rounded-[1.5rem] bg-gradient-to-br from-amber-50 to-yellow-100 p-4">
              <ShieldCheck className="h-5 w-5 text-amber-700" />
              <p className="mt-4 text-2xl font-black text-slate-900">{queueOrders || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">In queue</p>
            </div>
          </div>
        </div>
      </section>

      <LiveKpiCards
        initialCounts={{
          totalOrders: totalOrders || 0,
          activeVendors: activeVendors || 0,
          queueOrders: queueOrders || 0,
          rejectedOrders: rejectedOrders || 0,
          totalVendors: totalVendors || 0,
        }}
      />

      <section className="premium-card overflow-hidden p-6">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Orders workspace</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Dedicated real-time order command center</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              The full monitoring feed, control panel, vendor load, and filtered order table now live in the Orders tab for a cleaner admin overview.
            </p>
            <Link
              href="/admin/orders"
              className="premium-button mt-5 inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold"
            >
              Open Orders Page
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-50 to-green-100 p-5">
              <ClipboardList className="h-5 w-5 text-green-700" />
              <p className="mt-4 text-3xl font-black text-slate-900">{queueOrders || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">Orders in queue</p>
            </div>
            <div className="rounded-[1.5rem] bg-gradient-to-br from-rose-50 to-red-100 p-5">
              <ShieldCheck className="h-5 w-5 text-rose-700" />
              <p className="mt-4 text-3xl font-black text-slate-900">{rejectedOrders || 0}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">Rejected today</p>
            </div>
          </div>
        </div>
      </section>

      <section className="premium-card p-6">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Student signals</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Engagement snapshot</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-sky-50 to-blue-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Total active users</p>
            <p className="mt-3 text-3xl font-black text-slate-900">1,284</p>
          </div>
          <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-50 to-green-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Average orders per day</p>
            <p className="mt-3 text-3xl font-black text-slate-900">326</p>
          </div>
          <div className="rounded-[1.5rem] bg-gradient-to-br from-amber-50 to-yellow-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Peak usage</p>
            <p className="mt-3 text-3xl font-black text-slate-900">12 PM - 2 PM</p>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
          No personal student data exposed.
        </p>
      </section>
    </div>
  );
}
