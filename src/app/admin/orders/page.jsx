import { Activity, ClipboardList, ShieldAlert } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import OrderControlCenter from "@/features/admin/components/dashboard/OrderControlCenter";

export default async function AdminOrdersPage() {
  const dashboardWindowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ data: initialOrders }, { data: initialVendors }] = await Promise.all([
    supabaseAdmin
      .from("orders")
      .select("id, order_code, status, created_at, pickup_time, vendor_id, student_id")
      .gte("created_at", dashboardWindowStart)
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("vendors").select("id, name"),
  ]);

  return (
    <div className="space-y-6">
      <section className="premium-card overflow-hidden p-6">
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-700">Orders</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Realtime order command center</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Track flow health, isolate delays, and filter the live queue from one dedicated operations surface.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-50 to-green-100 p-4">
              <ClipboardList className="h-5 w-5 text-green-700" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">Live queue</p>
            </div>
            <div className="rounded-[1.5rem] bg-gradient-to-br from-amber-50 to-yellow-100 p-4">
              <ShieldAlert className="h-5 w-5 text-amber-700" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">Delay watch</p>
            </div>
            <div className="rounded-[1.5rem] bg-gradient-to-br from-sky-50 to-cyan-100 p-4">
              <Activity className="h-5 w-5 text-sky-700" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">Live metrics</p>
            </div>
          </div>
        </div>
      </section>

      <OrderControlCenter
        initialOrders={initialOrders || []}
        initialVendors={initialVendors || []}
        dashboardWindowStart={dashboardWindowStart}
      />
    </div>
  );
}
