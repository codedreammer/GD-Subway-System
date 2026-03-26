import { redirect } from "next/navigation";
import AdminDashboardShell from "@/features/admin/components/dashboard/AdminDashboardShell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();



  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data: dbUser, error: dbUserError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();



  if (dbUserError || dbUser?.role !== "admin") {
    redirect("/auth/login");
  }

  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
