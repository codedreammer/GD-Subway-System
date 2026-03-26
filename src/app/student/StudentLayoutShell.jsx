"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, ShoppingBag, Wallet, User, ShoppingCart } from "lucide-react";
import { CartProvider, useCart } from "./CartContext";

function BottomNav() {
  const pathname = usePathname();
  const { cartItems } = useCart();

  const navItems = [
    { label: "Explore", icon: Compass, href: "/student" },
    { label: "Orders", icon: ShoppingBag, href: "/student/orders" },
    { label: "Wallet", icon: Wallet, href: "/student/gmoney" },
    { label: "Profile", icon: User, href: "/student/profile" },
  ];

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const showFloatingCartShortcut =
    totalItems > 0 &&
    pathname !== "/student/cart" &&
    !pathname.startsWith("/student/vendors/");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-md px-4 pb-4">
      <div className="relative overflow-visible rounded-[2rem] border border-white/50 bg-white/80 px-2 py-3 shadow-[0_-12px_40px_-24px_rgba(15,23,42,0.4)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-green-300 to-transparent" />

        {showFloatingCartShortcut ? (
          <Link
            href="/student/cart"
            className="animate-gentle-bounce premium-button absolute -top-16 right-4 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold"
          >
            <ShoppingCart size={18} />
            Cart
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-green-800">
              {totalItems}
            </span>
          </Link>
        ) : null}

        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/student" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-all duration-300 ${
                  isActive ? "text-green-800" : "text-slate-500 hover:text-green-700"
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "scale-105 bg-gradient-to-br from-green-700 to-green-500 text-white shadow-[0_18px_35px_-18px_rgba(22,101,52,0.9)]"
                      : "bg-slate-100 text-slate-500 group-hover:scale-105 group-hover:bg-green-50 group-hover:text-green-700"
                  }`}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2.2} />
                </div>
                <span>{item.label}</span>
                {isActive ? (
                  <span className="absolute inset-x-4 -bottom-1 h-1 rounded-full bg-green-300/80 blur-sm" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LayoutContent({ children }) {
  return (
    <div className="app-shell relative pb-44">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-green-100/70 to-transparent" />
      <div className="pointer-events-none floating-orb -left-10 top-28 h-28 w-28 bg-emerald-300/60" />
      <div className="pointer-events-none floating-orb -right-8 top-44 h-24 w-24 bg-lime-200/80" />
      <div className="relative">{children}</div>
      <BottomNav />
    </div>
  );
}

export default function StudentLayoutShell({ children }) {
  return (
    <CartProvider>
      <LayoutContent>{children}</LayoutContent>
    </CartProvider>
  );
}
