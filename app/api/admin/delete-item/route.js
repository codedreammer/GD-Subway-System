import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req) {
  try {
    const { item_id } = await req.json()

    if (!item_id) {
      return NextResponse.json(
        { error: "Missing item_id" },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from("items")
      .delete()
      .eq("id", item_id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}