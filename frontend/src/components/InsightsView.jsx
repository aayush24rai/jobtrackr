import { useMemo } from 'react'
import './views.css'
import { keyOf, parseKey, todayKey, addDays, mondayOf, pct } from './viewHelpers'

// Same values the drawer uses for contacts and interviews
const METHODS = ['LinkedIn', 'Email', 'Phone', 'Referral', 'Other']
const ROUNDS  = ['Phone Screen', 'Technical', 'Onsite', 'Final']

const C_SCHEDULED    = 'oklch(0.78 0.12 230)'
const C_REPLIED      = 'oklch(0.78 0.12 150)'
const C_NOT_INTEREST = 'oklch(0.74 0.12 25)'
const C_PASSED       = 'oklch(0.78 0.12 150)'
const C_FAILED       = 'oklch(0.74 0.12 25)'

function HRow({ name, parts, right }) {
  return (
    <div className="hrow">
      <span className="n">{name}</span>
      <span className="track">
        {parts.map((p, i) => <span key={i} style={{ width: `${p.pct}%`, background: p.color }}/>)}
      </span>
      <span className="r">{right}</span>
    </div>
  )
}

const Key = ({ color, children }) => (
  <span className="legend"><span className="stat-dot" style={{ background: color }}/>{children}</span>
)

export default function InsightsView({ jobs, contacts, interviews }) {
  const today = todayKey()

  // Jobs added per week, last 8 weeks (Monday start). created_at is a full
  // timestamp, so new Date() gives the right local day here.
  const weeks = useMemo(() => {
    const monday = mondayOf(parseKey(today))
    const addedKeys = jobs.filter(j => j.created_at).map(j => keyOf(new Date(j.created_at)))
    return Array.from({ length: 8 }, (_, idx) => {
      const s = addDays(monday, (idx - 7) * 7)
      const sk = keyOf(s), ek = keyOf(addDays(s, 7))
      return { label: `${s.getMonth() + 1}/${s.getDate()}`, n: addedKeys.filter(k => k >= sk && k < ek).length }
    })
  }, [jobs, today])
  const maxW = Math.max(...weeks.map(w => w.n), 1)

  // Pipeline conversion. A rejected job counts as interviewed if it has any
  // interview logged (there's no separate "stage" field).
  const jobsWithInterviews = new Set(interviews.map(i => i.job_id))
  const applied     = jobs.filter(j => j.status !== 'Wishlist').length
  const interviewed = jobs.filter(j =>
    ['Interview', 'Offer'].includes(j.status) || (j.status === 'Rejected' && jobsWithInterviews.has(j.id))
  ).length
  const offers = jobs.filter(j => j.status === 'Offer').length
  const funnel = [
    { name: 'Tracked',     n: jobs.length, color: 'var(--c-wishlist)'  },
    { name: 'Applied',     n: applied,     color: 'var(--c-applied)'   },
    { name: 'Interviewed', n: interviewed, color: 'var(--c-interview)' },
    { name: 'Offer',       n: offers,      color: 'var(--c-offer)'     },
  ]

  // Outreach response by method. "Not interested" is still a reply, so it
  // counts toward the response rate as its own segment.
  const methods = METHODS.map(name => {
    const cs = contacts.filter(c => c.outreach_method === name)
    return {
      name,
      total:   cs.length,
      replied: cs.filter(c => c.response_status === 'responded').length,
      sched:   cs.filter(c => c.response_status === 'scheduled').length,
      notInt:  cs.filter(c => c.response_status === 'not_interested').length,
    }
  })

  // Interview outcomes by round, bars scaled to the busiest round
  const rounds = ROUNDS.map(name => {
    const xs = interviews.filter(i => i.round === name)
    return {
      name,
      total:   xs.length,
      passed:  xs.filter(i => i.outcome === 'passed').length,
      failed:  xs.filter(i => i.outcome === 'failed').length,
      pending: xs.filter(i => i.outcome === 'pending').length,
    }
  })
  const maxRound = Math.max(...rounds.map(r => r.total), 1)

  return (
    <div className="view">
      <div className="ins-grid">
        <div className="panel">
          <div className="panel-hd"><span className="panel-title">Jobs added per week</span><span className="panel-note">Last 8 weeks</span></div>
          <div className="bars">
            {weeks.map((w, i) => (
              <div className="bar-col" key={i}>
                <span className="v">{w.n}</span>
                <span className={`b${w.n ? '' : ' zero'}`} style={{ height: `${(w.n / maxW) * 120}px` }}/>
                <span className="l">{w.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-hd"><span className="panel-title">Pipeline conversion</span><span className="panel-note">Share of previous stage</span></div>
          <div className="hrows">
            {funnel.map((f, i) => (
              <HRow key={f.name} name={f.name}
                parts={[{ pct: pct(f.n, jobs.length), color: f.color }]}
                right={<>{f.n} <em>{i === 0 ? '' : `${pct(f.n, funnel[i - 1].n)}%`}</em></>}/>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-hd"><span className="panel-title">Outreach response by method</span><span className="panel-note">{contacts.length} contacts</span></div>
          <div className="hrows">
            {methods.map(m => (
              <HRow key={m.name} name={m.name}
                parts={[
                  { pct: pct(m.sched,  m.total), color: C_SCHEDULED },
                  { pct: pct(m.replied, m.total), color: C_REPLIED },
                  { pct: pct(m.notInt, m.total), color: C_NOT_INTEREST },
                ]}
                right={<>{pct(m.replied + m.sched + m.notInt, m.total)}% <em>of {m.total}</em></>}/>
            ))}
          </div>
          <div className="key">
            <Key color={C_SCHEDULED}>Call scheduled</Key>
            <Key color={C_REPLIED}>Replied</Key>
            <Key color={C_NOT_INTEREST}>Not interested</Key>
            <Key color="var(--surface-hi)">No response</Key>
          </div>
        </div>

        <div className="panel">
          <div className="panel-hd"><span className="panel-title">Interview outcomes by round</span><span className="panel-note">{interviews.length} rounds</span></div>
          <div className="hrows">
            {rounds.map(r => (
              <HRow key={r.name} name={r.name}
                parts={[
                  { pct: (r.passed  / maxRound) * 100, color: C_PASSED },
                  { pct: (r.failed  / maxRound) * 100, color: C_FAILED },
                  { pct: (r.pending / maxRound) * 100, color: 'var(--text-4)' },
                ]}
                right={<>{pct(r.passed, r.passed + r.failed)}% <em>pass</em></>}/>
            ))}
          </div>
          <div className="key">
            <Key color={C_PASSED}>Passed</Key>
            <Key color={C_FAILED}>Failed</Key>
            <Key color="var(--text-4)">Pending</Key>
          </div>
        </div>
      </div>
    </div>
  )
}
