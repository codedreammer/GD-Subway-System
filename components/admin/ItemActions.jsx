"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ItemActions({ item }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(item.name)
  const [price, setPrice] = useState(item.price)

  async function handleDelete() {
    if (!confirm("Delete this item?")) return

    await fetch("/api/admin/delete-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: item.id })
    })

    router.refresh()
  }

  async function handleUpdate(e) {
    e.preventDefault()

    await fetch("/api/admin/update-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: item.id,
        name,
        price
      })
    })

    setEditing(false)
    router.refresh()
  }

  if (editing) {
    return (
      <form onSubmit={handleUpdate} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-1 rounded"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          className="border p-1 rounded w-24"
        />
        <button className="text-green-600">Save</button>
        <button type="button" onClick={() => setEditing(false)}>
          Cancel
        </button>
      </form>
    )
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => setEditing(true)}
        className="text-blue-600"
      >
        Edit
      </button>

      <button
        onClick={handleDelete}
        className="text-red-600"
      >
        Delete
      </button>
    </div>
  )
}