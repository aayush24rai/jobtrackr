import { useState, useEffect, useRef } from 'react'
import DatePicker from './DatePicker'
import { getErrorMessage } from '../api/client'

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
)

const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected']

const EMPTY = {
  company: '', role: '', status: 'Wishlist',
  date_applied: '', deadline: '', url: '', location: '',
  salary_min: '', salary_max: '', notes: '',
}

export default function AddJobModal({ initialStatus, onClose, onAdd }) {
  const [form, setForm] = useState({ ...EMPTY, status: initialStatus || 'Wishlist' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const firstRef = useRef(null)

  useEffect(() => { firstRef.current?.focus() }, [])

  function set(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const canSubmit = form.company.trim() && form.role.trim()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setError(''); setLoading(true)
    try {
      await onAdd({
        company:      form.company.trim(),
        role:         form.role.trim(),
        status:       form.status,
        url:          form.url          || null,
        location:     form.location.trim() || null,
        date_applied: form.date_applied || null,
        deadline:     form.deadline     || null,
        salary_min:   form.salary_min   ? parseInt(form.salary_min, 10)  : null,
        salary_max:   form.salary_max   ? parseInt(form.salary_max, 10)  : null,
        notes:        form.notes        || null,
      })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add job.'))
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <form className="modal" onMouseDown={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-hd">
          <h3>Add job</h3>
          <button type="button" className="modal-close" onClick={onClose}><CloseIcon/></button>
        </div>

        <div className="modal-body">
          {error && <div className="error-banner">{error}</div>}

          <div className="field">
            <label>Company</label>
            <input ref={firstRef} name="company" value={form.company} onChange={set} required placeholder="e.g. Acme Inc." />
          </div>
          <div className="field">
            <label>Role</label>
            <input name="role" value={form.role} onChange={set} required placeholder="e.g. Software Engineer" />
          </div>

          <div className="field">
            <label>Location</label>
            <input name="location" value={form.location} onChange={set} placeholder="e.g. Remote, New York, NY" />
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
              <DatePicker name="date_applied" value={form.date_applied} onChange={set} />
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
              <label>Job URL</label>
              <input name="url" value={form.url} onChange={set} placeholder="https://..." />
            </div>
            <div className="field">
              <label>Deadline</label>
              <DatePicker name="deadline" value={form.deadline} onChange={set} />
            </div>
          </div>
        </div>

        <div className="modal-ft">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit || loading}>
            {loading ? 'Adding...' : 'Add job'}
          </button>
        </div>
      </form>
    </div>
  )
}
