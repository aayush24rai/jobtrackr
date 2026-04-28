import { useState } from 'react'

const STATUSES = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected']

const INITIAL = {
  company: '',
  role: '',
  status: 'Wishlist',
  url: '',
  date_applied: '',
  deadline: '',
  salary_min: '',
  salary_max: '',
  notes: '',
}

const inputCls =
  'w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30'

export default function AddJobModal({ onClose, onAdd }) {
  const [form, setForm] = useState(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onAdd({
        company: form.company,
        role: form.role,
        status: form.status,
        url: form.url || null,
        date_applied: form.date_applied || null,
        deadline: form.deadline || null,
        // Parse to int — backend expects Optional[int], not a string
        salary_min: form.salary_min ? parseInt(form.salary_min, 10) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max, 10) : null,
        notes: form.notes || null,
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add job.')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-xl w-full max-w-lg border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-700">
          <h2 className="text-base font-semibold text-white">Add Job</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Company *</label>
              <input name="company" value={form.company} onChange={set} required placeholder="Acme Inc." className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Role *</label>
              <input name="role" value={form.role} onChange={set} required placeholder="Software Engineer" className={inputCls} />
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
              placeholder="Referral from Jane, hybrid role, good benefits..."
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium py-2 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Adding...' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
