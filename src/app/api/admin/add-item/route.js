import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function POST(req) {
  try {
    const { error } = await requireAdmin(req);

    if (error) {
      return error;
    }

    const {
      vendor_id,
      name,
      price,
      category_id,
    } = await req.json();

    const trimmedName =
      typeof name === "string" ? name.trim() : "";

    const missingPrice =
      price === undefined ||
      price === null ||
      price === "";

    const missingCategory =
      category_id === undefined ||
      category_id === null ||
      category_id === "";

    if (
      !vendor_id ||
      !trimmedName ||
      missingPrice ||
      missingCategory
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabaseAdmin
      .from("items")
      .insert([
        {
          vendor_id,
          name: trimmedName,
          price,
          category_id,
        },
      ]);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
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