import UserDashboard from "@/components/admin/UserDashboard";
import UsersBulkProvisioning from "@/components/admin/UsersBulkProvisioning";
import { createClient } from "@/lib/supabase/server";

export default async function UsersPage() {
  const supabase = createClient();

  const { count: totalStudents } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student");

  const { count: firstLoginPending } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")
    .eq("is_first_login", true);

  const { count: suspended } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")
    .eq("is_active", false);

  const today = new Date().toISOString().split("T")[0];

  const { count: activeToday } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")
    .gte("last_login_at", today);

  return (
    <div className="space-y-6">
      <section className="premium-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-700">Student operations</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">User management</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          Bulk provision student accounts, monitor activation, and keep first-login readiness visible at a glance.
        </p>
      </section>

      <UserDashboard
        totalStudents={totalStudents}
        activeToday={activeToday}
        firstLoginPending={firstLoginPending}
        suspended={suspended}
      />

      <UsersBulkProvisioning />
    </div>
  );
}
