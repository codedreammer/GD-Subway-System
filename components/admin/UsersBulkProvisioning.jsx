"use client"

import { useState } from "react"
import Papa from "papaparse"

export default function UsersBulkProvisioning() {
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState(null)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        const cleanData = parsed.data.map((row) => ({
          roll_no: row.roll_no?.trim()
        }))

        setUploading(true)

        try {
          const res = await fetch("/api/admin/bulk-create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ students: cleanData })
          })

          const data = await res.json()
          setResults(data.results)
        } catch (err) {
          alert("Bulk provisioning failed")
        }

        setUploading(false)
      }
    })
  }

  return (
    <div className="bg-white shadow rounded-xl p-8 space-y-6">
      <h2 className="text-xl font-semibold">Bulk Student Provisioning</h2>

      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="border p-2 rounded"
        />

        {uploading && (
          <span className="text-blue-600 font-medium">Processing...</span>
        )}
      </div>

      {results && (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
          <h3 className="font-semibold mb-2">Provisioning Results</h3>
          {results.map((r, i) => (
            <div key={i} className="text-sm">
              {r.roll_no} -{" "}
              <span className={r.status === "success" ? "text-green-600" : "text-red-600"}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
