    "use client"

    import { useCallback, useEffect, useState } from "react"
    import { useRouter } from "next/navigation"
    import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Scissors,
    UserRound,
    RefreshCw,
    } from "lucide-react"
    import { supabase } from "@/lib/supabase/supabaseClient"

    export default function GroomingBookingPage() {
    const router = useRouter()

    const [booking, setBooking] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState("")

    const loadBooking = useCallback(async (showLoader = false) => {
        try {
        if (showLoader) {
            setRefreshing(true)
        }

        setError("")

        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
            router.push("/auth/login")
            return
        }

        const response = await fetch("/api/grooming/bookings", {
            method: "GET",
            headers: {
            Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(
            data?.error || "Failed to load grooming booking"
            )
        }

        if (!data.has_active_booking) {
            setBooking(null)
            return
        }

        setBooking(data)
        } catch (err) {
        console.error("Grooming booking load error:", err)

        setError(
            err?.message || "Unable to load your grooming booking"
        )
        } finally {
        setLoading(false)
        setRefreshing(false)
        }
    }, [router])

    useEffect(() => {
        loadBooking()

        const interval = setInterval(() => {
        loadBooking()
        }, 10000)

        return () => clearInterval(interval)
    }, [loadBooking])

    const getStatusConfig = (status) => {
        if (status === "SERVING") {
        return {
            label: "SERVICE IN PROGRESS",
            description:
            "Your grooming service has started. Please proceed to the salon.",
            wrapper:
            "bg-emerald-50 border-emerald-200",
            icon:
            "bg-emerald-100 text-emerald-700",
            text:
            "text-emerald-700",
        }
        }

        return {
        label: "WAITING",
        description:
            "You're in the queue. We'll update your status when your service starts.",
        wrapper:
            "bg-amber-50 border-amber-200",
        icon:
            "bg-amber-100 text-amber-700",
        text:
            "text-amber-700",
        }
    }

    if (loading) {
        return (
        <main className="min-h-screen bg-slate-50 px-5 pb-28 pt-6">
            <div className="mx-auto max-w-3xl space-y-5">
            <div className="skeleton h-28 rounded-[2rem]" />
            <div className="skeleton h-80 rounded-[2rem]" />
            <div className="skeleton h-48 rounded-[2rem]" />
            </div>
        </main>
        )
    }

    if (!booking) {
        return (
        <main className="min-h-screen bg-slate-50 px-5 pb-28 pt-6">
            <div className="mx-auto max-w-3xl">

            <button
                onClick={() => router.push("/student/grooming")}
                className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-600"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Grooming
            </button>

            <section className="rounded-[2rem] bg-white p-8 text-center shadow-[0_20px_55px_-35px_rgba(15,23,42,0.5)]">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Scissors className="h-8 w-8" />
                </div>

                <h1 className="mt-5 text-2xl font-black text-slate-900">
                No active booking
                </h1>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You don't currently have a grooming service in progress
                or waiting in the queue.
                </p>

                <button
                onClick={() => router.push("/student/grooming")}
                className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                Book a Grooming Service
                </button>

            </section>
            </div>
        </main>
        )
    }

    const status = booking.booking.status
    const statusConfig = getStatusConfig(status)

    const service = booking.service
    const salon = booking.salon
    const staff = booking.staff

    return (
        <main className="min-h-screen bg-slate-50 px-5 pb-28 pt-6">
        <div className="mx-auto max-w-3xl space-y-5">

            {/* HEADER */}
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f3d22] via-[#166534] to-[#22c55e] p-6 text-white shadow-[0_24px_70px_-34px_rgba(22,101,52,0.95)]">

            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">

                <button
                onClick={() => router.push("/student/grooming")}
                className="mb-6 flex items-center gap-2 text-sm font-semibold text-emerald-100"
                >
                <ArrowLeft className="h-4 w-4" />
                Grooming
                </button>

                <div className="flex items-center justify-between gap-4">

                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-100">
                    My Grooming Booking
                    </p>

                    <h1 className="mt-2 text-3xl font-black tracking-tight">
                    Your place in the queue
                    </h1>

                    <p className="mt-2 text-sm text-emerald-100">
                    {salon?.shop_name || "Grooming Salon"}
                    </p>
                </div>

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                    <Scissors className="h-8 w-8" />
                </div>

                </div>
            </div>
            </section>

            {/* ERROR */}
            {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                {error}
            </div>
            )}

            {/* STATUS */}
            <section
            className={`rounded-[2rem] border p-6 ${statusConfig.wrapper}`}
            >

            <div className="flex items-start gap-4">

                <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${statusConfig.icon}`}
                >
                {status === "SERVING" ? (
                    <Scissors className="h-7 w-7" />
                ) : (
                    <Clock3 className="h-7 w-7" />
                )}
                </div>

                <div className="min-w-0">

                <p
                    className={`text-xs font-black uppercase tracking-[0.2em] ${statusConfig.text}`}
                >
                    {statusConfig.label}
                </p>

                <h2 className="mt-2 text-xl font-black text-slate-900">
                    {status === "SERVING"
                    ? "Your service has started"
                    : "You're in the queue"}
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                    {statusConfig.description}
                </p>

                </div>
            </div>
            </section>

            {/* QUEUE POSITION */}
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.5)]">

            <div className="text-center">

                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">
                Queue position
                </p>

                <div className="mx-auto mt-4 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-slate-900 text-5xl font-black text-white shadow-lg">
                #{booking.booking.queue_position ?? "-"}
                </div>

                <p className="mt-4 text-sm text-slate-500">
                {status === "SERVING"
                    ? "You're currently being served"
                    : "Your turn is coming up"}
                </p>

            </div>

            {/* DETAILS */}
            <div className="mt-7 grid gap-3 sm:grid-cols-3">

                <div className="rounded-2xl bg-slate-50 p-5 text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Scissors className="h-5 w-5" />
                </div>

                <p className="mt-3 text-xs font-semibold text-slate-400">
                    Service
                </p>

                <p className="mt-1 font-black text-slate-900">
                    {service?.name}
                </p>

                </div>

                <div className="rounded-2xl bg-slate-50 p-5 text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <Clock3 className="h-5 w-5" />
                </div>

                <p className="mt-3 text-xs font-semibold text-slate-400">
                    Estimated wait
                </p>

                <p className="mt-1 font-black text-slate-900">
                    {booking.booking.estimated_wait_minutes ?? 0} min
                </p>

                </div>

                <div className="rounded-2xl bg-slate-50 p-5 text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <UserRound className="h-5 w-5" />
                </div>

                <p className="mt-3 text-xs font-semibold text-slate-400">
                    Staff
                </p>

                <p className="mt-1 font-black text-slate-900">
                    {staff?.name || "Assigning..."}
                </p>

                </div>

            </div>
            </section>

            {/* SERVICE SUMMARY */}
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.5)]">

            <div className="flex items-center justify-between gap-4">

                <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Booking details
                </p>

                <h2 className="mt-2 text-xl font-black text-slate-900">
                    {service?.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    {salon?.shop_name}
                </p>
                </div>

                <p className="text-2xl font-black text-slate-900">
                ₹{service?.price}
                </p>

            </div>

            <div className="mt-5 flex flex-wrap gap-2">

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                {service?.duration_minutes} min
                </span>

                <span
                className={`rounded-full px-3 py-1.5 text-xs font-black ${
                    status === "SERVING"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
                >
                {status}
                </span>

            </div>
            </section>

            {/* REFRESH */}
            <button
            onClick={() => loadBooking(true)}
            disabled={refreshing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
            <RefreshCw
                className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
                }`}
            />

            {refreshing ? "Refreshing..." : "Refresh Booking"}
            </button>

            {/* BACK */}
            <button
            onClick={() => router.push("/student")}
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
            Back to Student Dashboard
            </button>

        </div>
        </main>
    )
    }