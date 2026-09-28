import { Fragment, useMemo, useState } from 'react'
import './views.css'
import { keyOf, parseKey, todayKey, addDays, logoStyle, logoInitial } from './viewHelpers'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const EV_COLORS = {
  interview: 'var(--c-interview)',
  followup:  'var(--c-applied)',
  applied:   'var(--text-3)',
}
const EV_ORDER = { interview: 0, followup: 1, applied: 2 }

const Chev = ({ dir }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {dir === 'l' ? <path d="m15 6-6 6 6 6"/> : <path d="m9 6 6 6-6 6"/>}
  </svg>
)

// Events from interviews (scheduled_date), contact follow-ups (follow_up_date)
// and applied dates. Anything without a date is skipped.
function buildEvents(jobs, contacts, interviews) {
  const jobById = new Map(jobs.map(j => [j.id, j]))
  const evs = []

  for (const job of jobs) {
    if (job.status !== 'Wishlist' && job.date_applied) {
      evs.push({ date: job.date_applied, type: 'applied', job, label: `Applied · ${job.company}` })
    }
  }
  for (const iv of interviews) {
    const job = jobById.get(iv.job_id)
    if (!job || !iv.scheduled_date) continue
    evs.push({ date: iv.scheduled_date, type: 'interview', job, label: `${iv.round} · ${job.company}`, detail: iv.round })
  }
  for (const c of contacts) {
    const job = jobById.get(c.job_id)
    if (!job || !c.follow_up_date) continue
    evs.push({ date: c.follow_up_date, type: 'followup', job, label: `Follow up · ${c.name}`, detail: `Follow up with ${c.name}` })
  }

  return evs.sort((a, b) => a.date.localeCompare(b.date) || EV_ORDER[a.type] - EV_ORDER[b.type])
}

// Keyboard support for the span-based controls the design uses
function activateOnKey(fn) {
  return e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn() } }
}

export default function CalendarView({ jobs, contacts, interviews, onOpen }) {
  const today = todayKey()
  const now = parseKey(today)
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })

  const events = useMemo(() => buildEvents(jobs, contacts, interviews), [jobs, contacts, interviews])
  const byDay = useMemo(() => {
    const m = {}
    for (const e of events) (m[e.date] ||= []).push(e)
    return m
  }, [events])

  // Monday-first grid with as many rows as the month needs
  const first = new Date(ym.y, ym.m, 1)
  const offset = (first.getDay() + 6) % 7
  const daysIn = new Date(ym.y, ym.m + 1, 0).getDate()
  const rows = Math.ceil((offset + daysIn) / 7)
  const cells = Array.from({ length: rows * 7 }, (_, i) => {
    const dt = new Date(ym.y, ym.m, i - offset + 1)
    return { key: keyOf(dt), d: dt.getDate(), out: dt.getMonth() !== ym.m }
  })

  const shift = (n) => setYm(({ y, m }) => {
    const d = new Date(y, m + n, 1)
    return { y: d.getFullYear(), m: d.getMonth() }
  })
  const goToday = () => setYm({ y: now.getFullYear(), m: now.getMonth() })

  // Upcoming: interviews and follow-ups from today through today + 14, grouped by day
  const endKey = keyOf(addDays(now, 14))
  const groups = []
  for (const e of events) {
    if (e.type === 'applied' || e.date < today || e.date > endKey) continue
    const g = groups[groups.length - 1]
    if (g && g.date === e.date) g.items.push(e)
    else groups.push({ date: e.date, items: [e] })
  }

  const dayLabel = (k) => {
    if (k === today) return 'Today'
    if (k === keyOf(addDays(now, 1))) return 'Tomorrow'
    return parseKey(k).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="view">
      <div className="view-hd">
        <div className="view-title">{MONTHS[ym.m]} {ym.y}</div>
        <div className="seg">
          <span role="button" tabIndex={0} aria-label="Previous month"
            onClick={() => shift(-1)} onKeyDown={activateOnKey(() => shift(-1))}><Chev dir="l"/></span>
          <span role="button" tabIndex={0} aria-label="Next month"
            onClick={() => shift(1)} onKeyDown={activateOnKey(() => shift(1))}><Chev dir="r"/></span>
        </div>
        <button className="btn" style={{ height: 26 }} onClick={goToday}>Today</button>
        <div className="cal-legend">
          <span className="legend"><span className="stat-dot" style={{ background: EV_COLORS.interview }}/>Interview</span>
          <span className="legend"><span className="stat-dot" style={{ background: EV_COLORS.followup }}/>Follow-up</span>
          <span className="legend"><span className="stat-dot" style={{ background: EV_COLORS.applied }}/>Applied</span>
        </div>
      </div>

      <div className="cal-layout">
        <div className="cal">
          <div className="cal-dow">{DOW.map(d => <div key={d}>{d}</div>)}</div>
          <div className="cal-grid">
            {cells.map(c => {
              const evs = byDay[c.key] || []
              return (
                <div key={c.key} className={`cal-cell${c.out ? ' out' : ''}${c.key === today ? ' today' : ''}`}>
                  <span className="cal-num">{c.d}</span>
                  {evs.slice(0, 3).map((e, i) => (
                    <div key={i} className="ev" title={e.label} role="button" tabIndex={0}
                      onClick={() => onOpen(e.job)} onKeyDown={activateOnKey(() => onOpen(e.job))}>
                      <span className="stat-dot" style={{ background: EV_COLORS[e.type] }}/>
                      <span className="t">{e.label}</span>
                    </div>
                  ))}
                  {evs.length > 3 && <span className="ev-more">+{evs.length - 3} more</span>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="agenda">
          <div className="agenda-hd">Upcoming <span>Next 14 days</span></div>
          <div className="agenda-list">
            {groups.length === 0 && <div className="agenda-empty">Nothing scheduled in the next two weeks.</div>}
            {groups.map(g => (
              <Fragment key={g.date}>
                <div className="agenda-day">{dayLabel(g.date)}</div>
                {g.items.map((e, i) => (
                  <div key={i} className="agenda-item" role="button" tabIndex={0}
                    onClick={() => onOpen(e.job)} onKeyDown={activateOnKey(() => onOpen(e.job))}>
                    <div className="logo" style={logoStyle(e.job.company)}>{logoInitial(e.job.company)}</div>
                    <div className="txt">
                      <div className="a1">{e.job.company}</div>
                      <div className="a2">{e.detail}</div>
                    </div>
                    <span className="stat-dot" style={{ background: EV_COLORS[e.type] }}/>
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
