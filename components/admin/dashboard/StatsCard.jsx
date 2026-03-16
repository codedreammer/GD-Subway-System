import { TrendingDown, TrendingUp, Circle } from "lucide-react";

const colorStyles = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600",
  red: "bg-red-100 text-red-600",
};

export default function StatsCard({
  title,
  value,
  subtitle,
  trend,
  trendUp = true,
  color = "blue",
  icon: Icon = Circle,
}) {
  const iconColor = colorStyles[color] || colorStyles.blue;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconColor}`}>
          <Icon className="h-7 w-7" />
        </div>

        {trend ? (
          <div className={`flex items-center gap-1 text-sm font-semibold ${trendUp ? "text-green-600" : "text-red-600"}`}>
            {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{trend}</span>
          </div>
        ) : null}
      </div>

      <p className="text-4xl font-bold leading-none text-gray-900">{value}</p>
      <p className="mt-3 text-2xl leading-tight text-gray-700">{title}</p>
      {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
    </div>
  );
}
