import { Circle, TrendingDown, TrendingUp } from "lucide-react";

const colorStyles = {
  blue: "from-sky-100 to-blue-50 text-sky-700",
  green: "from-emerald-100 to-green-50 text-emerald-700",
  orange: "from-amber-100 to-yellow-50 text-amber-700",
  red: "from-rose-100 to-red-50 text-rose-700",
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
    <article className="premium-card overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-gradient-to-br ${iconColor}`}>
          <Icon className="h-7 w-7" />
        </div>

        {trend ? (
          <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${trendUp ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {trend}
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <p className="text-4xl font-black leading-none tracking-tight text-slate-900">{value}</p>
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
        {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
    </article>
  );
}
