"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CreditCard,
  History,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { getCurrentUser } from "@/features/auth/services/authService";
import formatCurrency from "@/utils/formatCurrency";

function WalletSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pb-44">
      <div className="rounded-b-[2.5rem] bg-gradient-to-r from-[#0f3d22] via-[#166534] to-[#22c55e] px-6 pb-20 pt-10">
        <div className="skeleton h-7 w-44 rounded-full" />
        <div className="mt-3 skeleton h-4 w-32 rounded-full" />
        <div className="mt-8 skeleton h-36 rounded-[2rem]" />
      </div>
      <div className="relative z-10 -mt-2 space-y-4 px-5">
        <div className="skeleton h-14 rounded-[1.4rem]" />
        <div className="premium-card p-5">
          <div className="space-y-3">
            <div className="skeleton h-5 w-40 rounded-full" />
            <div className="skeleton h-16 rounded-[1.4rem]" />
            <div className="skeleton h-16 rounded-[1.4rem]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GMoneyPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }

        const { data, error } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single();
        if (!error && data) {
          setBalance(data.balance);
        } else {
          console.error("Wallet error:", error);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [router]);

  if (loading) {
    return <WalletSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-44">
      <div className="relative overflow-hidden rounded-b-[2.75rem] bg-gradient-to-br from-[#0f3d22] via-[#166534] to-[#22c55e] px-6 pb-24 pt-10 text-white shadow-[0_24px_70px_-34px_rgba(22,101,52,0.95)]">
        <div className="absolute -right-8 top-8 rounded-full bg-white/10 p-6">
          <CreditCard className="h-16 w-16" />
        </div>
        <div className="absolute -left-6 bottom-6 rounded-full bg-white/8 p-5">
          <Wallet className="h-12 w-12" />
        </div>

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">Campus wallet</p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-black tracking-tight">
            <Wallet className="h-7 w-7" />
            gMoney
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-emerald-100/90">
            Your fast lane for smoother campus payments and checkout-ready balances.
          </p>

          <div className="glass-panel mt-8 rounded-[2rem] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-100">Available balance</p>
            <p className="mt-4 text-5xl font-black tracking-tight">{formatCurrency(balance || 0)}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
              <ShieldCheck className="h-4 w-4" />
              Secure wallet
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-3 space-y-5 px-5 pb-4">
        <button className="premium-button relative flex w-full items-center justify-center gap-3 px-5 py-4 text-sm font-semibold">
          <Zap className="h-5 w-5" />
          Add money securely
        </button>

        <section className="premium-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
              <History className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">History</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Recent activity</h2>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
              <Wallet className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">No wallet activity yet</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Top-ups and campus payments will appear here once you start using gMoney.
            </p>
          </div>

          <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-700">
            View all transactions
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </section>
      </div>
    </div>
  );
}
