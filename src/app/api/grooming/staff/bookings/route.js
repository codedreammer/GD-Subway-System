import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin'

export async function GET(request) {
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
          is_active,
          vendors (
            id,
            shop_name
          )
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
    // 5. Get staff bookings
    //
    // We return active bookings plus recently completed
    // bookings so the staff dashboard can show current state.
    // ---------------------------------------------------------
    const { data: bookings, error: bookingsError } =
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
            price,
            duration_minutes
          ),
          users!grooming_bookings_student_id_fkey (
            id,
            name,
            email,
            roll_no
          )
        `)
        .eq('assigned_staff_id', staff.id)
        .in('status', ['WAITING', 'SERVING', 'COMPLETED'])
        .order('created_at', { ascending: true })

    if (bookingsError) {
      throw bookingsError
    }

    // ---------------------------------------------------------
    // 6. Separate bookings by status
    // ---------------------------------------------------------
    const currentBooking =
      bookings?.find((booking) => booking.status === 'SERVING') || null

    const waitingBookings =
      bookings?.filter((booking) => booking.status === 'WAITING') || []

    const completedBookings =
      bookings?.filter((booking) => booking.status === 'COMPLETED') || []

    // ---------------------------------------------------------
    // 7. Return dashboard data
    // ---------------------------------------------------------
    return NextResponse.json(
      {
        success: true,

        staff: {
          id: staff.id,
          user_id: staff.user_id,
          name: staff.name,
          role: staff.role,
          status: staff.status,
          is_active: staff.is_active,
        },

        salon: {
          id: staff.vendor_id,
          name: staff.vendors?.shop_name || null,
        },

        current_booking: currentBooking,

        waiting_bookings: waitingBookings,

        completed_bookings: completedBookings,

        summary: {
          waiting_count: waitingBookings.length,
          completed_count: completedBookings.length,
          has_current_booking: Boolean(currentBooking),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Grooming staff bookings error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch grooming staff bookings',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}