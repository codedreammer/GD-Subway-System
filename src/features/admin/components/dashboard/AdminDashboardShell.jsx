"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/features/auth/services/authService";
import { AlertTriangle, ClipboardList, FileText, Home, LogOut, Shield, Store, Users } from "lucide-react";

const tabs = [
  { label: "Overview", href: "/admin", icon: Home },
  { label: "Vendors", href: "/admin/vendors", icon: Store },
  { label: "Students", href: "/admin/users", icon: Users },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList, disabled: true },
  { label: "Emergency", href: "/admin/emergency", icon: AlertTriangle, disabled: true },
  { label: "Reports", href: "/admin/reports", icon: FileText, disabled: true },
  { label: "Security", href: "/admin/security", icon: Shield, disabled: true },
];

export default function AdminDashboardShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <section className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-slate-50/80 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0f3d22] via-[#166534] to-[#22c55e] p-5 text-white shadow-[0_24px_60px_-34px_rgba(22,101,52,0.9)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="glass-panel flex h-14 w-14 items-center justify-center rounded-[1.4rem] shadow-lg">
                  <Store className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">Operations command</p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight">GD Subway Admin</h1>
                  <p className="mt-1 text-sm text-emerald-100/90">Realtime campus orders, vendors, and student provisioning</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="glass-panel inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition hover:scale-[1.02]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>

            <nav className="hide-scrollbar mt-5 flex items-center gap-2 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.href === "/admin" ? pathname === tab.href : pathname.startsWith(tab.href);

                if (tab.disabled) {
                  return (
                    <span
                      key={tab.label}
                      className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-emerald-100/60"
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </span>
                  );
                }

                return (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-white text-green-800 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.6)]"
                        : "bg-white/10 text-emerald-100 hover:bg-white/16"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </section>
  );
}
