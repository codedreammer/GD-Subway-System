export default function OrderQueueMonitor({ orders }) {

  return (
    <div className="bg-white border rounded-xl p-6">

      <h3 className="font-semibold mb-4">
        Live Order Queue
      </h3>

      <div className="space-y-3">

        {orders.map(order => (
          <div
            key={order.id}
            className="flex justify-between p-3 border rounded-lg"
          >

            <span>#{order.order_code}</span>

            <span className="text-sm text-orange-600">
              {order.status}
            </span>

          </div>
        ))}

      </div>

    </div>
  )
}