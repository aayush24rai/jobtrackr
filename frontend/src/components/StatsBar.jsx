const ArrowUp = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7"/>
  </svg>
)
const ArrowDn = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12l7 7 7-7"/>
  </svg>
)

export default function StatsBar({ jobs }) {
  const total     = jobs.length
  const applied   = jobs.filter(j => ['Applied', 'Interview', 'Offer', 'Rejected'].includes(j.status)).length
  const interview = jobs.filter(j => ['Interview', 'Offer'].includes(j.status)).length
  const offers    = jobs.filter(j => j.status === 'Offer').length
  const rejected  = jobs.filter(j => j.status === 'Rejected').length
  const active    = total - rejected

  const interviewRate = applied ? Math.round((interview / applied) * 100) : 0
  const offerRate     = applied ? Math.round((offers    / applied) * 100) : 0
  const responseRate  = applied ? Math.round(((interview + rejected) / applied) * 100) : 0

  const stats = [
    { label: 'Total applications', value: total,         unit: '',  delta: 'tracking',    trend: 'flat', dot: 'var(--text-2)'      },
    { label: 'Active pipeline',    value: active,        unit: '',  delta: 'not rejected', trend: 'flat', dot: 'var(--c-applied)'   },
    { label: 'Interview rate',     value: interviewRate, unit: '%', delta: 'of applied',   trend: interviewRate >= 20 ? 'up' : 'flat', dot: 'var(--c-interview)' },
    { label: 'Offer rate',         value: offerRate,     unit: '%', delta: 'of applied',   trend: offerRate >= 10 ? 'up' : 'flat',     dot: 'var(--c-offer)'     },
    { label: 'Response rate',      value: responseRate,  unit: '%', delta: 'of applied',   trend: responseRate >= 30 ? 'up' : 'down',  dot: 'var(--text-3)'      },
  ]

  return (
    <div className="stats">
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <div className="stat-label">
            <span className="stat-dot" style={{ background: s.dot }}/>
            {s.label}
          </div>
          <div className="stat-value">
            {s.value}
            {s.unit && <span className="stat-unit">{s.unit}</span>}
          </div>
          <div className={`stat-delta ${s.trend}`}>
            {s.trend === 'up'   && <ArrowUp/>}
            {s.trend === 'down' && <ArrowDn/>}
            {s.delta}
          </div>
        </div>
      ))}
    </div>
  )
}
