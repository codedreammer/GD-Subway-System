    import { NextResponse } from "next/server";
    import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

    export async function requireAdmin(req) {
    const authHeader = req.headers.get("authorization");

    // No Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {
        error: NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        ),
        };
    }

    const token = authHeader.split(" ")[1];

    // Validate Supabase JWT
    const {
        data: { user },
        error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
        return {
        error: NextResponse.json(
            { error: "Invalid token" },
            { status: 401 }
        ),
        };
    }

    // Get application role from users table
    const { data: dbUser, error: dbUserError } = await supabaseAdmin
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (dbUserError) {
        return {
        error: NextResponse.json(
            { error: "Unable to verify user role" },
            { status: 500 }
        ),
        };
    }

    // User is authenticated but not an Admin
    if (dbUser?.role !== "admin") {
        return {
        error: NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        ),
        };
    }

    return {
        user,
    };
    }