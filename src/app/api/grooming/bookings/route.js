    import { NextResponse } from 'next/server'
    import { createClient } from '@/lib/supabase/server'
    import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin'

    const ACTIVE_BOOKING_STATUSES = ['WAITING', 'SERVING']

    export async function POST(request) {
    try {
        // ---------------------------------------------------------
        // 1. Authenticate the current user
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
        // 2. Verify public.users record and student role
        // ---------------------------------------------------------
        const { data: student, error: studentError } = await supabaseAdmin
        .from('users')
        .select('id, name, email, role, is_active')
        .eq('id', user.id)
        .single()

        if (studentError || !student) {
        return NextResponse.json(
            { error: 'User profile not found' },
            { status: 404 }
        )
        }

        if (student.role !== 'student') {
        return NextResponse.json(
            { error: 'Only students can create grooming bookings' },
            { status: 403 }
        )
        }

        if (student.is_active === false) {
        return NextResponse.json(
            { error: 'Student account is inactive' },
            { status: 403 }
        )
        }

        // ---------------------------------------------------------
        // 3. Read request body
        // ---------------------------------------------------------
        const body = await request.json()

        const vendorId = body?.vendor_id
        const serviceId = body?.service_id

        if (!vendorId || !serviceId) {
        return NextResponse.json(
            {
            error: 'vendor_id and service_id are required',
            },
            { status: 400 }
        )
        }

        // ---------------------------------------------------------
        // 4. Validate the grooming service
        // ---------------------------------------------------------
        const { data: service, error: serviceError } = await supabaseAdmin
        .from('grooming_services')
        .select(
            'id, vendor_id, name, price, duration_minutes, is_active'
        )
        .eq('id', serviceId)
        .eq('vendor_id', vendorId)
        .eq('is_active', true)
        .single()

        if (serviceError || !service) {
        return NextResponse.json(
            {
            error: 'Invalid or inactive grooming service',
            },
            { status: 400 }
        )
        }

        // ---------------------------------------------------------
        // 5. Make sure the vendor is actually a grooming salon
        // ---------------------------------------------------------
        const { data: vendor, error: vendorError } = await supabaseAdmin
        .from('vendors')
        .select('id, shop_name, category_id, is_online')
        .eq('id', vendorId)
        .single()

        if (vendorError || !vendor) {
        return NextResponse.json(
            { error: 'Grooming salon not found' },
            { status: 404 }
        )
        }

        // ---------------------------------------------------------
        // 6. Prevent duplicate active booking for same student
        // ---------------------------------------------------------
        const { data: existingBooking, error: existingError } =
        await supabaseAdmin
            .from('grooming_bookings')
            .select('id, status, queue_position')
            .eq('student_id', user.id)
            .in('status', ACTIVE_BOOKING_STATUSES)
            .maybeSingle()

        if (existingError) {
        throw existingError
        }

        if (existingBooking) {
        return NextResponse.json(
            {
            error: 'You already have an active grooming booking',
            booking: existingBooking,
            },
            { status: 409 }
        )
        }

        // ---------------------------------------------------------
        // 7. Find eligible AVAILABLE staff
        // ---------------------------------------------------------
        const { data: eligibleMappings, error: mappingError } =
        await supabaseAdmin
            .from('grooming_staff_services')
            .select(`
            staff_id,
            grooming_staff!inner (
                id,
                name,
                vendor_id,
                status,
                is_active
            )
            `)
            .eq('service_id', service.id)

        if (mappingError) {
        throw mappingError
        }

        const availableStaff = (eligibleMappings || [])
        .map((mapping) => mapping.grooming_staff)
        .filter(
            (staff) =>
            staff &&
            staff.vendor_id === vendorId &&
            staff.status === 'AVAILABLE' &&
            staff.is_active === true
        )

        // ---------------------------------------------------------
        // 8. No eligible staff
        // ---------------------------------------------------------
        if (availableStaff.length === 0) {
        return NextResponse.json(
            {
            error: 'No eligible staff member is currently available',
            },
            { status: 409 }
        )
        }

        // ---------------------------------------------------------
        // 9. Get active workload for eligible staff
        // ---------------------------------------------------------
        const staffIds = availableStaff.map((staff) => staff.id)

        const { data: activeBookings, error: workloadError } =
        await supabaseAdmin
            .from('grooming_bookings')
            .select(`
            id,
            assigned_staff_id,
            status,
            service_id,
            created_at,
            grooming_services!inner (
                duration_minutes
            )
            `)
            .in('assigned_staff_id', staffIds)
            .in('status', ACTIVE_BOOKING_STATUSES)

        if (workloadError) {
        throw workloadError
        }

        // ---------------------------------------------------------
        // 10. Calculate projected workload
        //
        // For V1:
        // - SERVING booking contributes remaining service duration
        //   approximately using its full duration.
        // - WAITING bookings contribute their service duration.
        //
        // Later we can make this more precise using started_at.
        // ---------------------------------------------------------
        const workloadByStaff = {}

        for (const staff of availableStaff) {
        workloadByStaff[staff.id] = 0
        }

        for (const booking of activeBookings || []) {
        if (!workloadByStaff[booking.assigned_staff_id]) {
            workloadByStaff[booking.assigned_staff_id] = 0
        }

        workloadByStaff[booking.assigned_staff_id] +=
            booking.grooming_services.duration_minutes
        }

        // ---------------------------------------------------------
        // 11. Select staff with earliest projected availability
        // ---------------------------------------------------------
        const selectedStaff = [...availableStaff].sort((a, b) => {
        const workloadA = workloadByStaff[a.id] || 0
        const workloadB = workloadByStaff[b.id] || 0

        if (workloadA !== workloadB) {
            return workloadA - workloadB
        }

        return a.name.localeCompare(b.name)
        })[0]

        const staffWorkload =
        workloadByStaff[selectedStaff.id] || 0

        // ---------------------------------------------------------
        // 12. Calculate queue position
        //
        // Queue position is based on active bookings for this salon.
        // ---------------------------------------------------------
        const { count: activeQueueCount, error: queueError } =
        await supabaseAdmin
            .from('grooming_bookings')
            .select('id', {
            count: 'exact',
            head: true,
            })
            .eq('vendor_id', vendorId)
            .in('status', ACTIVE_BOOKING_STATUSES)

        if (queueError) {
        throw queueError
        }

        const queuePosition = (activeQueueCount || 0) + 1

        // ---------------------------------------------------------
        // 13. Calculate ETA
        //
        // V1:
        // Selected staff's projected workload determines wait time.
        // ---------------------------------------------------------
        const estimatedWaitMinutes = staffWorkload

        const estimatedStartAt = new Date(
        Date.now() + estimatedWaitMinutes * 60 * 1000
        ).toISOString()

        // ---------------------------------------------------------
        // 14. Create booking
        // ---------------------------------------------------------
        const { data: booking, error: bookingError } =
        await supabaseAdmin
            .from('grooming_bookings')
            .insert({
            student_id: user.id,
            vendor_id: vendorId,
            service_id: service.id,
            assigned_staff_id: selectedStaff.id,
            status: 'WAITING',
            queue_position: queuePosition,
            estimated_start_at: estimatedStartAt,
            estimated_wait_minutes: estimatedWaitMinutes,
            })
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
            created_at
            `)
            .single()

        if (bookingError) {
        throw bookingError
        }

        // ---------------------------------------------------------
        // 15. Return booking information
        // ---------------------------------------------------------
        return NextResponse.json(
        {
            success: true,
            booking,
            service: {
            id: service.id,
            name: service.name,
            price: service.price,
            duration_minutes: service.duration_minutes,
            },
            salon: {
            id: vendor.id,
            name: vendor.shop_name,
            },
            staff: {
            id: selectedStaff.id,
            name: selectedStaff.name,
            },
            queue: {
            position: queuePosition,
            estimated_wait_minutes: estimatedWaitMinutes,
            estimated_start_at: estimatedStartAt,
            },
        },
        { status: 201 }
        )
    } catch (error) {
        console.error('Grooming booking error:', error)

        return NextResponse.json(
        {
            error: 'Failed to create grooming booking',
            details: error?.message || 'Unknown error',
        },
        { status: 500 }
        )
    }
    }

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const accessToken = authHeader.replace("Bearer ", "")

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken)

    if (authError || !user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: dbUser, error: userError } =
      await supabaseAdmin
        .from("users")
        .select("id, name, email, roll_no, role")
        .eq("id", user.id)
        .single()

    if (
      userError ||
      !dbUser ||
      dbUser.role !== "student"
    ) {
      return Response.json(
        { error: "Student access required" },
        { status: 403 }
      )
    }

    const { data: booking, error: bookingError } =
      await supabaseAdmin
        .from("grooming_bookings")
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
          vendors (
            id,
            shop_name
          ),
          grooming_staff (
            id,
            name,
            status
          )
        `)
        .eq("student_id", user.id)
        .in("status", ["WAITING", "SERVING"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

    if (bookingError) {
      console.error(
        "Active grooming booking lookup failed:",
        bookingError
      )

      return Response.json(
        { error: "Failed to load active booking" },
        { status: 500 }
      )
    }

    if (!booking) {
      return Response.json({
        success: true,
        has_active_booking: false,
        booking: null,
      })
    }

    return Response.json({
      success: true,
      has_active_booking: true,
      booking: {
        id: booking.id,
        status: booking.status,
        queue_position: booking.queue_position,
        estimated_start_at:
          booking.estimated_start_at,
        estimated_wait_minutes:
          booking.estimated_wait_minutes,
        created_at: booking.created_at,
        started_at: booking.started_at,
        completed_at: booking.completed_at,
      },
      service: booking.grooming_services,
      salon: booking.vendors,
      staff: booking.grooming_staff,
    })
  } catch (error) {
    console.error(
      "GET grooming booking error:",
      error
    )

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
