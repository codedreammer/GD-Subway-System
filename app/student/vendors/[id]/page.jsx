"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Info,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "../../CartContext";
import formatCurrency from "@/utils/formatCurrency";

function VendorMenuSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pb-52">
      <div className="rounded-b-[2.5rem] bg-gradient-to-br from-[#0f3d22] via-[#166534] to-[#22c55e] px-5 pb-16 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="skeleton h-11 w-11 rounded-2xl" />
          <div className="skeleton h-10 w-10 rounded-2xl" />
        </div>
        <div className="space-y-3">
          <div className="skeleton h-6 w-44 rounded-full" />
          <div className="skeleton h-4 w-28 rounded-full" />
          <div className="skeleton h-24 rounded-[2rem]" />
        </div>
      </div>
      <div className="-mt-7 space-y-4 px-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="premium-card p-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-3">
                <div className="skeleton h-5 w-36 rounded-full" />
                <div className="skeleton h-4 w-20 rounded-full" />
                <div className="skeleton h-3 w-full rounded-full" />
                <div className="skeleton h-3 w-3/4 rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="skeleton h-24 w-24 rounded-2xl" />
                <div className="skeleton h-10 w-24 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VendorItemsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, updateQuantity, cartItems, vendorId } = useCart();

  const [vendor, setVendor] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorAndItems = async () => {
      try {
        const { data: vendorData } = await supabase.from("vendors").select("*").eq("id", params.id).single();
        if (vendorData) setVendor(vendorData);

        const { data: itemsData } = await supabase.from("items").select("*").eq("vendor_id", params.id);
        if (itemsData) setItems(itemsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVendorAndItems();
    }
  }, [params.id]);

  const getCartQuantity = (itemId) => {
    if (vendorId !== params.id) return 0;
    const item = cartItems.find((entry) => entry.id === itemId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return <VendorMenuSkeleton />;
  }

  const cartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-56">
      <div className="sticky top-0 z-40 bg-slate-50/70 px-4 pt-4 backdrop-blur-xl">
        <div className="rounded-[2rem] bg-gradient-to-br from-[#0f3d22] via-[#166534] to-[#22c55e] px-5 pb-6 pt-4 text-white shadow-[0_24px_60px_-32px_rgba(22,101,52,0.85)]">
          <div className="mb-5 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="glass-panel flex h-11 w-11 items-center justify-center rounded-2xl transition hover:scale-105"
            >
              <ArrowLeft size={20} />
            </button>
            <button className="glass-panel flex h-11 w-11 items-center justify-center rounded-2xl transition hover:scale-105">
              <Info size={20} />
            </button>
          </div>

          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">Live kitchen</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight">{vendor?.shop_name}</h1>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-white/14 px-3 py-1 font-semibold">
                    <Clock3 className="mr-1 inline h-4 w-4" />
                    15-20 min pickup
                  </span>
                  <span className="rounded-full bg-white/14 px-3 py-1 font-semibold">
                    <Sparkles className="mr-1 inline h-4 w-4" />
                    Freshly prepared
                  </span>
                </div>
              </div>

              <div className="glass-panel flex h-16 w-16 items-center justify-center rounded-[1.5rem] text-3xl font-black">
                {vendor?.shop_name?.charAt(0) || "V"}
              </div>
            </div>

            <div className="glass-panel rounded-[1.75rem] p-4">
              <p className="text-sm text-emerald-100/90">
                Smooth campus pickup, clean pricing, and live cart updates while you browse.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 pt-5">
        {!items.length ? (
          <div className="premium-card p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <ShoppingBag className="h-9 w-9 text-slate-400" />
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-900">Menu is getting refreshed</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This vendor has no listed items right now. Check back in a bit for the next drop.
            </p>
          </div>
        ) : (
          items.map((item, index) => {
            const qty = getCartQuantity(item.id);

            return (
              <article key={item.id} className="premium-card overflow-hidden p-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-green-700">
                          Bestseller {index < 2 ? "pick" : "menu"}
                        </div>
                        <h3 className="mt-3 text-lg font-bold text-slate-900">{item.name}</h3>
                        <p className="mt-2 text-base font-semibold text-green-800">{formatCurrency(item.price)}</p>
                      </div>
                    </div>

                    {item.description ? (
                      <p className="mt-3 text-sm leading-6 text-slate-500">{item.description}</p>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        Freshly prepared for quick campus pickup.
                      </p>
                    )}
                  </div>

                  <div className="flex min-w-[108px] flex-col items-end justify-between gap-3">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-green-50 to-lime-100 text-3xl shadow-inner">
                      <span>{index % 2 === 0 ? "🥪" : "🥤"}</span>
                    </div>

                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(item, params.id)}
                        className="premium-button flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-2 py-2 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-green-800 transition hover:scale-105 hover:bg-green-100"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-green-900">{qty}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-green-800 transition hover:scale-105 hover:bg-green-100"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {cartItems.length > 0 && vendorId === params.id ? (
        <div className="fixed bottom-28 left-0 right-0 z-40 mx-auto w-full max-w-md px-4">
          <button
            onClick={() => router.push("/student/cart")}
            className="premium-button flex w-full items-center justify-between rounded-[1.75rem] px-5 py-4 text-left"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">{cartQuantity} items ready</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(cartTotal)}</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/16 px-4 py-3 text-sm font-semibold">
              View cart
              <ChevronRight size={18} />
            </div>
          </button>
        </div>
      ) : null}
    </div>
  );
}
