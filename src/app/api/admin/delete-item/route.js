import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function POST(req) {
  try {
    // Admin authorization
    const { error } = await requireAdmin(req);

    if (error) {
      return error;
    }

    // Read request body
    const { item_id } = await req.json();

    // Validate required field
    if (!item_id) {
      return NextResponse.json(
        { error: "Missing item_id" },
        { status: 400 }
      );
    }

    // Delete item
    const { error: deleteError } = await supabaseAdmin
      .from("items")
      .delete()
      .eq("id", item_id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}