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
    const { item_id, name, price } = await req.json();

    // Validate required fields
    if (!item_id || !name || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const trimmedName =
      typeof name === "string" ? name.trim() : "";

    if (!trimmedName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update item
    const { error: updateError } = await supabaseAdmin
      .from("items")
      .update({
        name: trimmedName,
        price,
      })
      .eq("id", item_id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
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