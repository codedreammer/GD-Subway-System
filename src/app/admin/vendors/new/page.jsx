import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import AddVendorForm from "./AddVendorForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewVendorPage() {
  const { data: categories } = await supabaseAdmin
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  const activeCategories = categories || [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="mb-6 flex items-center justify-between">
        <div className="premium-card p-6 w-full">
          <Link
            href="/admin/vendors"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Vendors
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-700">Vendor onboarding</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Add New Vendor</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Create and onboard a new vendor account with shop access.
          </p>
        </div>
      </section>

      <div className="premium-card overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <AddVendorForm categories={activeCategories} />
        </div>
      </div>
    </div>
  );
}
