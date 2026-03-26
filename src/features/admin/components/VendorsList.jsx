"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Store } from "lucide-react";
import { supabase } from "@/lib/supabase/supabaseClient";

export default function VendorsList({ initialVendors }) {
  const [vendors, setVendors] = useState(initialVendors || []);

  useEffect(() => {
    setVendors(initialVendors || []);
  }, [initialVendors]);

  useEffect(() => {
    const channel = supabase
      .channel("vendors-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "vendors",
        },
        (payload) => {
          setVendors((prev) =>
            prev.map((v) =>
              v.id === payload.new.id ? { ...v, ...payload.new } : v
            )
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div className="grid gap-4">
      {vendors?.map((vendor) => (
        <article key={vendor.id} className="premium-card p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-green-50 to-emerald-100 text-green-800 shadow-inner">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <Link href={`/admin/vendors/${vendor.id}`} className="group inline-flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-green-700">
                    {vendor.shop_name}
                  </h2>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-green-700" />
                </Link>
                <p className="mt-1 text-sm text-slate-500">{vendor.email}</p>
              </div>
            </div>

            <span
              className={`inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] ${
                vendor.is_online ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {vendor.is_online ? "Online" : "Offline"}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
