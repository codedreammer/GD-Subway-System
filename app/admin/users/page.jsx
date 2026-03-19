import UserDashboard from "@/components/admin/UserDashboard"
import UsersBulkProvisioning from "@/components/admin/UsersBulkProvisioning"
import { createClient } from "@/lib/supabase/server"

export default async function UsersPage() {
  const supabase = createClient()

  const { count: totalStudents } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")

  const { count: firstLoginPending } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")
    .eq("is_first_login", true)

  const { count: suspended } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")
    .eq("is_active", false)

  const today = new Date().toISOString().split("T")[0]

  const { count: activeToday } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")
    .gte("last_login_at", today)

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-500">Bulk student provisioning & access control</p>
      </div>

      <UserDashboard
        totalStudents={totalStudents}
        activeToday={activeToday}
        firstLoginPending={firstLoginPending}
        suspended={suspended}
      />

      <UsersBulkProvisioning />
    </div>
  )
}
