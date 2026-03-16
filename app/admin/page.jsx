import { supabaseAdmin } from "@/lib/supabaseAdmin";
import LiveKpiCards from "@/components/admin/dashboard/LiveKpiCards";
import ActivityFeed from "@/components/admin/dashboard/ActivityFeed";
import PeakHoursChart from "@/components/admin/dashboard/PeakHoursChart";

export default async function AdminDashboard() {
  const today = new Date().toISOString().split("T")[0];

  const [
    { count: totalOrders },
    { count: activeVendors },
    { count: queueOrders },
    { count: rejectedOrders },
    { count: totalVendors },
    { data: recentOrders },
  ] = await Promise.all([
    supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today),
    supabaseAdmin
      .from("vendors")
      .select("*", { count: "exact", head: true })
      .eq("is_online", true),
    supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected"),
    supabaseAdmin
      .from("vendors")
      .select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="space-y-6">
      <LiveKpiCards
        initialCounts={{
          totalOrders: totalOrders || 0,
          activeVendors: activeVendors || 0,
          queueOrders: queueOrders || 0,
          rejectedOrders: rejectedOrders || 0,
          totalVendors: totalVendors || 0,
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed activities={recentOrders || []} />
        </div>
        <div className="lg:col-span-1">
          <PeakHoursChart />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Student Activity Summary</h2>
          <p className="text-sm text-gray-500">Platform engagement snapshot</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Total Active Users</p>
            <p className="mt-2 text-2xl font-bold text-blue-900">1,284</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Average Orders Per Day</p>
            <p className="mt-2 text-2xl font-bold text-emerald-900">326</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Peak Usage Time</p>
            <p className="mt-2 text-2xl font-bold text-amber-900">12:00 PM - 2:00 PM</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-500">No personal student data exposed.</p>
      </div>
    </div>
  );
}
