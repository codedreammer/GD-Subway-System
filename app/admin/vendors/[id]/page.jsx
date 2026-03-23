import { BarChart3, Package2, Store } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ResetVendorPasswordButton from "@/components/admin/ResetVendorPasswordButton";
import AddItemModal from "@/components/admin/AddItemModal";
import ItemActions from "@/components/admin/ItemActions";
import formatCurrency from "@/utils/formatCurrency";

export default async function VendorDetail({ params }) {
  const { id } = params;

  const { data: vendor } = await supabaseAdmin
    .from("vendors")
    .select(
      `
      id,
      shop_name,
      is_online,
      user_id,
      users(name, email)
    `,
    )
    .eq("id", id)
    .single();

  const { data: items } = await supabaseAdmin.from("items").select("*").eq("vendor_id", id);

  const { data: categories } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const today = new Date().toISOString().split("T")[0];

  const { data: ordersToday } = await supabaseAdmin
    .from("orders")
    .select("id", { count: "exact" })
    .eq("vendor_id", id)
    .gte("created_at", today);

  if (!vendor) {
    return <div className="premium-card p-8 text-center">Vendor not found.</div>;
  }

  return (
    <div className="space-y-6">
      <section className="premium-card overflow-hidden p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-green-50 to-emerald-100 text-green-800 shadow-inner">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Vendor profile</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{vendor.shop_name}</h1>
              <p className="mt-1 text-sm text-slate-500">{vendor.users?.email}</p>
              <span
                className={`mt-4 inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] ${
                  vendor.is_online ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {vendor.is_online ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          <ResetVendorPasswordButton userId={vendor.user_id} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="premium-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
              <BarChart3 className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Today</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Performance</h2>
            </div>
          </div>
          <p className="mt-5 text-4xl font-black tracking-tight text-slate-900">{ordersToday?.length || 0}</p>
          <p className="mt-2 text-sm text-slate-500">Orders placed with this vendor today</p>
        </section>

        <section className="premium-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100">
              <Package2 className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Catalog</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Menu items</h2>
            </div>
          </div>
          <p className="mt-5 text-4xl font-black tracking-tight text-slate-900">{items?.length || 0}</p>
          <p className="mt-2 text-sm text-slate-500">Active menu items for ordering</p>
        </section>
      </div>

      <section className="premium-card p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Menu management</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Items</h2>
          </div>
          <AddItemModal vendorId={vendor.id} categories={categories || []} />
        </div>

        {items?.length === 0 ? (
          <div className="rounded-[1.6rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-500">
            No items added yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm font-semibold text-green-700">{formatCurrency(item.price)}</p>
                  </div>
                  <ItemActions item={item} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
