import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import StatsBar from '../components/StatsBar'
import KanbanBoard from '../components/KanbanBoard'
import AddJobModal from '../components/AddJobModal'
import JobDetailModal from '../components/JobDetailModal'

// ── Icons ────────────────────────────────────────────────────────────
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
const GroupIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)

// ── TopBar ───────────────────────────────────────────────────────────
function TopBar({ user, onLogout, onAddJob }) {
  // Derive initials: first 2 chars of the local part of email
  const initials = (user?.email?.split('@')[0] ?? 'U').slice(0, 2).toUpperCase()

  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark">J</div>
        JobTrackr
      </div>

      <div className="topbar-tabs">
        <div className="tab active">Board</div>
      </div>

      <div className="topbar-spacer"/>

      <button className="icon-btn" title="Notifications" onClick={onLogout} style={{ display: 'none' }}>
        <BellIcon/>
      </button>
      <button className="icon-btn" title="Notifications">
        <BellIcon/>
      </button>

      <button className="btn btn-primary" onClick={onAddJob}>
        <PlusIcon/> Add job
      </button>

      <div className="avatar" title={user?.email} onClick={onLogout} style={{ cursor: 'default' }}>
        {initials}
      </div>
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
      <div className="chip active"><GroupIcon/> Board</div>
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

  useEffect(() => {
    client.get('/jobs/')
      .then(res => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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
  }

  async function handleDelete(jobId) {
    setJobs(prev => prev.filter(j => j.id !== jobId))
    await client.delete(`/jobs/${jobId}`)
  }

  return (
    <div className="app">
      <TopBar user={user} onLogout={logout} onAddJob={() => setAddStatus('Wishlist')} />
      <StatsBar jobs={jobs} />
      <BoardToolbar jobs={jobs} />

      {loading ? (
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--text-4)', fontSize: 13 }}>
          Loading your jobs…
        </div>
      ) : (
        <KanbanBoard
          jobs={jobs}
          onStatusChange={handleStatusChange}
          onCardClick={setSelectedJob}
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
          onClose={() => setSelectedJob(null)}
          onSave={handleUpdateJob}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
