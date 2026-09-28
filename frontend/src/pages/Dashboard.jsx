import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import StatsBar from '../components/StatsBar'
import KanbanBoard from '../components/KanbanBoard'
import AddJobModal from '../components/AddJobModal'
import JobDetailModal from '../components/JobDetailModal'
import JobDrawer from '../components/JobDrawer'
import ChangePasswordModal from '../components/ChangePasswordModal'
import CalendarView from '../components/CalendarView'
import InsightsView from '../components/InsightsView'

const VIEWS = ['Board', 'Calendar', 'Insights']
const VIEW_KEY = 'jt-view'

// localStorage can throw (private mode, blocked storage) - treat that as "nothing saved"
function readSavedView() {
  try {
    const v = localStorage.getItem(VIEW_KEY)
    return VIEWS.includes(v) ? v : null
  } catch {
    return null
  }
}
function saveView(v) {
  try { localStorage.setItem(VIEW_KEY, v) } catch { /* not persisted, still switches */ }
}

// ── Icons ────────────────────────────────────────────────────────────
// three-bar mark, same as the landing page
const LogoMark = () => (
  <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <rect x="2" y="3" width="8" height="26" rx="4"/><rect x="12" y="3" width="8" height="18" rx="4"/><rect x="22" y="3" width="8" height="10" rx="4"/>
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

const KeyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 9.2-9.2M17 6l3 3M14 9l2 2"/>
  </svg>
)
const LogoutIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
)

