    import { NextResponse } from 'next/server'
    import { createClient } from '@/lib/supabase/server'
    import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin'

    export async function POST(request, { params }) {
    try {
        // ---------------------------------------------------------
        // 1. Get access token
        // ---------------------------------------------------------
        const authHeader = request.headers.get('authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Authorization token required' },
            { status: 401 }
        )
        }

        const accessToken = authHeader.replace('Bearer ', '').trim()

        if (!accessToken) {
        return NextResponse.json(
            { error: 'Invalid authorization token' },
            { status: 401 }
        )
        }

        // ---------------------------------------------------------
        // 2. Authenticate user
        // ---------------------------------------------------------
        const supabase = createClient(accessToken)

        const {
        data: { user },
        error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
        }

        // ---------------------------------------------------------
        // 3. Find grooming staff profile
        // ---------------------------------------------------------
        const { data: staff, error: staffError } =
        await supabaseAdmin
            .from('grooming_staff')
            .select(`
            id,
            user_id,
            vendor_id,
            name,
            role,
            status,
            is_active
            `)
            .eq('user_id', user.id)
            .single()

        if (staffError || !staff) {
        return NextResponse.json(
            { error: 'Grooming staff profile not found' },
            { status: 404 }
        )
        }

        // ---------------------------------------------------------
        // 4. Verify active staff
        // ---------------------------------------------------------
        if (!staff.is_active) {
        return NextResponse.json(
            { error: 'Staff account is inactive' },
            { status: 403 }
        )
        }

        // ---------------------------------------------------------
        // 5. Get booking
        // ---------------------------------------------------------
        const bookingId = params.id

        const { data: booking, error: bookingError } =
        await supabaseAdmin
            .from('grooming_bookings')
            .select(`
            id,
            student_id,
            vendor_id,
            service_id,
            assigned_staff_id,
            status,
            queue_position,
            estimated_start_at,
            estimated_wait_minutes,
            created_at,
            started_at,
            completed_at,
            grooming_services (
                id,
                name,
                duration_minutes,
                price
            )
            `)
            .eq('id', bookingId)
            .single()

        if (bookingError || !booking) {
        return NextResponse.json(
            { error: 'Booking not found' },
            { status: 404 }
        )
        }

        // ---------------------------------------------------------
        // 6. Authorization checks
        // ---------------------------------------------------------
        if (booking.assigned_staff_id !== staff.id) {
        return NextResponse.json(
            {
            error: 'This booking is not assigned to you',
            },
            { status: 403 }
        )
        }

        if (booking.vendor_id !== staff.vendor_id) {
        return NextResponse.json(
            {
            error: 'Booking belongs to another grooming salon',
            },
            { status: 403 }
        )
        }

        // ---------------------------------------------------------
        // 7. Atomically complete booking
        // ---------------------------------------------------------
        const { data: transition, error: transitionError } =
        await supabaseAdmin.rpc('complete_grooming_booking', {
            p_booking_id: booking.id,
            p_staff_id: staff.id,
        })

        if (transitionError) {
        console.error(
            'Complete grooming booking RPC error:',
            transitionError
        )

        return NextResponse.json(
            {
            error: transitionError.message,
            },
            { status: 409 }
        )
        }

        const result = Array.isArray(transition)
        ? transition[0]
        : transition

        // ---------------------------------------------------------
        // 8. Return updated booking
        // ---------------------------------------------------------
        return NextResponse.json(
        {
            success: true,
            message: 'Grooming service completed',

            booking: {
            ...booking,
            status: result.booking_status,
            completed_at: result.completed_at,
            },

            staff: {
            id: staff.id,
            name: staff.name,
            status: result.staff_status,
            },

            service: booking.grooming_services,
        },
        { status: 200 }
        )
    } catch (error) {
        console.error('Grooming complete-service error:', error)

        return NextResponse.json(
        {
            error: 'Failed to complete grooming service',
            details: error?.message || 'Unknown error',
        },
        { status: 500 }
        )
    }
    }