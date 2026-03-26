import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentLayoutShell from "./StudentLayoutShell";

export default async function StudentLayout({ children }) {
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



  if (dbUserError || dbUser?.role !== "student") {
    redirect("/auth/login");
  }

  return <StudentLayoutShell>{children}</StudentLayoutShell>;
}
