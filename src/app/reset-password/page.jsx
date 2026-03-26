"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/supabaseClient"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      return setError("Password must be at least 6 characters")
    }

    if (password !== confirm) {
      return setError("Passwords do not match")
    }

    // 1️⃣ Update Auth Password
    const { error: authError } = await supabase.auth.updateUser({
      password,
    })

    if (authError) {
      return setError("Password update failed")
    }

    // 2️⃣ Update is_first_login
    const { data: { user } } = await supabase.auth.getUser()

    await supabase
      .from('users')
      .update({ is_first_login: false })
      .eq('id', user.id)

    router.push('/student')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">
          Set New Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="password"
            placeholder="New Password"
            className="w-full px-4 py-3 rounded-full border focus:ring-2 focus:ring-green-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-3 rounded-full border focus:ring-2 focus:ring-green-600"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-green-700 text-white font-semibold"
          >
            Update Password
          </button>

        </form>
      </div>
    </div>
  )
}