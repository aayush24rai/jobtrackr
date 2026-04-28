import { useState, useEffect } from 'react'
import client from '../api/client'

const OUTREACH_METHODS = ['LinkedIn', 'Email', 'Phone', 'Referral', 'Other']

const RESPONSE_STATUSES = [
  { value: 'no_response',    label: 'No Response',    color: 'text-gray-400'  },
  { value: 'responded',      label: 'Responded',      color: 'text-blue-400'  },
  { value: 'scheduled',      label: 'Scheduled',      color: 'text-green-400' },
  { value: 'not_interested', label: 'Not Interested', color: 'text-red-400'   },
]

const inputCls =
  'w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500'

const EMPTY_FORM = {
  name: '', role: '', outreach_method: 'LinkedIn',
  outreach_date: '', response_status: 'no_response', notes: '',
}

export default function ContactsTab({ jobId }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    client.get(`/jobs/${jobId}/contacts`)
      .then(res => setContacts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [jobId])

  function set(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await client.post(`/jobs/${jobId}/contacts`, {
        name:            form.name,
        outreach_method: form.outreach_method,
        response_status: form.response_status,
        role:          form.role          || null,
        outreach_date: form.outreach_date || null,
        notes:         form.notes         || null,
      })
      setContacts(prev => [...prev, data])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(contactId) {
    await client.delete(`/jobs/${jobId}/contacts/${contactId}`)
    setContacts(prev => prev.filter(c => c.id !== contactId))
  }

  if (loading) {
    return <div className="text-gray-500 text-sm text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-2">
      {contacts.length === 0 && !showForm && (
        <p className="text-gray-600 text-sm text-center py-6">No contacts yet.</p>
      )}

      {contacts.map(contact => {
        const statusMeta = RESPONSE_STATUSES.find(s => s.value === contact.response_status)
        return (
          <div key={contact.id} className="bg-gray-700/40 rounded-lg px-4 py-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-white">{contact.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {contact.role && <span>{contact.role} · </span>}
                <span>{contact.outreach_method}</span>
                {contact.outreach_date && (
                  <span> · {new Date(contact.outreach_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                )}
              </div>
              {statusMeta && (
                <div className={`text-xs mt-1 ${statusMeta.color}`}>{statusMeta.label}</div>
              )}
            </div>
            <button
              onClick={() => handleDelete(contact.id)}
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
              <label className="block text-xs text-gray-400 mb-1">Name *</label>
              <input name="name" value={form.name} onChange={set} required placeholder="Jane Smith" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Their Role</label>
              <input name="role" value={form.role} onChange={set} placeholder="Recruiter" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Outreach Method *</label>
              <select name="outreach_method" value={form.outreach_method} onChange={set} className={inputCls}>
                {OUTREACH_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date</label>
              <input type="date" name="outreach_date" value={form.outreach_date} onChange={set} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Response Status</label>
            <select name="response_status" value={form.response_status} onChange={set} className={inputCls}>
              {RESPONSE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm py-1.5 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-sm py-1.5 rounded-lg transition-colors">
              {saving ? 'Saving...' : 'Add Contact'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border border-dashed border-gray-700 hover:border-gray-500 text-gray-600 hover:text-gray-300 text-sm py-2.5 rounded-lg transition-colors"
        >
          + Add Contact
        </button>
      )}
    </div>
  )
}
