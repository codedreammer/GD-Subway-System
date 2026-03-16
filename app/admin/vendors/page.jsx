import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export default async function VendorsPage() {

  const { data: vendors } = await supabaseAdmin
    .from("vendors")
    .select(`
      id,
      shop_name,
      is_online,
      users(name, email)
    `)
    .order("shop_name", { ascending: true })

  return (
    <div className="p-10">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Vendors</h1>
      </div>

      <div className="space-y-4">
        {vendors?.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white p-6 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <Link href={`/admin/vendors/${vendor.id}`}>
                <h2 className="text-lg font-semibold hover:text-purple-600 cursor-pointer">
                  {vendor.shop_name}
                </h2>
              </Link>

              <p className="text-sm text-gray-500">
                {vendor.users?.email}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-sm ${
                vendor.is_online
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {vendor.is_online ? "Online" : "Offline"}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}