// ── ProfileMenu ──────────────────────────────────────────────────────
function ProfileMenu({ user, onLogout, onChangePassword }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Derive initials: first 2 chars of the local part of email
  const initials = (user?.email?.split('@')[0] ?? 'U').slice(0, 2).toUpperCase()

  // close when clicking anywhere outside the menu or pressing Escape
  useEffect(() => {
    if (!open) return
    function onMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="profile" ref={ref}>
      <button
        className="avatar"
        title={user?.email}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {initials}
      </button>

      {open && (
        <div className="menu" role="menu">
          <div className="menu-hd">
            <div className="menu-hd-label">Signed in as</div>
            <div className="menu-hd-email">{user?.email}</div>
          </div>
          <button className="menu-item" role="menuitem" onClick={() => { setOpen(false); onChangePassword() }}>
            <KeyIcon/> Change password
          </button>
          <button className="menu-item danger" role="menuitem" onClick={onLogout}>
            <LogoutIcon/> Log out
          </button>
        </div>
      )}
    </div>
  )
}

// ── TopBar ───────────────────────────────────────────────────────────
function TopBar({ user, view, onViewChange, onLogout, onChangePassword, onAddJob }) {

  return (
    <div className="topbar">
      <Link to="/" className="brand" style={{ color: 'inherit', textDecoration: 'none' }} title="JobTrackr home">
        <span className="brand-mark"><LogoMark/></span>
        JobTrackr
      </Link>

      <div className="topbar-tabs" role="tablist">
        {VIEWS.map(v => (
          <div
            key={v}
            className={`tab${view === v ? ' active' : ''}`}
            role="tab"
            tabIndex={0}
            aria-selected={view === v}
            onClick={() => onViewChange(v)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onViewChange(v)}
          >
            {v}
          </div>
        ))}
      </div>

      <div className="topbar-spacer"/>

      <button className="icon-btn" title="Notifications">
        <BellIcon/>
      </button>

      <button className="btn btn-primary" onClick={onAddJob}>
        <PlusIcon/> Add job
      </button>

      <ProfileMenu user={user} onLogout={onLogout} onChangePassword={onChangePassword} />
    </div>
  )
}

// ── BoardToolbar ─────────────────────────────────────────────────────
function BoardToolbar({ jobs }) {
  const today = new Date(); today.setHours(0,0,0,0)
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7)

  const interviewsThisWeek = jobs.filter(j =>
    j.status === 'Interview' &&
    j.date_applied &&
    new Date(j.date_applied + 'T00:00:00') >= weekAgo
  ).length

  const urgentCount = jobs.filter(j => {
    if (!j.deadline) return false
    const d = new Date(j.deadline + 'T00:00:00')
    return (d - today) / 86400000 <= 2
  }).length

  return (
    <div className="board-toolbar">
      <div className="topbar-spacer"/>
      {interviewsThisWeek > 0 && (
        <div className="legend">
          <span className="stat-dot" style={{ background: 'var(--c-interview)' }}/>
          {interviewsThisWeek} interview{interviewsThisWeek !== 1 ? 's' : ''} this week
        </div>
      )}
      {urgentCount > 0 && interviewsThisWeek > 0 && (
        <div className="divider-v"/>
      )}
      {urgentCount > 0 && (
        <div className="chip" style={{ color: 'var(--c-rejected)' }}>
          {urgentCount} urgent
        </div>
      )}
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth()
  const [jobs, setJobs]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [addStatus, setAddStatus]   = useState(null)  // column id that triggered Add, or null
  const [selectedJob, setSelectedJob] = useState(null)
  const [openJobId, setOpenJobId]   = useState(null)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [contacts, setContacts]     = useState([])
  const [interviews, setInterviews] = useState([])

  // ?view= overrides the saved view without being saved itself
  const [searchParams, setSearchParams] = useSearchParams()
  const urlView = VIEWS.includes(searchParams.get('view')) ? searchParams.get('view') : null
  const [savedView, setSavedView] = useState(() => readSavedView() ?? 'Board')
  const view = urlView ?? savedView

  function handleViewChange(v) {
    setSavedView(v)
    saveView(v)
    // a tab click is an explicit choice, so drop the override from the URL
    if (urlView) setSearchParams(prev => { prev.delete('view'); return prev }, { replace: true })
  }

  useEffect(() => {
    client.get('/jobs/')
      .then(res => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // All contacts and interviews, for Calendar and Insights. The drawer and
  // edit modal change these, so reload when either closes.
  const loadActivity = useCallback(() => {
    client.get('/contacts').then(res => setContacts(res.data)).catch(console.error)
    client.get('/interviews').then(res => setInterviews(res.data)).catch(console.error)
  }, [])
  useEffect(() => { loadActivity() }, [loadActivity])

  async function handleAddJob(jobData) {
    const { data: newJob } = await client.post('/jobs/', jobData)
    setJobs(prev => [newJob, ...prev])
    setAddStatus(null)
  }

  async function handleStatusChange(jobId, newStatus) {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j))
    await client.patch(`/jobs/${jobId}`, { status: newStatus })
  }

  async function handleUpdateJob(jobId, updates) {
    const { data: updated } = await client.patch(`/jobs/${jobId}`, updates)
    setJobs(prev => prev.map(j => j.id === jobId ? updated : j))
    setSelectedJob(null)
    loadActivity()   // the modal's Contacts/Interviews tabs may have changed things
  }

  async function handleDelete(jobId) {
    setJobs(prev => prev.filter(j => j.id !== jobId))
    // deleting a job deletes its contacts and interviews too
    setContacts(prev => prev.filter(c => c.job_id !== jobId))
    setInterviews(prev => prev.filter(i => i.job_id !== jobId))
    await client.delete(`/jobs/${jobId}`)
  }

  const openJob = openJobId ? (jobs.find(j => j.id === openJobId) ?? null) : null

  return (
    <div className={`app${openJob ? ' drawer-open' : ''}`}>
      <TopBar
        user={user}
        view={view}
        onViewChange={handleViewChange}
        onLogout={logout}
        onChangePassword={() => setShowChangePassword(true)}
        onAddJob={() => setAddStatus('Wishlist')}
      />
      <StatsBar jobs={jobs} />
      {view === 'Board' && <BoardToolbar jobs={jobs} />}

      {loading ? (
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--text-4)', fontSize: 13 }}>
          Loading your jobs…
        </div>
      ) : view === 'Calendar' ? (
        <CalendarView jobs={jobs} contacts={contacts} interviews={interviews} onOpen={j => setOpenJobId(j.id)} />
      ) : view === 'Insights' ? (
        <InsightsView jobs={jobs} contacts={contacts} interviews={interviews} />
      ) : (
        <KanbanBoard
          jobs={jobs}
          onStatusChange={handleStatusChange}
          onCardClick={j => setOpenJobId(j.id)}
          onAddTo={setAddStatus}
        />
      )}

      {addStatus !== null && (
        <AddJobModal
          initialStatus={addStatus}
          onClose={() => setAddStatus(null)}
          onAdd={handleAddJob}
        />
      )}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => { setSelectedJob(null); loadActivity() }}
          onSave={handleUpdateJob}
          onDelete={handleDelete}
        />
      )}

      {openJob && (
        <JobDrawer
          job={openJob}
          onClose={() => { setOpenJobId(null); loadActivity() }}
          onEdit={job => { setOpenJobId(null); setSelectedJob(job) }}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  )
}
