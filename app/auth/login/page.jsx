"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "@/services/authService"

export default function LoginPage() {
  const [mode, setMode] = useState("roll") // roll or email
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    let email = identifier

    if (mode === "roll") {
      if (!/^\d{10}$/.test(identifier)) {
        return setError("Enter valid 10-digit roll number")
      }
      email = `${identifier}@gla.ac.in`
    }

    const { error } = await signIn(email, password)

    if (error) {
      return setError("Invalid credentials")
    }

    router.push("/student")
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden h-[100dvh] sm:h-[95vh] sm:max-h-[860px] flex flex-col">
        <div className="relative bg-green-700 h-[42%] min-h-[300px] max-h-[430px] rounded-b-[56px] sm:rounded-b-[72px] flex flex-col justify-center items-center text-white px-4">
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

          {/* Toggle */}
          <div className="flex bg-gray-200 rounded-full mb-6 overflow-hidden h-12 sm:h-14">
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                mode === "roll" ? "bg-green-700 text-white" : "text-gray-600"
              }`}
              onClick={() => setMode("roll")}
            >
              Roll No
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                mode === "email" ? "bg-green-700 text-white" : "text-gray-600"
              }`}
              onClick={() => setMode("email")}
            >
              Email
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 flex-1 flex flex-col">
            <input
              type="text"
              placeholder={mode === "roll" ? "Enter Roll Number" : "Enter College Email"}
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
              className="w-full h-[64px] sm:h-[71px] rounded-full bg-gradient-to-r from-green-800 to-green-600 text-white text-xl sm:text-2xl font-semibold shadow-md hover:opacity-90 transition mt-auto"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
