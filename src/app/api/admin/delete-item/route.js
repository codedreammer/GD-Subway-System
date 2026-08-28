import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin"
import { requireAdmin } from "@/lib/auth/requireAdmin"

export async function POST(req) {
  try {
    // Admin authorization
    const { error } = await requireAdmin(req)

    if (error) {
      return error
    }

    // Read request body
    const { item_id } = await req.json()

    // Validate required field
    if (!item_id) {
      return NextResponse.json(
        { error: "Missing item_id" },
        { status: 400 }
      )
    }

    // Soft delete:
    // Keep the item because old orders may reference it.
    // Simply make it unavailable for new orders.
    const { data, error: updateError } = await supabaseAdmin
      .from("items")
      .update({
        is_available: false,
      })
      .eq("id", item_id)
      .select("id, is_available")
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      item: data,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}