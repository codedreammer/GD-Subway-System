"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { syncUserRollNoFromEmail } from "@/features/auth/services/authService";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const cleanInput = identifier.trim();
    const isEmail = cleanInput.includes("@");
    const isRoll = /^\d{10}$/.test(cleanInput);

    if (!isEmail && !isRoll) {
      setError("Enter valid email or 10-digit roll number");
      setSubmitting(false);
      return;
    }

    let email = cleanInput.toLowerCase();

    if (isRoll) {
      const { data: student, error: studentError } = await supabase
        .from("users")
        .select("email")
        .eq("roll_no", cleanInput)
        .single();

      if (studentError || !student) {
        setError("Student not found");
        setSubmitting(false);
        return;
      }
      email = student.email;
    }

    const {
      data: { user },
      error: signInError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !user) {
      setError("Invalid credentials");
      setSubmitting(false);
      return;
    }

    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("role, is_first_login, roll_no")
      .eq("id", user.id)
      .single();

    if (dbError || !dbUser) {
      setError("User not provisioned by admin");
      setSubmitting(false);
      return;
    }

    await supabase
      .from("users")
      .update({
        last_login_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    try {
      dbUser.roll_no = await syncUserRollNoFromEmail({
        user,
        role: dbUser.role,
        existingRollNo: dbUser.roll_no,
      });
    } catch (rollSyncError) {
      await supabase.auth.signOut();
      setError(rollSyncError.message || "Failed to sync roll number");
      setSubmitting(false);
      return;
    }

    if (dbUser.is_first_login) {
      router.refresh();
      router.push("/reset-password");
      return;
    }

    if (dbUser.role === "admin") {
      router.refresh();
      router.push("/admin");
    } else if (dbUser.role === "vendor") {
      const { error: updateError } = await supabase
        .from("vendors")
        .update({ is_online: true })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Vendor status update failed:", updateError);
      }

      router.refresh();
      router.push("/vendor");
    } else if (dbUser.role === "student") {
      router.refresh();
      router.push("/student");
    } else {
      setError("Invalid user role");
      setSubmitting(false);
      return;
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="floating-orb -left-10 top-10 h-44 w-44 bg-green-200" />
      <div className="floating-orb -right-14 bottom-6 h-56 w-56 bg-emerald-300" />

      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/70 shadow-[0_40px_90px_-50px_rgba(15,23,42,0.55)] backdrop-blur-xl">
        <div className="grid min-h-180 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden bg-linear-to-br from-[#0f3d22] via-[#166534] to-[#22c55e] px-8 py-10 text-white sm:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_26%)]" />
            <div className="relative flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
                Startup-grade campus ordering
              </div>

              <div className="mt-12 space-y-5">
                <img src="/gla-logo.png" alt="GLA Logo" className="w-32 rounded-2xl bg-white/10 p-3" />
                <div>
                  <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                    Faster orders.
                    <br />
                    Cleaner campus pickup.
                  </h1>
                  <p className="mt-4 max-w-md text-sm leading-7 text-emerald-100/90 sm:text-base">
                    A polished ordering experience for students, vendors, and admin teams built around speed, clarity, and real-time visibility.
                  </p>
                </div>
              </div>

              <div className="mt-auto grid gap-3 pt-10 sm:grid-cols-3">
                <div className="glass-panel rounded-3xl p-4">
                  <p className="text-2xl font-bold">15m</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-emerald-100">Average pickup</p>
                </div>
                <div className="glass-panel rounded-3xl p-4">
                  <p className="text-2xl font-bold">Live</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-emerald-100">Order updates</p>
                </div>
                <div className="glass-panel rounded-3xl p-4">
                  <p className="text-2xl font-bold">Secure</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-emerald-100">Role-based access</p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center px-6 py-10 sm:px-8 lg:px-10">
            <div className="w-full">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-green-700">
                  Welcome back
                </div>
                <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Log in</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in with your campus email or roll number to continue.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Email or roll number</span>
                  <div className="premium-input flex items-center gap-3 px-4 py-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="example@gla.ac.in or 10-digit roll no"
                      className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
                  <div className="premium-input flex items-center gap-3 px-4 py-3">
                    <LockKeyhole className="h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </label>

                {error ? (
                  <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="premium-button flex w-full items-center justify-center gap-3 px-5 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Signing in..." : "Login"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                <ShieldCheck className="h-4 w-4 text-green-700" />
                Protected access for admin, vendor, and student roles
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
