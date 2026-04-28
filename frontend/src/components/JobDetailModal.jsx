import { useState } from 'react'
import ContactsTab from './ContactsTab'
import InterviewsTab from './InterviewsTab'

const STATUSES = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected']

const TABS = ['Details', 'Contacts', 'Interviews']

const inputCls =
  'w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'

export default function JobDetailModal({ job, onClose, onSave, onDelete }) {
  const [activeTab, setActiveTab] = useState('Details')
  const [form, setForm] = useState({
    company:      job.company      ?? '',
    role:         job.role         ?? '',
    status:       job.status       ?? 'Wishlist',
    url:          job.url          ?? '',
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
    setError('')
    setSaving(true)
    try {
      await onSave(job.id, {
        company:      form.company,
        role:         form.role,
        status:       form.status,
        url:          form.url          || null,
        date_applied: form.date_applied || null,
        deadline:     form.deadline     || null,
        salary_min:   form.salary_min   ? parseInt(form.salary_min, 10) : null,
        salary_max:   form.salary_max   ? parseInt(form.salary_max, 10) : null,
        notes:        form.notes        || null,
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save changes.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${job.company} — ${job.role}"?`)) return
    await onDelete(job.id)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-xl w-full max-w-lg border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-700 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white truncate">{job.company}</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{job.role}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors ml-4 shrink-0">✕</button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-700 px-6 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm py-3 mr-5 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content — scrollable */}
        <div className="overflow-y-auto flex-1">
          {activeTab === 'Details' && (
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Company *</label>
                  <input name="company" value={form.company} onChange={set} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Role *</label>
                  <input name="role" value={form.role} onChange={set} required className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select name="status" value={form.status} onChange={set} className={inputCls}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Date Applied</label>
                  <input type="date" name="date_applied" value={form.date_applied} onChange={set} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Deadline</label>
                  <input type="date" name="deadline" value={form.deadline} onChange={set} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Job URL</label>
                  <input name="url" value={form.url} onChange={set} placeholder="https://..." className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Salary Min ($)</label>
                  <input type="number" name="salary_min" value={form.salary_min} onChange={set} placeholder="80000" min="0" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Salary Max ($)</label>
                  <input type="number" name="salary_max" value={form.salary_max} onChange={set} placeholder="120000" min="0" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={set}
                  rows={3}
                  placeholder="Referral from Jane, hybrid role..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors px-1"
                >
                  Delete
                </button>
                <div className="flex gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'Contacts' && (
            <div className="px-6 py-5">
              <ContactsTab jobId={job.id} />
            </div>
          )}

          {activeTab === 'Interviews' && (
            <div className="px-6 py-5">
              <InterviewsTab jobId={job.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
