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
    <section className="premium-card p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-amber-100 to-yellow-50">
          <Clock3 className="h-6 w-6 text-amber-700" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Performance</p>
          <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Peak hours</h3>
        </div>
      </div>

      <div className="space-y-5">
        {peakHoursData.map((slot) => {
          const isPeak = slot.orders >= 120;
          const widthPercentage = Math.max((slot.orders / maxOrders) * 100, 8);

          return (
            <div key={slot.time}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">{slot.time}</p>
                <p className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${isPeak ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                  {slot.orders} orders
                  {isPeak ? <Flame className="h-4 w-4" /> : null}
                </p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${isPeak ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-green-700 to-green-500"}`}
                  style={{ width: `${widthPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
