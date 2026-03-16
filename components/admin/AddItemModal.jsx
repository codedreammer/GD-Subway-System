"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AddItemModal({ vendorId, categories = [] }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const hasCategories = categories.length > 0

  useEffect(() => {
    if (!categoryId && hasCategories) {
      setCategoryId(String(categories[0].id))
    }
  }, [categoryId, categories, hasCategories])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!hasCategories) {
      alert("No active categories found. Please create/activate a category first.")
      return
    }

    setLoading(true)

    const res = await fetch("/api/admin/add-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor_id: vendorId,
        name,
        price,
        category_id: categoryId
      })
    })

    const data = await res.json()

    setLoading(false)

    if (data.error) {
      alert(data.error)
      return
    }

    setOpen(false)
    setName("")
    setPrice("")
    setCategoryId(hasCategories ? String(categories[0].id) : "")
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg"
      >
        + Add Item
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">

            <h2 className="text-lg font-semibold">Add New Item</h2>

            <form onSubmit={handleSubmit} className="space-y-3">

              <input
                type="text"
                placeholder="Item Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />

              {hasCategories ? (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-red-600">
                  No active categories available. Add a category before creating items.
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || !hasCategories}
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                  {loading ? "Adding..." : "Add"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  )
}
