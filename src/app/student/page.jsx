"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Clock3,
  Gamepad2,
  Scissors,
  Search,
  Shirt,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { getCurrentUser } from "@/features/auth/services/authService";

const categories = [
  { id: 1, name: "Food", icon: UtensilsCrossed, colors: "from-red-100 to-orange-100 text-red-600" },
  { id: 2, name: "Wardrobe", icon: Shirt, colors: "from-blue-100 to-cyan-100 text-blue-600" },
  { id: 3, name: "Grooming", icon: Scissors, colors: "from-amber-100 to-orange-100 text-amber-600" },
  { id: 4, name: "Play Zone", icon: Gamepad2, colors: "from-green-100 to-emerald-100 text-green-600" },
];

function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="rounded-b-[2.5rem] bg-gradient-to-br from-green-900 via-green-800 to-green-600 px-6 pb-20 pt-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="skeleton h-14 w-14 rounded-2xl" />
            <div className="space-y-2">
              <div className="skeleton h-3 w-24 rounded-full" />
              <div className="skeleton h-5 w-32 rounded-full" />
            </div>
          </div>
          <div className="skeleton h-9 w-24 rounded-full" />
        </div>
        <div className="skeleton h-32 rounded-[2rem]" />
      </div>

      <div className="-mt-8 space-y-6 px-5">
        <div className="premium-card p-4">
          <div className="skeleton h-12 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="skeleton h-5 w-36 rounded-full" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="skeleton h-16 rounded-2xl" />
                <div className="skeleton mx-auto h-3 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="skeleton h-5 w-40 rounded-full" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="premium-card p-4">
              <div className="flex gap-4">
                <div className="skeleton h-20 w-20 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-5 w-32 rounded-full" />
                  <div className="skeleton h-3 w-full rounded-full" />
                  <div className="skeleton h-3 w-28 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudentHome() {
  const router = useRouter();
  const [userMeta, setUserMeta] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      const { data: vendorData } = await supabase.from("vendors").select("*").eq("is_online", true);
      if (vendorData) setVendors(vendorData);
    } catch (err) {
      console.error("Vendor fetch Error:", err);
    }
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        if (!currentUser) {
          router.push("/auth/login");
          return;
        }

        const { data: userData } = await supabase
          .from("users")
          .select("name, roll_no")
          .eq("id", currentUser.id)
          .single();

        if (userData) setUserMeta(userData);

        await fetchVendors();
      } catch (err) {
        console.error("Home Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();

    const channel = supabase
      .channel("vendors-live")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "vendors" }, () => {
        fetchVendors();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="relative overflow-hidden rounded-b-[2.75rem] bg-gradient-to-br from-[#0f3d22] via-[#166534] to-[#22c55e] px-6 pb-24 pt-10 text-white shadow-[0_24px_70px_-34px_rgba(22,101,52,0.95)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.16),transparent_28%)]" />
        <div className="relative space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="glass-panel flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg">
                {userMeta?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-100/90">Welcome back</p>
                <h1 className="text-2xl font-bold tracking-tight">{userMeta?.name || "Student"}</h1>
              </div>
            </div>

            <div className="glass-panel rounded-full px-4 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-100">Roll No</p>
              <p className="mt-1 text-sm font-semibold">{userMeta?.roll_no || "Not available"}</p>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-emerald-100">Campus concierge</p>
                <p className="mt-2 text-2xl font-bold">Order in minutes, not queues.</p>
              </div>
              <Sparkles className="h-7 w-7 text-emerald-100" />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-xl font-bold">{vendors.length}</p>
                <p className="mt-1 text-xs text-emerald-100">Open now</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-xl font-bold">15m</p>
                <p className="mt-1 text-xs text-emerald-100">Avg pickup</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-xl font-bold">4.8</p>
                <p className="mt-1 text-xs text-emerald-100">Student love</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-9 space-y-7 px-5">
        <div className="premium-card p-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for food, shops or services"
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-700">Collections</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Quick picks for campus life</h2>
            </div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Curated
            </span>
          </div>

          <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="premium-card min-w-[88px] flex-1 p-3 text-center hover:-translate-y-1"
              >
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.colors}`}
                >
                  <cat.icon className="h-7 w-7" />
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-700">{cat.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-700">Open now</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Campus favorites</h2>
            </div>
            <span className="text-sm font-semibold text-green-700">Live updates</span>
          </div>

          <div className="grid gap-4">
            {vendors.length === 0 ? (
              <div className="premium-card p-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <Clock3 className="h-9 w-9 text-slate-400" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">No vendors online yet</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  The campus kitchens are taking a breather. Check back around your next meal break.
                </p>
              </div>
            ) : (
              vendors.map((vendor, index) => (
                <Link key={vendor.id} href={`/student/vendors/${vendor.id}`}>
                  <article className="premium-card group relative overflow-hidden p-4">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-700 via-green-500 to-lime-300" />
                    <div className="flex gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-green-50 to-emerald-100 text-3xl font-black text-green-800 shadow-inner">
                        {vendor.shop_name?.charAt(0)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-green-700">
                                {vendor.shop_name}
                              </h3>
                              <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-green-700">
                                Active
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                              Fast campus meals with fresh prep and smooth pickup.
                            </p>
                          </div>
                          <ArrowUpRight className="mt-1 h-5 w-5 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-green-700" />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                            15-20 min
                          </span>
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            <Star className="mr-1 inline h-3.5 w-3.5 fill-current" />
                            4.{8 + (index % 2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
