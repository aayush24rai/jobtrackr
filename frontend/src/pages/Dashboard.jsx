import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import StatsBar from '../components/StatsBar'
import KanbanBoard from '../components/KanbanBoard'
import AddJobModal from '../components/AddJobModal'
import JobDetailModal from '../components/JobDetailModal'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

  useEffect(() => {
    client.get('/jobs/')
      .then(res => setJobs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleAddJob(jobData) {
    const { data: newJob } = await client.post('/jobs/', jobData)
    setJobs(prev => [...prev, newJob])
    setShowModal(false)
  }

  async function handleStatusChange(jobId, newStatus) {
    // Optimistic update — move the card immediately so the UI feels instant,
    // then sync with the server in the background
    setJobs(prev =>
      prev.map(j => (j.id === jobId ? { ...j, status: newStatus } : j))
    )
    await client.patch(`/jobs/${jobId}`, { status: newStatus })
  }

  async function handleUpdateJob(jobId, updates) {
    const { data: updated } = await client.patch(`/jobs/${jobId}`, updates)
    setJobs(prev => prev.map(j => (j.id === jobId ? updated : j)))
    setSelectedJob(null)
  }

  async function handleDelete(jobId) {
    setJobs(prev => prev.filter(j => j.id !== jobId))
    await client.delete(`/jobs/${jobId}`)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <span className="text-white font-bold text-lg tracking-tight">JobTrackr</span>
        <div className="flex items-center gap-5">
          <span className="text-gray-400 text-sm hidden sm:block">{user?.email}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="px-6 py-6 max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Applications</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add Job
          </button>
        </div>

        <StatsBar jobs={jobs} />

        {loading ? (
          <div className="text-gray-500 text-sm text-center py-16">Loading your jobs...</div>
        ) : (
          <KanbanBoard
            jobs={jobs}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onCardClick={setSelectedJob}
          />
        )}
      </main>

      {showModal && (
        <AddJobModal
          onClose={() => setShowModal(false)}
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
