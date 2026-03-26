import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import VendorsList from "@/features/admin/components/VendorsList";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const { data: vendors } = await supabaseAdmin
    .from("vendors")
    .select(
      `
      id,
      shop_name,
      is_online,
      users(email)
    `,
    )
    .order("shop_name", { ascending: true });

  const normalizedVendors =
    vendors?.map((vendor) => ({
      id: vendor.id,
      shop_name: vendor.shop_name,
      email: vendor.users?.email || "",
      is_online: vendor.is_online,
    })) || [];

  return (
    <div className="space-y-6">
      <section className="premium-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-700">Vendor operations</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Vendors</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          Monitor storefront health, owner access, and live availability from one cleaner list.
        </p>
      </section>

      <VendorsList initialVendors={normalizedVendors} />
    </div>
  );
}
