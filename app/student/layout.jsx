import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentLayoutShell from "./StudentLayoutShell";

export default async function StudentLayout({ children }) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("SERVER USER:", user?.id);

  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data: dbUser, error: dbUserError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  console.log("USER ID:", user?.id);
  console.log("ROLE:", dbUser?.role);

  if (dbUserError || dbUser?.role !== "student") {
    redirect("/auth/login");
  }

  return <StudentLayoutShell>{children}</StudentLayoutShell>;
}
