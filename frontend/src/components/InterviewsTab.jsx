import { useState, useEffect } from 'react'
import client from '../api/client'

const OUTCOMES = [
  { value: 'pending', label: 'Pending', color: 'text-amber-400' },
  { value: 'passed',  label: 'Passed',  color: 'text-green-400' },
  { value: 'failed',  label: 'Failed',  color: 'text-red-400'   },
]

const inputCls =
  'w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500'

const EMPTY_FORM = { round: '', scheduled_date: '', outcome: 'pending', notes: '' }

export default function InterviewsTab({ jobId }) {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    client.get(`/jobs/${jobId}/interviews`)
      .then(res => setInterviews(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [jobId])

  // The backend doesn't have a GET /interviews list endpoint, so we build
  // our list from POST responses and remove on DELETE — state is the source of truth.

  function set(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await client.post(`/jobs/${jobId}/interviews`, {
        round:          form.round,
        outcome:        form.outcome,
        scheduled_date: form.scheduled_date || null,
        notes:          form.notes          || null,
      })
      setInterviews(prev => [...prev, data])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(interviewId) {
    await client.delete(`/jobs/${jobId}/interviews/${interviewId}`)
    setInterviews(prev => prev.filter(i => i.id !== interviewId))
  }

  if (loading) {
    return <div className="text-gray-500 text-sm text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-2">
      {interviews.length === 0 && !showForm && (
        <p className="text-gray-600 text-sm text-center py-6">No interviews logged yet.</p>
      )}

      {interviews.map(interview => {
        const outcomeMeta = OUTCOMES.find(o => o.value === interview.outcome)
        return (
          <div key={interview.id} className="bg-gray-700/40 rounded-lg px-4 py-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-white">{interview.round}</div>
              {interview.scheduled_date && (
                <div className="text-xs text-gray-400 mt-0.5">
                  {new Date(interview.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              )}
              {outcomeMeta && (
                <div className={`text-xs mt-1 ${outcomeMeta.color}`}>{outcomeMeta.label}</div>
              )}
              {interview.notes && (
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{interview.notes}</div>
              )}
            </div>
            <button
              onClick={() => handleDelete(interview.id)}
              className="text-gray-600 hover:text-red-400 text-xs transition-colors shrink-0 mt-0.5"
            >
              ✕
            </button>
          </div>
        )
      })}

      {showForm ? (
        <form onSubmit={handleAdd} className="bg-gray-700/30 rounded-lg p-4 space-y-3 border border-gray-600/50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Round *</label>
              <input name="round" value={form.round} onChange={set} required
                placeholder="Phone Screen" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date</label>
              <input type="date" name="scheduled_date" value={form.scheduled_date} onChange={set} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Outcome</label>
            <select name="outcome" value={form.outcome} onChange={set} className={inputCls}>
              {OUTCOMES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={set} rows={2}
              placeholder="Topics covered, feedback..."
              className={`${inputCls} resize-none`} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm py-1.5 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-sm py-1.5 rounded-lg transition-colors">
              {saving ? 'Saving...' : 'Add Interview'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border border-dashed border-gray-700 hover:border-gray-500 text-gray-600 hover:text-gray-300 text-sm py-2.5 rounded-lg transition-colors"
        >
          + Add Interview
        </button>
      )}
    </div>
  )
}
