// Shared helpers for the Calendar and Insights views

// Dates are handled as local "YYYY-MM-DD" keys. new Date('2026-04-28') parses
// as UTC midnight, which lands on the previous day in timezones west of UTC.
const pad2 = (n) => String(n).padStart(2, '0')

export function keyOf(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey() {
  return keyOf(new Date())
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

// Monday of the week containing `date` (weeks start on Monday)
export function mondayOf(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return addDays(d, -((d.getDay() + 6) % 7))
}

export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)

// Same deterministic logo color as JobCard / JobDrawer
export function logoStyle(company) {
  const hue = ((company || '?').charCodeAt(0) * 37) % 360
  return { background: `oklch(0.42 0.1 ${hue})` }
}

export const logoInitial = (company) => (company?.[0] ?? '?').toUpperCase()
