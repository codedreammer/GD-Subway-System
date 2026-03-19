export const formatOrderDate = (dateString) => {
  if (!dateString) return '-'

  const rawDate = String(dateString).trim()
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(rawDate)
  const normalizedDate = hasTimezone ? rawDate : `${rawDate}Z`
  const date = new Date(normalizedDate)

  if (Number.isNaN(date.getTime())) return '-'
  const now = new Date()

  const isToday =
    date.toDateString() === now.toDateString()

  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)

  const isYesterday =
    date.toDateString() === yesterday.toDateString()

  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (isToday) return `Today - ${time}`
  if (isYesterday) return `Yesterday - ${time}`

  return `${date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })} - ${time}`
}
