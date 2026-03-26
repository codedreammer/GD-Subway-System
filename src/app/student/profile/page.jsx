"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  FileText,
  HelpCircle,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { getCurrentUser, signOut } from "@/features/auth/services/authService";

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="rounded-b-[2.5rem] bg-gradient-to-r from-[#0f3d22] via-[#166534] to-[#22c55e] px-6 pb-20 pt-10">
        <div className="mx-auto skeleton h-28 w-28 rounded-full" />
        <div className="mx-auto mt-5 skeleton h-6 w-44 rounded-full" />
        <div className="mx-auto mt-3 skeleton h-4 w-28 rounded-full" />
      </div>
      <div className="-mt-8 space-y-4 px-5">
        <div className="premium-card p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="skeleton h-20 rounded-[1.4rem]" />
            <div className="skeleton h-20 rounded-[1.4rem]" />
          </div>
        </div>
        <div className="premium-card p-5">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-16 rounded-[1.4rem]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionRow({ icon: Icon, label, meta, iconClassName, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[1.4rem] px-4 py-4 text-left transition-all duration-300 hover:shadow-md ${
        danger ? "hover:bg-red-50" : "hover:bg-slate-50"
      }`}
      type="button"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className={`font-semibold ${danger ? "text-red-600" : "text-slate-900"}`}>{label}</p>
          {meta ? <p className="mt-1 text-xs text-slate-500">{meta}</p> : null}
        </div>
      </div>
      {!danger ? <ChevronRight className="h-5 w-5 text-slate-300" /> : null}
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userMeta, setUserMeta] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        if (!currentUser) {
          router.push("/auth/login");
          return;
        }
        setUser(currentUser);

        const { data } = await supabase.from("users").select("*").eq("id", currentUser.id).single();
        if (data) setUserMeta(data);

        const { count } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("student_id", currentUser.id);

        if (count !== null) setOrdersCount(count);
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="relative overflow-hidden rounded-b-[2.75rem] bg-gradient-to-r from-[#0f3d22] via-[#166534] to-[#22c55e] px-6 pb-24 pt-10 text-white shadow-[0_24px_70px_-34px_rgba(22,101,52,0.95)]">
        <button className="glass-panel absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-2xl transition hover:scale-105">
          <Settings className="h-5 w-5" />
        </button>

        <div className="relative text-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white/30 bg-white/15 text-4xl font-black shadow-[0_24px_60px_-24px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            {userMeta?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight">{userMeta?.name || "Student"}</h1>
          <p className="mt-2 text-sm font-medium text-emerald-100">Campus food profile</p>
          <div className="mt-4 inline-flex rounded-full bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
            Roll no {userMeta?.roll_number || "--"}
          </div>
        </div>
      </div>

      <div className="-mt-10 space-y-5 px-5">
        <section className="premium-card p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.4rem] bg-gradient-to-br from-green-50 to-emerald-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Orders</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{ordersCount}</p>
              <p className="mt-1 text-sm text-slate-600">Placed so far</p>
            </div>
            <div className="rounded-[1.4rem] bg-gradient-to-br from-slate-100 to-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Member since</p>
              <p className="mt-3 text-3xl font-black text-slate-900">
                {userMeta?.created_at ? new Date(userMeta.created_at).getFullYear() : new Date().getFullYear()}
              </p>
              <p className="mt-1 text-sm text-slate-600">Student account</p>
            </div>
          </div>
        </section>

        <section className="premium-card p-3">
          <ActionRow
            icon={Mail}
            label={user?.email || "Email"}
            meta="Account email"
            iconClassName="bg-green-100 text-green-700"
          />
          <ActionRow
            icon={UserRound}
            label={userMeta?.roll_number || "--"}
            meta="Roll number"
            iconClassName="bg-blue-100 text-blue-700"
          />
          <ActionRow
            icon={ShieldCheck}
            label="Campus verified"
            meta="Your profile is active and ready for orders"
            iconClassName="bg-emerald-100 text-emerald-700"
          />
        </section>

        <section className="premium-card p-3">
          <ActionRow
            icon={HelpCircle}
            label="Help and support"
            meta="Get help with orders and pickups"
            iconClassName="bg-violet-100 text-violet-700"
          />
          <ActionRow
            icon={FileText}
            label="FAQs"
            meta="Quick answers for common questions"
            iconClassName="bg-amber-100 text-amber-700"
          />
          <ActionRow
            icon={LogOut}
            label="Logout"
            meta="Sign out from this device"
            iconClassName="bg-red-100 text-red-600"
            danger
            onClick={handleLogout}
          />
        </section>
      </div>
    </div>
  );
}
