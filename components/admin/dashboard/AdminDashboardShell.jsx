"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/services/authService";
import { LogOut, Shield, AlertTriangle, ClipboardList, Home, Store, FileText } from "lucide-react";

const tabs = [
  { label: "Overview", href: "/admin", icon: Home },
  { label: "Vendors", href: "/admin/vendors", icon: Store },
  { label: "Bulk Students", href: "/admin/users", icon: () => <span className="text-base leading-none">👨‍🎓</span> },
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
    <section className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight text-gray-900">GD SUBWAY Admin</h1>
              <p className="text-sm text-gray-500">Campus Operations Monitor</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.href === "/admin" ? pathname === tab.href : pathname.startsWith(tab.href);

              if (tab.disabled) {
                return (
                  <span
                    key={tab.label}
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-t-lg border-b-2 border-transparent px-3 py-3 text-sm font-medium text-gray-400"
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
                  className={`inline-flex items-center gap-2 rounded-t-lg border-b-2 px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </section>
  );
}
