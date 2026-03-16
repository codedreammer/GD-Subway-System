import { Clock3, Flame } from "lucide-react";

const peakHoursData = [
  { time: "8-10 AM", orders: 45 },
  { time: "10-12 PM", orders: 78 },
  { time: "12-2 PM", orders: 156 },
  { time: "2-4 PM", orders: 92 },
  { time: "4-6 PM", orders: 68 },
  { time: "6-8 PM", orders: 124 },
];

export default function PeakHoursChart() {
  const maxOrders = Math.max(...peakHoursData.map((slot) => slot.orders));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
          <Clock3 className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">Peak Hours</h3>
          <p className="text-sm text-gray-500">Today's order distribution</p>
        </div>
      </div>

      <div className="space-y-5">
        {peakHoursData.map((slot) => {
          const isPeak = slot.orders >= 120;
          const widthPercentage = Math.max((slot.orders / maxOrders) * 100, 8);

          return (
            <div key={slot.time}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-lg font-medium text-gray-700">{slot.time}</p>
                <p className={`flex items-center gap-1 text-lg font-semibold ${isPeak ? "text-orange-600" : "text-gray-600"}`}>
                  {slot.orders} orders
                  {isPeak ? <Flame className="h-4 w-4" /> : null}
                </p>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full ${isPeak ? "bg-orange-500" : "bg-blue-500"}`}
                  style={{ width: `${widthPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
