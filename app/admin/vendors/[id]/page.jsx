import { supabaseAdmin } from "@/lib/supabaseAdmin"
import ResetVendorPasswordButton from "@/components/admin/ResetVendorPasswordButton"
import AddItemModal from "@/components/admin/AddItemModal"
import ItemActions from "@/components/admin/ItemActions"

export default async function VendorDetail({ params }) {
  const { id } = params

  // Get vendor info
  const { data: vendor } = await supabaseAdmin
    .from("vendors")
    .select(`
      id,
      shop_name,
      is_online,
      user_id,
      users(name, email)
    `)
    .eq("id", id)
    .single()

  // Get items
  const { data: items } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("vendor_id", id)

  // Get active categories for add item modal
  const { data: categories } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true })

  // Get today's orders count
  const today = new Date().toISOString().split("T")[0]

  const { data: ordersToday } = await supabaseAdmin
    .from("orders")
    .select("id", { count: "exact" })
    .eq("vendor_id", id)
    .gte("created_at", today)

  if (!vendor) {
    return <div className="p-10">Vendor not found</div>
  }

  return (
    <div className="p-10 space-y-8">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">{vendor.shop_name}</h1>
          <p className="text-gray-500">{vendor.users?.email}</p>

          <div className="mt-3">
            <span className={`px-3 py-1 rounded-full text-sm ${vendor.is_online
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
              }`}>
              {vendor.is_online ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <ResetVendorPasswordButton userId={vendor.user_id} />
      </div>

      {/* ORDERS SUMMARY */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">Today's Performance</h2>
        <p className="text-3xl font-bold">
          {ordersToday?.length || 0} Orders Today
        </p>
      </div>

      {/* ITEMS SECTION */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Items</h2>
          <AddItemModal vendorId={vendor.id} categories={categories || []} />
        </div>

        {items?.length === 0 ? (
          <p className="text-gray-500">No items added yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div
                key={item.id}
                className="flex justify-between items-center border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">₹{item.price}</p>
                </div>

                <ItemActions item={item} />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
