"use client"
import { useState } from "react"

export default function AddVendorModal({ onClose }) {
  const [shopName, setShopName] = useState("")
  const [email, setEmail] = useState("")
  const [generatedPassword, setGeneratedPassword] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)

    const res = await fetch("/api/admin/create-vendor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop_name: shopName,
        email,
        category_id: null
      })
    })

    const data = await res.json()
    setLoading(false)

    if (data.error) {
      alert(data.error)
      return
    }

    setGeneratedPassword(data.password)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl w-[400px] space-y-4">

        {!generatedPassword ? (
          <>
            <h2 className="text-xl font-bold">Create Vendor</h2>

            <input
              placeholder="Shop Name"
              className="border p-2 w-full rounded"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />

            <input
              placeholder="Vendor Email"
              className="border p-2 w-full rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-purple-600 text-white w-full py-2 rounded-lg"
            >
              {loading ? "Creating..." : "Create Vendor"}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-green-600">
              Vendor Created Successfully
            </h2>

            <p className="text-sm text-gray-600">
              Share this password with vendor (shown only once):
            </p>

            <div className="bg-gray-100 p-3 rounded font-mono">
              {generatedPassword}
            </div>

            <button
              onClick={onClose}
              className="bg-purple-600 text-white w-full py-2 rounded-lg"
            >
              Close
            </button>
          </>
        )}

      </div>
    </div>
  )
}