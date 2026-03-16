    import { NextResponse } from "next/server"
    import { supabaseAdmin } from "@/lib/supabaseAdmin"
    import crypto from "crypto"

    function generatePassword() {
    return crypto.randomBytes(6).toString("base64").slice(0, 10)
    }

    export async function POST(req) {
    try {
        const { user_id } = await req.json()

        if (!user_id) {
        return NextResponse.json(
            { error: "Missing user_id" },
            { status: 400 }
        )
        }

        const newPassword = generatePassword()

        const { error } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { password: newPassword }
        )

        if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        )
        }

        return NextResponse.json({
        success: true,
        password: newPassword
        })

    } catch (err) {
        return NextResponse.json(
        { error: err.message },
        { status: 500 }
        )
    }
    }