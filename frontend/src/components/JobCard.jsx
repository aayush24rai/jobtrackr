const PinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/>
  </svg>
)
const CalIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
  </svg>
)

// Generate a deterministic OKLCH background from company name
function logoStyle(company) {
  const hue = (company.charCodeAt(0) * 37) % 360
  return { background: `oklch(0.42 0.1 ${hue})` }
}

function fmtSalary(min, max) {
  if (!min && !max) return null
  const toK = (n) => Math.round(n / 1000)
  if (min && max) return `$${toK(min)}–${toK(max)}k`
  if (min) return `$${toK(min)}k+`
  return `up to $${toK(max)}k`
}

function fmtDate(iso) {
  if (!iso) return null
  const d = new Date(iso + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const days = Math.round((today - d) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1d ago'
  if (days < 14)  return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function deadlineInfo(iso) {
  if (!iso) return null
  const d = new Date(iso + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const days = Math.round((d - today) / 86400000)
  if (days < 0) return null
  return { days, urgent: days <= 2 }
}

// Stage pips: Wishlist=0, Applied=1, Interview=2, Offer=3, Rejected=0
const STAGE_MAP = { Wishlist: 0, Applied: 1, Interview: 2, Offer: 3, Rejected: 0 }
const STAGE_MAX = 4

export default function JobCard({ job, onClick, isDragging = false }) {
  const salary   = fmtSalary(job.salary_min, job.salary_max)
  const dateStr  = fmtDate(job.date_applied)
  const deadline = deadlineInfo(job.deadline)
  const stage    = STAGE_MAP[job.status] ?? 0
  const initial  = (job.company?.[0] ?? '?').toUpperCase()
  const urlLabel = job.url ? job.url.replace(/^https?:\/\//, '').split('/')[0] : null

  return (
    <div
      className={`card${isDragging ? ' dragging' : ''}`}
      onClick={onClick}
    >
      {/* Row 1: logo + company + role */}
      <div className="card-row1">
        <div className="logo" style={logoStyle(job.company)}>{initial}</div>
        <div className="card-title-wrap">
          <div className="card-company">{job.company}</div>
          <div className="card-role">{job.role}</div>
        </div>
      </div>

      {/* Row 2: salary + url/location */}
      {(salary || urlLabel) && (
        <div className="card-meta">
          {salary && <span className="salary mono">{salary}</span>}
          {salary && urlLabel && <span className="dot-sep">·</span>}
          {urlLabel && (
            <span className="loc">
              <PinIcon/>
              {urlLabel}
            </span>
          )}
        </div>
      )}

      {/* Row 3: date tag + deadline OR stage pips */}
      <div className="card-foot">
        <div className="tags">
          {dateStr && (
            <span className="tag mono">
              <CalIcon/> {dateStr}
            </span>
          )}
        </div>

        {deadline ? (
          <span className={`next ${deadline.urgent ? 'urgent' : 'soon'}`}>
            <ClockIcon/> {deadline.days}d
          </span>
        ) : (
          <span className="stage-pips">
            {Array.from({ length: STAGE_MAX }).map((_, i) => (
              <span key={i} className={`pip${i < stage ? ' on' : ''}`}/>
            ))}
          </span>
        )}
      </div>
    </div>
  )
}
