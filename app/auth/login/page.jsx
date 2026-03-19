"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "@/services/authService"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    const cleanInput = identifier.trim()
    const isEmail = cleanInput.includes("@")
    const isRoll = /^\d{10}$/.test(cleanInput)

    if (!isEmail && !isRoll) {
      setError("Enter valid email or 10-digit roll number")
      return
    }

    let email = cleanInput.toLowerCase()

    if (isRoll) {
      const { data: student, error: studentError } = await supabase
        .from("users")
        .select("email")
        .eq("roll_no", cleanInput)
        .single()

      if (studentError || !student) {
        setError("Student not found")
        return
      }
      email = student.email
    }

    const { data: { user }, error: signInError } = await signIn(email, password)

    if (signInError || !user) {
      setError("Invalid credentials")
      return
    }

    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("role, is_first_login")
      .eq("id", user.id)
      .single()

    if (dbError || !dbUser) {
      setError("User not provisioned by admin")
      return
    }

    await supabase
      .from("users")
      .update({
        last_login_at: new Date().toISOString()
      })
      .eq("id", user.id)

    if (dbUser.is_first_login) {
      router.push("/reset-password")
      return
    }

    if (dbUser.role === "admin") router.push("/admin")
    else if (dbUser.role === "vendor") router.push("/vendor")
    else if (dbUser.role === "student") router.push("/student")
    else {
      setError("Invalid user role")
      return
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-linear-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden h-dvh sm:h-[95vh] sm:max-h-215 flex flex-col">
        <div className="relative bg-green-700 h-[42%] min-h-75 max-h-107.5 rounded-b-[56px] sm:rounded-b-[72px] flex flex-col justify-center items-center text-white px-4">
          <img src="/gla-logo.png" alt="GLA Logo" className="w-36 sm:w-44 mb-6" />
          <h1
            className="text-center text-[32px] sm:text-[36px] leading-[140%] sm:leading-[150%] font-normal text-white"
            style={{ fontFamily: "'Inknut Antiqua', serif" }}
          >
            GLA UNIVERSITY
            <br />
            MATHURA
          </h1>
        </div>

        <div className="flex-1 px-6 pt-6 pb-6 flex flex-col overflow-hidden">
          <h2 className="text-[38px] sm:text-[52px] leading-none font-semibold mb-6 text-green-950">Welcome Back!</h2>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 flex-1 flex flex-col">
            <input
              type="text"
              placeholder="Enter email or roll number"
              className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Enter Password"
              className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full h-16 sm:h-17.75 rounded-full bg-linear-to-r from-green-800 to-green-600 text-white text-xl sm:text-2xl font-semibold shadow-md hover:opacity-90 transition mt-auto"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
