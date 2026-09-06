    "use client"

    import { useEffect, useState } from "react"
    import { useRouter } from "next/navigation"
    import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Scissors,
    UserRound,
    Sparkles,
    } from "lucide-react"
    import { supabase } from "@/lib/supabase/supabaseClient"

    const GROOMING_CATEGORY_ID =
    "c633c17f-ea04-45be-b5bb-4b39ddd0001d"

    export default function StudentGroomingPage() {
    const router = useRouter()

    const [salons, setSalons] = useState([])
    const [services, setServices] = useState([])

    const [selectedSalon, setSelectedSalon] = useState(null)
    const [selectedService, setSelectedService] = useState(null)

    const [loading, setLoading] = useState(true)
    const [booking, setBooking] = useState(false)
    const [error, setError] = useState("")
    const [bookingResult, setBookingResult] = useState(null)
    const [activeBooking, setActiveBooking] = useState(null)
    const [checkingBooking, setCheckingBooking] = useState(true)

    useEffect(() => {
        loadGroomingData()
        loadActiveBooking()
    }, [])

    const loadGroomingData = async () => {
        try {
        setLoading(true)
        setError("")

        const { data: salonData, error: salonError } = await supabase
            .from("vendors")
            .select("id, shop_name, category_id, is_online")
            .eq("category_id", GROOMING_CATEGORY_ID)

        if (salonError) {
            throw salonError
        }

        const { data: serviceData, error: serviceError } =
            await supabase
            .from("grooming_services")
            .select(
                "id, vendor_id, name, price, duration_minutes, is_active"
            )
            .eq("is_active", true)
            .order("created_at", {
                ascending: true,
            })

        if (serviceError) {
            throw serviceError
        }

        setSalons(salonData || [])
        setServices(serviceData || [])
        } catch (err) {
        console.error("Grooming data error:", err)
        setError(
            err?.message || "Unable to load grooming services"
        )
        } finally {
        setLoading(false)
        }
    }

    const loadActiveBooking = async () => {
        try {
        setCheckingBooking(true)

        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
            return
        }

        const response = await fetch(
            "/api/grooming/bookings",
            {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
            }
        )

        const data = await response.json()

        if (response.status === 409) {
            await loadActiveBooking()
            return
        }

        if (!response.ok) {
            throw new Error(
            data?.error || "Failed to load active booking"
            )
        }

        if (data.has_active_booking) {
            setActiveBooking(data)
        } else {
            setActiveBooking(null)
        }
        } catch (err) {
        console.error(
            "Active grooming booking error:",
            err
        )
        } finally {
        setCheckingBooking(false)
        }
    }

    const getServicesForSalon = (vendorId) => {
        return services.filter(
        (service) => service.vendor_id === vendorId
        )
    }

    const handleSalonSelect = (salon) => {
        setSelectedSalon(salon)
        setSelectedService(null)
        setBookingResult(null)
        setError("")
    }

    const handleBook = async () => {
        if (!selectedSalon || !selectedService) {
        return
        }

        try {
        setBooking(true)
        setError("")

        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
            router.push("/auth/login")
            return
        }

        const response = await fetch(
            "/api/grooming/bookings",
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                vendor_id: selectedSalon.id,
                service_id: selectedService.id,
            }),
            }
        )

        const data = await response.json()

        if (!response.ok) {
            throw new Error(
            data?.error || "Failed to create grooming booking"
            )
        }

        router.push("/student/grooming/booking")
        } catch (err) {
        console.error("Booking error:", err)
        setError(
            err?.message || "Failed to create grooming booking"
        )
        } finally {
        setBooking(false)
        }
    }

    if (loading || checkingBooking) {
        return (
        <main className="min-h-screen bg-slate-50 px-5 pb-28 pt-6">
            <div className="mx-auto max-w-3xl space-y-5">
            <div className="skeleton h-24 rounded-[2rem]" />
            <div className="skeleton h-40 rounded-[2rem]" />
            <div className="skeleton h-60 rounded-[2rem]" />
            </div>
        </main>
        )
    }

    if (bookingResult) {
        const result = bookingResult.booking
        const service = bookingResult.service
        const staff = bookingResult.staff
        const salon = bookingResult.salon
        const queue = bookingResult.queue

        return (
        <main className="min-h-screen bg-slate-50 px-5 pb-28 pt-6">
            <div className="mx-auto max-w-3xl space-y-5">

            {/* Header */}
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f3d22] via-[#166534] to-[#22c55e] p-6 text-white shadow-[0_24px_70px_-34px_rgba(22,101,52,0.95)]">

                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

                <div className="relative">
                <button
                    onClick={() => router.push("/student")}
                    className="mb-6 flex items-center gap-2 text-sm font-semibold text-emerald-100"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                    <CheckCircle2 className="h-7 w-7" />
                    </div>

                    <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-emerald-100">
                        Booking confirmed
                    </p>

                    <h1 className="mt-1 text-3xl font-black">
                        You're in the queue
                    </h1>
                    </div>
                </div>
                </div>
            </section>

            {/* Queue card */}
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.45)]">

                <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
                    Your queue position
                </p>

                <div className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-900 text-4xl font-black text-white">
                    #{queue.position}
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-900">
                    {service.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    {salon.name}
                </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">

                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <Clock3 className="mx-auto h-5 w-5 text-emerald-600" />

                    <p className="mt-2 text-xl font-black text-slate-900">
                    {queue.estimated_wait_minutes} min
                    </p>

                    <p className="text-xs text-slate-400">
                    Estimated wait
                    </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <UserRound className="mx-auto h-5 w-5 text-emerald-600" />

                    <p className="mt-2 font-black text-slate-900">
                    {staff.name}
                    </p>

                    <p className="text-xs text-slate-400">
                    Assigned staff
                    </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <Scissors className="mx-auto h-5 w-5 text-emerald-600" />

                    <p className="mt-2 text-xl font-black text-slate-900">
                    ₹{service.price}
                    </p>

                    <p className="text-xs text-slate-400">
                    Service price
                    </p>
                </div>

                </div>
            </section>

            {/* Status */}
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.45)]">

                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
                Booking status
                </p>

                <div className="mt-5 flex items-center gap-4 rounded-2xl bg-amber-50 p-5">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <Clock3 className="h-6 w-6" />
                </div>

                <div>
                    <p className="font-black text-slate-900">
                    {result.status}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                    Please wait until the staff member starts your service.
                    </p>
                </div>

                </div>
            </section>

            <button
                onClick={() => router.push("/student")}
                className="w-full rounded-xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
                Back to Student Dashboard
            </button>

            </div>
        </main>
        )
    }

    return (
        <main className="min-h-screen bg-slate-50 px-5 pb-28 pt-6">
        <div className="mx-auto max-w-3xl space-y-6">

            {/* =====================================================
                HEADER
            ====================================================== */}
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f3d22] via-[#166534] to-[#22c55e] p-6 text-white shadow-[0_24px_70px_-34px_rgba(22,101,52,0.95)]">

            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />

            <div className="relative">

                <button
                onClick={() => router.push("/student")}
                className="mb-6 flex items-center gap-2 text-sm font-semibold text-emerald-100"
                >
                <ArrowLeft className="h-4 w-4" />
                Student Dashboard
                </button>

                <div className="flex items-center justify-between gap-4">

                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-100">
                    Campus Grooming
                    </p>

                    <h1 className="mt-2 text-3xl font-black tracking-tight">
                    Look sharp. Skip the queue.
                    </h1>

                    <p className="mt-2 max-w-md text-sm leading-6 text-emerald-100">
                    Choose a salon, pick your service and join the live grooming queue.
                    </p>
                </div>

                <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 sm:flex">
                    <Scissors className="h-8 w-8" />
                </div>

                </div>
            </div>
            </section>

            {activeBooking && (
            <section className="overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_55px_-35px_rgba(15,23,42,0.5)]">

                <div className="bg-gradient-to-br from-[#0f3d22] via-[#166534] to-[#22c55e] p-6 text-white">

                <div className="flex items-start justify-between gap-4">

                    <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-100">
                        Active Grooming Booking
                    </p>

                    <h2 className="mt-2 text-2xl font-black">
                        You're already in the queue
                    </h2>

                    <p className="mt-1 text-sm text-emerald-100">
                        You can only have one active grooming booking.
                    </p>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                    <Scissors className="h-6 w-6" />
                    </div>

                </div>
                </div>

                <div className="p-6">

                <div className="flex items-center justify-between gap-4">

                    <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        {activeBooking.service?.name}
                    </p>

                    <h3 className="mt-1 text-xl font-black text-slate-900">
                        {activeBooking.salon?.shop_name}
                    </h3>
                    </div>

                    <span
                    className={`rounded-full px-4 py-2 text-xs font-black ${
                        activeBooking.booking.status === "SERVING"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                    >
                    {activeBooking.booking.status}
                    </span>

                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">

                    <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-xs font-semibold text-slate-400">
                        Queue
                    </p>

                    <p className="mt-1 text-2xl font-black text-slate-900">
                        #{activeBooking.booking.queue_position}
                    </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-xs font-semibold text-slate-400">
                        Estimated wait
                    </p>

                    <p className="mt-1 text-2xl font-black text-slate-900">
                        {activeBooking.booking.estimated_wait_minutes ?? 0} min
                    </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-xs font-semibold text-slate-400">
                        Staff
                    </p>

                    <p className="mt-1 text-lg font-black text-slate-900">
                        {activeBooking.staff?.name || "Assigning..."}
                    </p>
                    </div>

                </div>

                <button
                    onClick={() => router.push("/student/grooming/booking")}
                    className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                    View My Booking
                </button>

                </div>
            </section>
            )}

            {/* Error */}
            {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                {error}
            </div>
            )}

            {!activeBooking && (
            <>
            {/* =====================================================
                SALON SELECTION
            ====================================================== */}
            <section className="space-y-4">

            <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
                Step 1
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                Choose your salon
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                Select the grooming salon you want to visit.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

                {salons.map((salon) => {
                const isSelected =
                    selectedSalon?.id === salon.id

                const isMaleSalon =
                    salon.shop_name?.toLowerCase() === "beards"

                return (
                    <button
                    key={salon.id}
                    onClick={() => handleSalonSelect(salon)}
                    className={`relative overflow-hidden rounded-[2rem] bg-white p-5 text-left shadow-[0_15px_45px_-30px_rgba(15,23,42,0.45)] transition ${
                        isSelected
                        ? "ring-2 ring-emerald-500"
                        : "hover:-translate-y-1"
                    }`}
                    >

                    <div className="flex items-start justify-between">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <Scissors className="h-7 w-7" />
                        </div>

                        {isSelected && (
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        )}

                    </div>

                    <h3 className="mt-5 text-xl font-black text-slate-900">
                        {salon.shop_name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        {isMaleSalon
                        ? "Men's grooming"
                        : "Women's grooming"}
                    </p>

                    <div className="mt-4">
                        <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            salon.is_online
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                        >
                        {salon.is_online
                            ? "OPEN NOW"
                            : "AVAILABLE"}
                        </span>
                    </div>

                    </button>
                )
                })}

            </div>
            </section>

            {/* =====================================================
                SERVICE SELECTION
            ====================================================== */}
            {selectedSalon && (
            <section className="space-y-4">

                <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
                    Step 2
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900">
                    Choose your service
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Services available at {selectedSalon.shop_name}.
                </p>
                </div>

                <div className="space-y-3">

                {getServicesForSalon(selectedSalon.id).map(
                    (service) => {
                    const isSelected =
                        selectedService?.id === service.id

                    return (
                        <button
                        key={service.id}
                        onClick={() =>
                            setSelectedService(service)
                        }
                        className={`w-full rounded-[1.5rem] bg-white p-5 text-left shadow-[0_15px_45px_-30px_rgba(15,23,42,0.45)] transition ${
                            isSelected
                            ? "ring-2 ring-emerald-500"
                            : "hover:-translate-y-0.5"
                        }`}
                        >

                        <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <Scissors className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                            <h3 className="font-black text-slate-900">
                                {service.name}
                            </h3>

                            <div className="mt-2 flex flex-wrap gap-2">

                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                                <Clock3 className="h-3.5 w-3.5" />
                                {service.duration_minutes} min
                                </span>

                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                ₹{service.price}
                                </span>

                            </div>
                            </div>

                            {isSelected && (
                            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
                            )}

                        </div>

                        </button>
                    )
                    }
                )}

                {getServicesForSalon(selectedSalon.id).length ===
                    0 && (
                    <div className="rounded-[1.5rem] bg-white p-8 text-center">
                    <Scissors className="mx-auto h-8 w-8 text-slate-300" />

                    <p className="mt-3 font-semibold text-slate-700">
                        No services available
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Please choose another salon.
                    </p>
                    </div>
                )}

                </div>
            </section>
            )}

            {/* =====================================================
                BOOKING SUMMARY
            ====================================================== */}
            {selectedSalon && selectedService && (
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.45)]">

                <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Sparkles className="h-5 w-5" />
                </div>

                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                    Ready?
                    </p>

                    <h2 className="text-xl font-black text-slate-900">
                    Confirm your booking
                    </h2>
                </div>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-5">

                <div className="flex items-center justify-between gap-4">
                    <div>
                    <p className="font-black text-slate-900">
                        {selectedService.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        {selectedSalon.shop_name}
                    </p>
                    </div>

                    <p className="text-xl font-black text-slate-900">
                    ₹{selectedService.price}
                    </p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    {selectedService.duration_minutes} minutes
                </div>

                </div>

                <button
                onClick={handleBook}
                disabled={booking}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                <CheckCircle2 className="h-5 w-5" />

                {booking
                    ? "Joining Queue..."
                    : "Join Grooming Queue"}
                </button>

                <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                You can only have one active grooming booking at a time.
                </p>

            </section>
            )}
            </>
            )}

        </div>
        </main>
    )
    }
