const data = [
  { time: "8-10 AM", orders: 45 },
  { time: "10-12 PM", orders: 78 },
  { time: "12-2 PM", orders: 156 },
  { time: "2-4 PM", orders: 92 },
  { time: "4-6 PM", orders: 68 },
];

export default function PeakHoursChart() {
  const max = Math.max(...data.map((d) => d.orders));

  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="font-semibold mb-4">Peak Hours</h3>

      <div className="space-y-4">
        {data.map((slot) => {
          const width = (slot.orders / max) * 100;

          return (
            <div key={slot.time}>
              <div className="flex justify-between text-sm mb-1">
                <span>{slot.time}</span>
                <span>{slot.orders} orders</span>
              </div>

              <div className="bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}