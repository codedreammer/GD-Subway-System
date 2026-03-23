import Link from "next/link";
import { ArrowUpRight, Store } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function VendorsPage() {
  const { data: vendors } = await supabaseAdmin
    .from("vendors")
    .select(
      `
      id,
      shop_name,
      is_online,
      users(name, email)
    `,
    )
    .order("shop_name", { ascending: true });

  return (
    <div className="space-y-6">
      <section className="premium-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-700">Vendor operations</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Vendors</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          Monitor storefront health, owner access, and live availability from one cleaner list.
        </p>
      </section>

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
                  <p className="mt-1 text-sm text-slate-500">{vendor.users?.email}</p>
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
    </div>
  );
}
