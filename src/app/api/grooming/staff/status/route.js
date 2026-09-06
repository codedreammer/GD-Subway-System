    import { NextResponse } from "next/server"
    import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin"

    const ALLOWED_STATUSES = [
    "AVAILABLE",
    "ON_BREAK",
    "ON_LEAVE",
    "OFF_DUTY",
    ]

    export async function PATCH(request) {
    try {
        const authHeader = request.headers.get("authorization")
        const token = authHeader?.replace("Bearer ", "")

        if (!token) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
        }

        // Verify logged-in Supabase user
        const {
        data: { user },
        error: authError,
        } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
        return NextResponse.json(
            { error: "Invalid authentication" },
            { status: 401 }
        )
        }

        const body = await request.json()
        const newStatus = body?.status

        if (!ALLOWED_STATUSES.includes(newStatus)) {
        return NextResponse.json(
            {
            error:
                "Invalid status. Allowed values: AVAILABLE, ON_BREAK, ON_LEAVE, OFF_DUTY",
            },
            { status: 400 }
        )
        }

        // Find grooming staff profile
        const { data: staff, error: staffError } = await supabaseAdmin
        .from("grooming_staff")
        .select(`
            id,
            user_id,
            vendor_id,
            name,
            role,
            status,
            is_active
        `)
        .eq("user_id", user.id)
        .maybeSingle()

        if (staffError) {
        console.error("Staff lookup error:", staffError)

        return NextResponse.json(
            { error: "Failed to find staff profile" },
            { status: 500 }
        )
        }

        if (!staff) {
        return NextResponse.json(
            { error: "Grooming staff profile not found" },
            { status: 404 }
        )
        }

        if (!staff.is_active) {
        return NextResponse.json(
            { error: "Your staff account is inactive" },
            { status: 403 }
        )
        }

        // BUSY is controlled by the service lifecycle.
        if (staff.status === "BUSY") {
        return NextResponse.json(
            {
            error:
                "You cannot change availability while serving a customer.",
            },
            { status: 409 }
        )
        }

        // Update staff status
        const { data: updatedStaff, error: updateError } =
        await supabaseAdmin
            .from("grooming_staff")
            .update({
            status: newStatus,
            })
            .eq("id", staff.id)
            .select(`
            id,
            user_id,
            vendor_id,
            name,
            role,
            status,
            is_active
            `)
            .single()

        if (updateError) {
        console.error("Staff status update error:", updateError)

        return NextResponse.json(
            { error: "Failed to update availability" },
            { status: 500 }
        )
        }

        // Rebalance queue after availability changes.
        const { error: rebalanceError } = await supabaseAdmin.rpc(
        "rebalance_grooming_queue",
        {
            p_vendor_id: staff.vendor_id,
        }
        )

        if (rebalanceError) {
        console.error("Queue rebalance error:", rebalanceError)

        // Roll back status if rebalance failed.
        await supabaseAdmin
            .from("grooming_staff")
            .update({
            status: staff.status,
            })
            .eq("id", staff.id)

        return NextResponse.json(
            {
            error:
                "Availability was not changed because the queue could not be rebalanced.",
            },
            { status: 500 }
        )
        }

        return NextResponse.json({
        success: true,
        message: `Availability changed to ${newStatus}`,
        staff: updatedStaff,
        })
    } catch (error) {
        console.error("Staff status API error:", error)

        return NextResponse.json(
        {
            error: error.message || "Internal server error",
        },
        { status: 500 }
        )
    }
    }