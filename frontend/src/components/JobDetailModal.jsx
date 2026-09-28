import { useState } from 'react'
import ContactsTab from './ContactsTab'
import InterviewsTab from './InterviewsTab'
import DatePicker from './DatePicker'

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
)

const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected']
const TABS = ['Details', 'Contacts', 'Interviews']

export default function JobDetailModal({ job, onClose, onSave, onDelete }) {
  const [activeTab, setActiveTab] = useState('Details')
  const [form, setForm] = useState({
    company:      job.company      ?? '',
    role:         job.role         ?? '',
    status:       job.status       ?? 'Wishlist',
    url:          job.url          ?? '',
    location:     job.location     ?? '',
    date_applied: job.date_applied ?? '',
    deadline:     job.deadline     ?? '',
    salary_min:   job.salary_min   != null ? String(job.salary_min) : '',
    salary_max:   job.salary_max   != null ? String(job.salary_max) : '',
    notes:        job.notes        ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function set(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setError(''); setSaving(true)
    try {
      await onSave(job.id, {
        company:      form.company,
        role:         form.role,
        status:       form.status,
        url:          form.url          || null,
        location:     form.location.trim() || null,
        date_applied: form.date_applied || null,
        deadline:     form.deadline     || null,
        salary_min:   form.salary_min   ? parseInt(form.salary_min, 10) : null,
        salary_max:   form.salary_max   ? parseInt(form.salary_max, 10) : null,
        notes:        form.notes        || null,
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${job.company} — ${job.role}"?`)) return
    await onDelete(job.id)
    onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-hd">
          <div style={{ minWidth: 0 }}>
            <h3 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {job.company}
            </h3>
            <p>{job.role}</p>
          </div>
          <button className="modal-close" onClick={onClose}><CloseIcon/></button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`modal-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Details tab */}
        {activeTab === 'Details' && (
          <form onSubmit={handleSave} style={{ display: 'contents' }}>
            <div className="modal-body">
              {error && <div className="error-banner">{error}</div>}

              <div className="field-row">
                <div className="field">
                  <label>Company *</label>
                  <input name="company" value={form.company} onChange={set} required />
                </div>
                <div className="field">
                  <label>Role *</label>
                  <input name="role" value={form.role} onChange={set} required />
                </div>

                <div className="field field-full">
                  <label>Job URL</label>
                  <input name="url" value={form.url} onChange={set} placeholder="https://..." />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={set}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Date applied</label>
                  <DatePicker name="date_applied" value={form.date_applied} onChange={set} disableFuture />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Salary min ($)</label>
                  <input type="number" name="salary_min" value={form.salary_min} onChange={set} placeholder="80000" min="0" />
                </div>
                <div className="field">
                  <label>Salary max ($)</label>
                  <input type="number" name="salary_max" value={form.salary_max} onChange={set} placeholder="120000" min="0" />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Location</label>
                  <input name="location" value={form.location} onChange={set} placeholder="e.g. Remote, New York, NY" />
                </div>
                <div className="field">
                  <label>Deadline</label>
                  <DatePicker name="deadline" value={form.deadline} onChange={set} />
                </div>
              </div>

              <div className="field">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={set} rows={3} placeholder="Referral, hybrid role, good benefits..." />
              </div>
            </div>

            <div className="modal-ft-spread">
              <button type="button" className="link-danger" onClick={handleDelete}>Delete</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        )}

        {activeTab === 'Contacts' && (
          <div className="modal-body">
            <ContactsTab jobId={job.id} />
          </div>
        )}

        {activeTab === 'Interviews' && (
          <div className="modal-body">
            <InterviewsTab jobId={job.id} />
          </div>
        )}
      </div>
    </div>
  )
}
