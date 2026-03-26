"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"

export default function useRealtimeDashboard({
  onOrderUpdate,
  onVendorUpdate
}) {

  useEffect(() => {

    const channel = supabase
      .channel("dashboard-monitor")

      // ORDERS EVENTS
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders"
        },
        (payload) => {
          onOrderUpdate(payload)
        }
      )

      // VENDOR EVENTS
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vendors"
        },
        (payload) => {
          onVendorUpdate(payload)
        }
      )

      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }, [])

}