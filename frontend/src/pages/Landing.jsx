import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import StatsBar from '../components/StatsBar'
import KanbanBoard from '../components/KanbanBoard'
import './Landing.css'

const VIDEO_SRC = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4'
const DASHBOARD = '/board'

// the mockup is laid out at this size and scaled to fit the window frame
const SHOT_W = 1440
const SHOT_VISIBLE_H = 780

// ── Icons ────────────────────────────────────────────────────────────
const LogoMark = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="#fff" aria-hidden="true">
    <rect x="2" y="3" width="8" height="26" rx="4"/><rect x="12" y="3" width="8" height="18" rx="4"/><rect x="22" y="3" width="8" height="10" rx="4"/>
  </svg>
)
const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 18 6-6-6-6"/>
  </svg>
)
const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)
const BellIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8Z"/><path d="M10 21a2 2 0 0 0 4 0"/>
  </svg>
)

// ── Sample board for the mockup ──────────────────────────────────────
// Fictional companies (the same ones the feature cards mention). Dates are
// relative to today so the cards' "3d ago" labels always look current.
function isoDaysFromToday(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function sampleJobs() {
  const job = (id, company, role, status, extra) => ({
    id, company, role, status,
    date_applied: null, deadline: null, url: null, location: null, salary_min: null, salary_max: null,
    ...extra,
  })
  return [
    job(1, 'Verdant',      'Design Engineer',          'Wishlist',  { location: 'Remote', salary_min: 140000, salary_max: 170000 }),
    job(2, 'Cobalt',       'Product Designer',         'Wishlist',  { location: 'New York, NY', deadline: isoDaysFromToday(5) }),
    job(3, 'Lumen Health', 'Product Designer II',      'Applied',   { location: 'Boston, MA', date_applied: isoDaysFromToday(-3), salary_min: 130000, salary_max: 155000 }),
    job(4, 'Marrow',       'Sr. Frontend Engineer',    'Applied',   { location: 'Remote', date_applied: isoDaysFromToday(-5), salary_min: 150000, salary_max: 185000 }),
    job(5, 'Caldera',      'Frontend Engineer',        'Interview', { location: 'San Francisco, CA', date_applied: isoDaysFromToday(-12), deadline: isoDaysFromToday(1) }),
    job(6, 'Pith',         'Senior Product Designer',  'Interview', { location: 'Remote', date_applied: isoDaysFromToday(-18), salary_min: 160000, salary_max: 190000 }),
    job(7, 'Sable',        'Senior Product Designer',  'Offer',     { location: 'Seattle, WA', date_applied: isoDaysFromToday(-34), salary_min: 165000, salary_max: 190000 }),
    job(8, 'Greycliff',    'Software Engineer',        'Rejected',  { location: 'Austin, TX', date_applied: isoDaysFromToday(-40) }),
  ]
}

const noop = () => {}

// The real dashboard components, read-only. Only the top bar is a static copy
// (it lives inside Dashboard.jsx) using the same dashboard classes.
function BoardPreview() {
  const shotRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [jobs] = useState(sampleJobs)

  useLayoutEffect(() => {
    const el = shotRef.current
    const fit = () => setScale(el.clientWidth / SHOT_W)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="lp-shot" ref={shotRef} style={{ height: Math.round(SHOT_VISIBLE_H * scale) }}>
      <div className="lp-shot-inner" style={{ transform: `scale(${scale})` }} inert aria-hidden="true">
        <div className="app" style={{ minHeight: '100%' }}>
          <div className="topbar">
            <div className="brand"><div className="brand-mark">J</div>JobTrackr</div>
            <div className="topbar-tabs">
              <div className="tab active">Board</div>
              <div className="tab">Calendar</div>
              <div className="tab">Insights</div>
            </div>
            <div className="topbar-spacer"/>
            <div className="icon-btn"><BellIcon/></div>
            <div className="btn btn-primary"><PlusIcon/> Add job</div>
            <div className="avatar">JT</div>
          </div>
          <StatsBar jobs={jobs} />
          <KanbanBoard jobs={jobs} onStatusChange={noop} onCardClick={noop} onAddTo={noop} />
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// inline CSS custom properties for the entrance animations
const fx = (d, y, t) => ({ '--d': `${d}s`, ...(y !== undefined && { '--y': `${y}px` }), ...(t && { '--t': `${t}s` }) })

export default function Landing() {
  const rootRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reducedMotion] = useState(prefersReducedMotion)

  useEffect(() => {
    const prev = document.title
    document.title = 'JobTrackr: your job search, organized'
    return () => { document.title = prev }
  }, [])

  // fade sections up as they scroll into view
  useEffect(() => {
    const els = rootRef.current.querySelectorAll('.lp-reveal')
    if (reducedMotion || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      })
    }, { threshold: 0.15 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [reducedMotion])

  return (
    <div className="lp" ref={rootRef}>
      {/* grain for the shiny headline */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="c3-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0"/>
          <feComposite in2="SourceGraphic" operator="in" result="noise"/>
          <feBlend in="SourceGraphic" in2="noise" mode="multiply"/>
        </filter>
      </svg>

      <div className="lp-bg">
        <video src={VIDEO_SRC} autoPlay={!reducedMotion} loop muted playsInline preload="metadata"/>
      </div>

      <div className="lp-content">
        <nav className="lp-nav lp-fx" style={fx(0, -10)}>
          <div className="lp-wrap">
            <Link to="/" aria-label="JobTrackr home"><LogoMark/></Link>
            <div className="lp-nav-links">
              <a className="lp-fx" style={fx(0.1, -8)} href="#pipeline">Pipeline</a>
              <a className="lp-fx" style={fx(0.15, -8)} href="#insights">Insights</a>
              <Link className="lp-fx" style={fx(0.2, -8)} to={DASHBOARD}>Dashboard</Link>
            </div>
            <Link className="lp-pill lp-nav-cta" to={DASHBOARD}>Open dashboard<Chevron/></Link>
            <button className="lp-menu-btn" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>
              <MenuIcon/>
            </button>
          </div>
          {menuOpen && (
            <div className="lp-mobile-menu lp-glass" onClick={() => setMenuOpen(false)}>
              <a href="#pipeline">Pipeline</a>
              <a href="#insights">Insights</a>
              <Link to={DASHBOARD}>Open dashboard</Link>
            </div>
          )}
        </nav>

        <section className="lp-hero lp-wrap">
          <h1 className="lp-fx" style={fx(0.3, 20, 0.8)}>
            <span>Your job search.</span>
            <span className="lp-shiny">Organized.</span>
          </h1>
          <p className="lp-fx" style={fx(0.5)}>
            JobTrackr keeps every application in one place: where you applied, who you reached out to, when your next interview is, and which efforts are getting responses.
          </p>
          <div className="lp-hero-cta lp-fx" style={fx(0.7)}>
            <Link className="lp-pill" to={DASHBOARD}>Open dashboard<Chevron/></Link>
            <small>Board, calendar, and insights in one place</small>
          </div>
        </section>

        <section className="lp-mock-sec lp-wrap">
          <div className="lp-window lp-fx" style={fx(1.1, 40, 0.8)}>
            <div className="lp-titlebar">
              <div className="lp-lights">
                <i style={{ background: '#ff5f57' }}/><i style={{ background: '#febc2e' }}/><i style={{ background: '#28c840' }}/>
              </div>
              <span>JobTrackr — Board</span>
            </div>
            <BoardPreview/>
          </div>
        </section>

        <section className="lp-feat lp-wrap" id="pipeline">
          <div className="lp-feat-grid">
            <div className="lp-reveal">
              <div className="lp-eyebrow"><span className="dot"/>Pipeline<span className="tag">At a glance</span></div>
              <h2>Every application<br/>in a single view.</h2>
              <p className="lede">Move jobs from Wishlist to Offer as things change. Open any job to see the people you contacted, when they replied, and how each interview round went.</p>
              <div className="lp-chips"><span>Drag between stages</span><span>Contacts per job</span><span>Follow-up reminders</span><span>Interview outcomes</span></div>
            </div>
            <div className="lp-glass lp-gcard lp-reveal" style={{ '--d': '.1s' }}>
              <div className="lp-gcard-hd">This week · 16 applications tracked</div>
              <div className="lp-subs">
                <div className="lp-glass lp-sub"><div className="lp-sub-hd"><i style={{ background: '#fff' }}/>Interviews<em>3</em></div><ul><li>Caldera — Onsite loop</li><li>Pith — Onsite</li></ul></div>
                <div className="lp-glass lp-sub"><div className="lp-sub-hd"><i style={{ background: '#e5e5e5' }}/>Follow-ups<em>4</em></div><ul><li>Jordan Ibarra — Pith</li><li>Kai Sorensen — Sable</li></ul></div>
                <div className="lp-glass lp-sub"><div className="lp-sub-hd"><i style={{ background: '#a3a3a3' }}/>Applied<em>5</em></div><ul><li>Lumen Health — Product Designer II</li><li>Marrow — Sr. Frontend Engineer</li></ul></div>
                <div className="lp-glass lp-sub"><div className="lp-sub-hd"><i style={{ background: '#525252' }}/>Offers<em>1</em></div><ul><li>Sable — Senior Product Designer</li></ul></div>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-feat lp-wrap" id="insights">
          <div className="lp-feat-grid">
            <div className="lp-glass lp-gcard lp-reveal">
              <div className="lp-gcard-hd">Your numbers · updated as you go</div>
              <div className="lp-rates">
                {[['Interview rate', 42], ['Offer rate', 8], ['LinkedIn reply rate', 80], ['Technical round pass rate', 100]].map(([label, v]) => (
                  <div className="lp-glass lp-rate" key={label}>
                    <div className="lp-rate-top"><span>{label}</span><b>{v}%</b></div>
                    <div className="lp-rate-bar"><span style={{ width: `${v}%` }}/></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-reveal" style={{ '--d': '.1s' }}>
              <div className="lp-eyebrow"><span className="dot"/>Insights<span className="tag">Calendar included</span></div>
              <h2>See what's working<br/>and what's next.</h2>
              <p className="lede">Track your interview and offer rates, which outreach methods get replies, and which rounds you pass most. Interviews and follow-ups show up on a calendar so nothing slips.</p>
              <div className="lp-chips"><span>Response rates</span><span>Pass rate by round</span><span>Weekly activity</span><span>14-day agenda</span></div>
            </div>
          </div>
        </section>

        <section className="lp-cta-sec lp-wrap">
          <div className="lp-glass lp-cta lp-reveal">
            <div className="lp-glow"/>
            <h2>Close the spreadsheet.<br/>Open your board.</h2>
            <p>Track every application, contact, and interview in one place, and see what's working as you go.</p>
            <div className="lp-cta-btns">
              <Link className="lp-pill" to={DASHBOARD}>Open dashboard<Chevron/></Link>
              <a className="lp-ghost" href="#pipeline">See features<Chevron/></a>
            </div>
          </div>
        </section>

        <footer className="lp-footer">
          <div className="lp-wrap">
            <span>© {new Date().getFullYear()} JobTrackr</span>
            <Link to={DASHBOARD}>Dashboard</Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
