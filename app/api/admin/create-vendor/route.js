import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import crypto from "crypto"

function generatePassword() {
  return crypto.randomBytes(6).toString("base64").slice(0, 10)
}

export async function POST(req) {
  try {
    const { shop_name, email, category_id } = await req.json()

    if (!shop_name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const password = generatePassword()

    // 1️⃣ Create Auth User
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    const userId = authUser.user.id

    // 2️⃣ Insert into public.users
    const { error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        id: userId,
        email,
        role: "vendor",
        name: shop_name,
        is_active: true
      })

    if (userError) throw userError

    // 3️⃣ Insert into public.vendors
    const { error: vendorError } = await supabaseAdmin
      .from("vendors")
      .insert({
        user_id: userId,
        shop_name,
        category_id,
        is_online: false
      })

    if (vendorError) throw vendorError

    return NextResponse.json({
      success: true,
      password
    })

  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}