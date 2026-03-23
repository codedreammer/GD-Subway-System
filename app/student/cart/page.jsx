"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Minus,
  Plus,
  Receipt,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useCart } from "../CartContext";
import { getCurrentUser } from "@/services/authService";
import formatCurrency from "@/utils/formatCurrency";

function CartSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pb-52">
      <div className="px-4 pt-4">
        <div className="premium-card rounded-[2rem] bg-gradient-to-r from-[#0f3d22] via-[#166534] to-[#22c55e] p-5 text-white">
          <div className="mb-5 flex items-center gap-3">
            <div className="skeleton h-10 w-10 rounded-2xl" />
            <div className="skeleton h-5 w-28 rounded-full" />
          </div>
          <div className="skeleton h-20 rounded-[1.6rem]" />
        </div>
      </div>
      <div className="space-y-4 px-5 pt-5">
        <div className="premium-card p-4">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="skeleton h-12 w-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32 rounded-full" />
                  <div className="skeleton h-3 w-20 rounded-full" />
                </div>
                <div className="skeleton h-10 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
        <div className="premium-card p-4">
          <div className="space-y-3">
            <div className="skeleton h-4 w-32 rounded-full" />
            <div className="skeleton h-4 w-full rounded-full" />
            <div className="skeleton h-4 w-full rounded-full" />
            <div className="skeleton h-6 w-36 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { cartItems, vendorId, updateQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { user: currentUser } = await getCurrentUser();
      if (currentUser) setUser(currentUser);
      else router.push("/auth/login");
      setUserLoading(false);
    };
    fetchUser();
  }, [router]);

  const itemsTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxes = Math.round(itemsTotal * 0.05);
  const grandTotal = itemsTotal + taxes;

  const handlePlaceOrder = async () => {
    if (!user || cartItems.length === 0 || !vendorId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user.id,
          vendor_id: vendorId,
          items: cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      setSuccess(true);
      clearCart();
      setTimeout(() => {
        router.push(`/student/orders/${data.order.id}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return <CartSkeleton />;
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="premium-card w-full max-w-sm p-8 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-700" />
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900">Order placed</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your order is in the queue. We&apos;re taking you to live tracking now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-56">
      <div className="sticky top-0 z-40 bg-slate-50/70 px-4 pt-4 backdrop-blur-xl">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0f3d22] via-[#166534] to-[#22c55e] px-5 pb-6 pt-4 text-white shadow-[0_24px_60px_-34px_rgba(22,101,52,0.88)]">
          <div className="mb-5 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="glass-panel flex h-11 w-11 items-center justify-center rounded-2xl transition hover:scale-105"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">Ready to checkout</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight">Your Cart</h1>
            </div>
          </div>
          <div className="glass-panel rounded-[1.75rem] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-100">Total payable</p>
                <p className="mt-1 text-3xl font-bold">{formatCurrency(grandTotal)}</p>
              </div>
              <div className="rounded-2xl bg-white/14 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Items</p>
                <p className="mt-1 text-lg font-semibold">{cartItems.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 pt-5">
        {cartItems.length === 0 ? (
          <div className="premium-card px-8 py-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <ShoppingBag className="h-9 w-9 text-slate-400" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-900">Cart is empty</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Start exploring campus vendors and build your next order.
            </p>
            <button
              onClick={() => router.push("/student")}
              className="premium-button mt-6 px-6 py-3 text-sm font-semibold"
            >
              Explore vendors
            </button>
          </div>
        ) : (
          <>
            <section className="premium-card p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Order details</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">Review your items</h2>
                </div>
                <button
                  onClick={() => router.push(`/student/vendors/${vendorId}`)}
                  className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                >
                  Add more
                </button>
              </div>

              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-[1.4rem] border border-slate-100 bg-slate-50 p-4 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">
                        {index % 2 === 0 ? "🍽" : "🥤"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{formatCurrency(item.price)} each</p>
                      </div>
                      <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
                        <p className="text-xs font-medium text-slate-400">Total</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-white px-2 py-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-800 transition hover:scale-105"
                        >
                          {item.quantity === 1 ? <Trash2 size={16} className="text-red-500" /> : <Minus size={16} />}
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-800 transition hover:scale-105"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="premium-card p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
                  <Receipt className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Bill summary</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">Pricing breakdown</h2>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Item total</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(itemsTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Taxes and charges</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(taxes)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Platform fee</span>
                  <span className="font-semibold text-green-700">Free</span>
                </div>
                <div className="mt-4 rounded-[1.4rem] bg-gradient-to-r from-green-900 to-green-600 px-4 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-100">Grand total</span>
                    <span className="text-2xl font-bold">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="premium-card p-4">
              <p className="text-sm leading-6 text-slate-600">
                Pickup is quick and easy. Head to the vendor desk once your order status changes to ready.
              </p>
            </section>
          </>
        )}
      </div>

      {cartItems.length > 0 ? (
        <div className="fixed bottom-28 left-0 right-0 z-40 mx-auto w-full max-w-md px-4">
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="premium-button flex w-full items-center justify-between rounded-[1.75rem] px-5 py-4 text-left disabled:cursor-not-allowed disabled:opacity-70"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">Cash or UPI at counter</p>
              <p className="mt-1 text-lg font-bold">{loading ? "Placing your order..." : "Place order"}</p>
            </div>
            <div className="rounded-2xl bg-white/16 px-4 py-3 text-sm font-semibold">
              {formatCurrency(grandTotal)}
            </div>
          </button>
        </div>
      ) : null}
    </div>
  );
}
