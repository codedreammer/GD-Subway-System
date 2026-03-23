const colorClasses = {
  blue: "from-sky-100 to-blue-50 text-sky-700",
  green: "from-emerald-100 to-green-50 text-emerald-700",
  orange: "from-amber-100 to-yellow-50 text-amber-700",
  red: "from-rose-100 to-red-50 text-rose-700",
  gray: "from-slate-100 to-slate-50 text-slate-700",
};

export default function StatsCard({ title, label = "Stat", value = 0, color = "gray" }) {
  const heading = title || label;
  const theme = colorClasses[color] || colorClasses.gray;

  return (
    <article className="premium-card overflow-hidden p-5">
      <div className={`inline-flex rounded-full bg-gradient-to-br px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${theme}`}>
        {heading}
      </div>
      <strong className="mt-5 block text-4xl font-black tracking-tight text-slate-900">{value}</strong>
    </article>
  );
}
