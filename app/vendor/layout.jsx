import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function VendorLayout({ children }) {
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

  if (dbUserError || dbUser?.role !== "vendor") {
    redirect("/auth/login");
  }

  return <section className="min-h-screen bg-slate-50">{children}</section>;
}
