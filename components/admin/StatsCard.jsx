const colorClasses = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  orange: "bg-orange-50 text-orange-700",
  red: "bg-red-50 text-red-700",
  gray: "bg-gray-50 text-gray-700"
}

export default function StatsCard({
  title,
  label = "Stat",
  value = 0,
  color = "gray"
}) {
  const badgeClass = colorClasses[color] || colorClasses.gray
  const heading = title || label

  return (
    <article className="rounded-xl bg-white p-6 shadow">
      <p className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${badgeClass}`}>
        {heading}
      </p>
      <strong className="mt-3 block text-2xl font-bold text-gray-900">{value}</strong>
    </article>
  )
}
