"use server";

import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function createVendorAction(formData) {
  try {
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const shop_name = formData.get("shop_name");
    const category_id = formData.get("category_id");
    const avg_prep_time = formData.get("avg_prep_time");

    if (!name || !email || !password || !shop_name || !category_id || !avg_prep_time) {
      return { error: "All fields are required" };
    }

    // 1️⃣ Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError) {
      return { error: authError.message };
    }

    const userId = authUser.user.id;

    // 2️⃣ Insert into public.users
    const { error: userError } = await supabaseAdmin.from("users").insert({
      id: userId,
      email,
      role: "vendor",
      name: name,
      is_active: true,
    });

    if (userError) throw userError;

    // 3️⃣ Insert into public.vendors
    const { error: vendorError } = await supabaseAdmin.from("vendors").insert({
      user_id: userId,
      shop_name,
      category_id: parseInt(category_id, 10),
      is_online: false,
      avg_prep_time: parseInt(avg_prep_time, 10),
    });

    if (vendorError) throw vendorError;

    return { success: true };
  } catch (err) {
    console.error("Error creating vendor:", err);
    return { error: err.message || "Failed to create vendor" };
  }
}
