"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import StatsCard from "@/components/admin/StatsCard"

export default function UserDashboard({
  totalStudents,
  firstLoginPending,
  suspended
}) {
  const [total, setTotal] = useState(totalStudents ?? 0)
  const [pending, setPending] = useState(firstLoginPending ?? 0)
  const [suspend, setSuspend] = useState(suspended ?? 0)

  useEffect(() => {
    const channel = supabase
      .channel("users-monitor")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users"
        },
        (payload) => {
          if (payload.eventType === "INSERT" && payload.new?.role === "student") {
            setTotal((prev) => prev + 1)

            if (payload.new?.is_first_login) {
              setPending((prev) => prev + 1)
            }

            if (payload.new?.is_active === false) {
              setSuspend((prev) => prev + 1)
            }
          }

          if (payload.eventType === "UPDATE" && payload.new?.role === "student") {
            const oldRow = payload.old || {}
            const newRow = payload.new || {}

            if (oldRow.is_first_login !== newRow.is_first_login) {
              setPending((prev) => prev + (newRow.is_first_login ? 1 : -1))
            }

            if (oldRow.is_active !== newRow.is_active) {
              setSuspend((prev) => prev + (newRow.is_active === false ? 1 : -1))
            }
          }

          if (payload.eventType === "DELETE" && payload.old?.role === "student") {
            setTotal((prev) => Math.max(0, prev - 1))

            if (payload.old?.is_first_login) {
              setPending((prev) => Math.max(0, prev - 1))
            }

            if (payload.old?.is_active === false) {
              setSuspend((prev) => Math.max(0, prev - 1))
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <StatsCard title="Total Students" value={total} color="blue" />
      <StatsCard title="Active Today" value="--" color="green" />
      <StatsCard title="First Login Pending" value={pending} color="orange" />
      <StatsCard title="Suspended" value={suspend} color="red" />
    </div>
  )
}
