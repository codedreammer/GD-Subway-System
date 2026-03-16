"use client"

import { useState } from "react"
import useRealtimeDashboard from "@/hooks/useRealtimeDashboard"

export default function ActivityFeed() {

  const [activities, setActivities] = useState([])

  useRealtimeDashboard({

    onOrderUpdate: (payload) => {

      const order = payload.new

      const activity = {
        id: order.id,
        text: `Order #${order.order_code} ${order.status}`,
        time: new Date().toLocaleTimeString()
      }

      setActivities((prev) => [activity, ...prev].slice(0, 10))
    },

    onVendorUpdate: (payload) => {

      const vendor = payload.new

      const activity = {
        id: vendor.id,
        text: `Vendor ${vendor.shop_name} ${
          vendor.is_online ? "went Online" : "went Offline"
        }`,
        time: new Date().toLocaleTimeString()
      }

      setActivities((prev) => [activity, ...prev].slice(0, 10))
    }

  })

  return (
    <div className="space-y-3 max-h-[320px] overflow-y-auto">

      {activities.map((activity) => (
        <div key={activity.id} className="p-3 rounded-lg border bg-gray-50">

          <p className="text-sm">{activity.text}</p>

          <span className="text-xs text-gray-500">
            {activity.time}
          </span>

        </div>
      ))}

    </div>
  )
}
