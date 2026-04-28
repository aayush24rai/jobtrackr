import { useState, useEffect } from 'react'
import client from '../api/client'

const PlusIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

const OUTCOMES = [
  { value: 'pending', label: 'Pending', color: 'var(--c-interview)' },
  { value: 'passed',  label: 'Passed',  color: 'var(--c-offer)'     },
  { value: 'failed',  label: 'Failed',  color: 'var(--c-rejected)'  },
]

const EMPTY = { round: '', scheduled_date: '', outcome: 'pending', notes: '' }

export default function InterviewsTab({ jobId }) {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [form, setForm]             = useState(EMPTY)
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    client.get(`/jobs/${jobId}/interviews`)
      .then(res => setInterviews(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [jobId])

  function set(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })) }

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
      setForm(EMPTY); setShowForm(false)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    await client.delete(`/jobs/${jobId}/interviews/${id}`)
    setInterviews(prev => prev.filter(i => i.id !== id))
  }

  if (loading) return <div style={{ color: 'var(--text-4)', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>Loading...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {interviews.length === 0 && !showForm && (
        <div style={{ color: 'var(--text-4)', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>No interviews logged yet.</div>
      )}

      {interviews.map(iv => {
        const outcome = OUTCOMES.find(o => o.value === iv.outcome)
        return (
          <div key={iv.id} className="sub-item">
            <div className="sub-item-body">
              <div className="sub-item-title">{iv.round}</div>
              {iv.scheduled_date && (
                <div className="sub-item-meta">
                  {new Date(iv.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              )}
              {outcome && (
                <div className="sub-item-badge" style={{ color: outcome.color }}>{outcome.label}</div>
              )}
              {iv.notes && (
                <div className="sub-item-meta" style={{ marginTop: 4, fontStyle: 'italic' }}>{iv.notes}</div>
              )}
            </div>
            <button className="sub-item-delete" onClick={() => handleDelete(iv.id)}>✕</button>
          </div>
        )
      })}

      {showForm ? (
        <form className="sub-form" onSubmit={handleAdd}>
          <div className="field-row">
            <div className="field">
              <label>Round *</label>
              <input name="round" value={form.round} onChange={set} required placeholder="Phone Screen" />
            </div>
            <div className="field">
              <label>Date</label>
              <input type="date" name="scheduled_date" value={form.scheduled_date} onChange={set} />
            </div>
          </div>
          <div className="field">
            <label>Outcome</label>
            <select name="outcome" value={form.outcome} onChange={set}>
              {OUTCOMES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={set} rows={2} placeholder="Topics covered, feedback..." />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn" onClick={() => { setShowForm(false); setForm(EMPTY) }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saving...' : 'Add interview'}
            </button>
          </div>
        </form>
      ) : (
        <button className="sub-add-btn" onClick={() => setShowForm(true)}>
          <PlusIcon/> Add interview
        </button>
      )}
    </div>
  )
}
