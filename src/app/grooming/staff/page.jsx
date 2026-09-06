    "use client"

    import { useEffect, useState } from "react"
    import {
    CheckCircle2,
    Clock3,
    Scissors,
    UserRound,
    UserCheck,
    Play,
    LogOut,
    RefreshCw,
    Sparkles,
    ChevronDown,
    } from "lucide-react"
    import { supabase } from "@/lib/supabase/supabaseClient"

    export default function GroomingStaffPage() {
    const [dashboard, setDashboard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [statusLoading, setStatusLoading] = useState(false)
    const [error, setError] = useState("")

    const getAccessToken = async () => {
        const {
        data: { session },
        } = await supabase.auth.getSession()

        return session?.access_token || null
    }

    const loadDashboard = async () => {
        try {
        setLoading(true)
        setError("")

        const accessToken = await getAccessToken()

        if (!accessToken) {
            throw new Error("Your session has expired. Please log in again.")
        }

        const response = await fetch("/api/grooming/staff/bookings", {
            method: "GET",
            headers: {
            Authorization: `Bearer ${accessToken}`,
            },
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to load staff dashboard")
        }

        setDashboard(data)
        } catch (err) {
        console.error("Staff dashboard error:", err)
        setError(err.message || "Failed to load dashboard")
        } finally {
        setLoading(false)
        }
    }

    useEffect(() => {
        loadDashboard()
    }, [])

    const startService = async (bookingId) => {
        try {
        setActionLoading(true)
        setError("")

        const accessToken = await getAccessToken()

        if (!accessToken) {
            throw new Error("Your session has expired.")
        }

        const response = await fetch(
            `/api/grooming/staff/bookings/${bookingId}/start`,
            {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            }
        )

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to start service")
        }

        await loadDashboard()
        } catch (err) {
        console.error("Start service error:", err)
        setError(err.message || "Failed to start service")
        } finally {
        setActionLoading(false)
        }
    }

    const completeService = async (bookingId) => {
        try {
        setActionLoading(true)
        setError("")

        const accessToken = await getAccessToken()

        if (!accessToken) {
            throw new Error("Your session has expired.")
        }

        const response = await fetch(
            `/api/grooming/staff/bookings/${bookingId}/complete`,
            {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            }
        )

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to complete service")
        }

        await loadDashboard()
        } catch (err) {
        console.error("Complete service error:", err)
        setError(err.message || "Failed to complete service")
        } finally {
        setActionLoading(false)
        }
    }

    const updateAvailability = async (newStatus) => {
        if (!newStatus || newStatus === staff?.status) return

        try {
        setStatusLoading(true)
        setError("")

        const accessToken = await getAccessToken()

        if (!accessToken) {
            throw new Error("Your session has expired. Please log in again.")
        }

        const response = await fetch("/api/grooming/staff/status", {
            method: "PATCH",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
            status: newStatus,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to update availability")
        }

        await loadDashboard()
        } catch (err) {
        console.error("Availability update error:", err)
        setError(err.message || "Failed to update availability")
        } finally {
        setStatusLoading(false)
        }
    }

    const logout = async () => {
        await supabase.auth.signOut()
        window.location.href = "/auth/login"
    }

    const getStatusStyles = (status) => {
        switch (status) {
        case "AVAILABLE":
            return {
            dot: "bg-emerald-400",
            badge: "bg-white/15 text-white",
            }

        case "BUSY":
            return {
            dot: "bg-amber-400",
            badge: "bg-white/15 text-white",
            }

        case "ON_BREAK":
            return {
            dot: "bg-blue-400",
            badge: "bg-white/15 text-white",
            }

        case "ON_LEAVE":
            return {
            dot: "bg-red-400",
            badge: "bg-white/15 text-white",
            }

        default:
            return {
            dot: "bg-slate-400",
            badge: "bg-white/15 text-white",
            }
        }
    }

    if (loading) {
        return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-5 animate-pulse">
            <div className="h-72 rounded-[2rem] bg-slate-200" />
            <div className="grid gap-5 lg:grid-cols-2">
                <div className="h-72 rounded-[2rem] bg-slate-200" />
                <div className="h-72 rounded-[2rem] bg-slate-200" />
            </div>
            <div className="h-48 rounded-[2rem] bg-slate-200" />
            </div>
        </main>
        )
    }

    if (error && !dashboard) {
        return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Scissors className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-900">
                Staff Portal Unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
                {error}
            </p>

            <button
                onClick={loadDashboard}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
            >
                <RefreshCw className="h-4 w-4" />
                Try Again
            </button>
            </div>
        </main>
        )
    }

    const staff = dashboard?.staff
    const salon = dashboard?.salon
    const currentBooking = dashboard?.current_booking
    const waitingBookings = dashboard?.waiting_bookings || []
    const completedBookings = dashboard?.completed_bookings || []

    const statusStyles = getStatusStyles(staff?.status)

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">

            {/* =====================================================
                HERO / HEADER
            ====================================================== */}
            <section className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-[#0f3d22] via-[#166534] to-[#22c55e] p-6 text-white shadow-[0_25px_60px_-30px_rgba(22,101,52,0.7)] sm:p-8">

            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
            </div>

            <div className="relative">

                {/* Top row */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur">
                    <Scissors className="h-7 w-7" />
                    </div>

                    <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-100">
                        Grooming Workspace
                    </p>

                    <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                        {salon?.name || "Grooming"}
                    </h1>

                    <p className="mt-1 text-sm text-emerald-100">
                        Staff Portal • Welcome, {staff?.name}
                    </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">

                    {/* Availability */}
                    <div className="relative">
                    <select
                        value={staff?.status || "OFF_DUTY"}
                        disabled={statusLoading || staff?.status === "BUSY"}
                        onChange={(e) => updateAvailability(e.target.value)}
                        className="appearance-none cursor-pointer rounded-xl border border-white/15 bg-white/10 py-3 pl-4 pr-10 text-sm font-bold text-white outline-none backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <option value="AVAILABLE" className="text-slate-900">
                        AVAILABLE
                        </option>

                        <option value="ON_BREAK" className="text-slate-900">
                        ON BREAK
                        </option>

                        <option value="ON_LEAVE" className="text-slate-900">
                        ON LEAVE
                        </option>

                        <option value="OFF_DUTY" className="text-slate-900">
                        OFF DUTY
                        </option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
                    </div>

                    {/* Current status */}
                    <div
                    className={`hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-bold backdrop-blur sm:flex ${statusStyles.badge}`}
                    >
                    <span
                        className={`h-2.5 w-2.5 rounded-full ${statusStyles.dot}`}
                    />

                    {staff?.status}
                    </div>

                    {/* Logout */}
                    <button
                    onClick={logout}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 transition hover:bg-white/20"
                    title="Logout"
                    >
                    <LogOut className="h-5 w-5" />
                    </button>
                </div>
                </div>

                {/* Hero stats */}
                <div className="mt-8 grid gap-3 sm:grid-cols-3">

                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                    <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <Scissors className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-2xl font-black">
                        {currentBooking ? "1" : "0"}
                        </p>

                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                        Current
                        </p>
                    </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                    <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <Clock3 className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-2xl font-black">
                        {waitingBookings.length}
                        </p>

                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                        Waiting
                        </p>
                    </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                    <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-2xl font-black">
                        {completedBookings.length}
                        </p>

                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                        Completed
                        </p>
                    </div>
                    </div>
                </div>

                </div>
            </div>
            </section>

            {staff?.status !== "BUSY" && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <UserCheck className="h-5 w-5" />
                </div>

                <div>
                    <p className="text-sm font-bold text-emerald-900">
                    Availability controls your queue assignment
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                    When you choose Break, Leave, or Off Duty, new waiting
                    customers will be reassigned to another eligible available staff
                    member.
                    </p>
                </div>
                </div>
            </div>
            )}

            {/* Error */}
            {error && (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                <span>{error}</span>

                <button
                onClick={() => setError("")}
                className="font-bold"
                >
                Dismiss
                </button>
            </div>
            )}

            {/* =====================================================
                CURRENT SERVICE + QUEUE
            ====================================================== */}
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">

            {/* Current Service */}
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.45)]">

                <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                    Active Service
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                    {currentBooking
                        ? currentBooking.grooming_services?.name
                        : "No active service"}
                    </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Scissors className="h-6 w-6" />
                </div>
                </div>

                {currentBooking ? (
                <div className="mt-6">

                    {/* Student */}
                    <div className="rounded-2xl bg-slate-50 p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                        <UserRound className="h-5 w-5 text-slate-600" />
                        </div>

                        <div>
                        <p className="font-bold text-slate-900">
                            {currentBooking.users?.name ||
                            currentBooking.users?.roll_no ||
                            "Student"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            {currentBooking.users?.roll_no}
                        </p>
                        </div>
                    </div>
                    </div>

                    {/* Service details */}
                    <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-2xl border border-slate-100 p-4">
                        <p className="text-xs font-medium text-slate-400">
                        Duration
                        </p>

                        <p className="mt-1 text-lg font-black text-slate-900">
                        {currentBooking.grooming_services?.duration_minutes} min
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 p-4">
                        <p className="text-xs font-medium text-slate-400">
                        Price
                        </p>

                        <p className="mt-1 text-lg font-black text-slate-900">
                        ₹{currentBooking.grooming_services?.price}
                        </p>
                    </div>

                    </div>

                    {/* Complete */}
                    <button
                    disabled={actionLoading}
                    onClick={() => completeService(currentBooking.id)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                    <CheckCircle2 className="h-5 w-5" />

                    {actionLoading
                        ? "Completing..."
                        : "Mark Service Completed"}
                    </button>

                </div>
                ) : (
                <div className="mt-6 flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
                    <Scissors className="h-6 w-6" />
                    </div>

                    <p className="mt-4 font-semibold text-slate-700">
                    You're currently free
                    </p>

                    <p className="mt-1 max-w-xs text-sm text-slate-400">
                    Start the next customer from your queue when you're ready.
                    </p>
                </div>
                )}
            </section>

            {/* My Queue */}
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.45)]">

                <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                    Queue
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                    Waiting Customers
                    </h2>
                </div>

                <div className="flex h-11 min-w-11 items-center justify-center rounded-full bg-emerald-50 px-3 text-sm font-black text-emerald-700">
                    {waitingBookings.length}
                </div>
                </div>

                {waitingBookings.length === 0 ? (
                <div className="mt-6 flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
                    <Clock3 className="h-7 w-7 text-slate-300" />

                    <p className="mt-3 font-semibold text-slate-700">
                    Queue is empty
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                    New customers will appear here.
                    </p>
                </div>
                ) : (
                <div className="mt-6 space-y-3">
                    {waitingBookings.map((booking) => (
                    <div
                        key={booking.id}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-start gap-4">

                            {/* Queue number */}
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                            #{booking.queue_position}
                            </div>

                            <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-slate-900">
                                {booking.grooming_services?.name}
                                </h3>
                            </div>

                            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                                <UserRound className="h-3.5 w-3.5" />

                                {booking.users?.name ||
                                booking.users?.roll_no ||
                                "Student"}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                                {booking.grooming_services?.duration_minutes} min
                                </span>

                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                                ₹{booking.grooming_services?.price}
                                </span>
                            </div>
                            </div>
                        </div>

                        <button
                            disabled={
                            actionLoading ||
                            Boolean(currentBooking) ||
                            staff?.status !== "AVAILABLE"
                            }
                            onClick={() => startService(booking.id)}
                            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Play className="h-4 w-4" />
                            Start Service
                        </button>

                        </div>
                    </div>
                    ))}
                </div>
                )}
            </section>
            </div>

            {/* =====================================================
                COMPLETED SERVICES
            ====================================================== */}
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_15px_45px_-30px_rgba(15,23,42,0.45)]">

            <div className="flex items-start justify-between">
                <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                    History
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                    Recent Services
                </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                </div>
            </div>

            {completedBookings.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                <p className="text-sm text-slate-400">
                    No completed services yet.
                </p>
                </div>
            ) : (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {completedBookings.map((booking) => (
                    <div
                    key={booking.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                    <div className="flex items-start justify-between gap-3">

                        <div>
                        <p className="font-black text-slate-900">
                            {booking.grooming_services?.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                            {booking.users?.name ||
                            booking.users?.roll_no ||
                            "Student"}
                        </p>

                        <p className="mt-2 text-xs font-medium text-slate-400">
                            {booking.grooming_services?.duration_minutes} min
                            {" • "}
                            ₹{booking.grooming_services?.price}
                        </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        </div>

                    </div>

                    <div className="mt-4">
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        COMPLETED
                        </span>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </section>

            {/* =====================================================
                REFRESH
            ====================================================== */}
            <div className="flex justify-center pb-4">
            <button
                onClick={loadDashboard}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-900"
            >
                <RefreshCw className="h-4 w-4" />
                Refresh Dashboard
            </button>
            </div>

        </div>
        </main>
    )
    }
