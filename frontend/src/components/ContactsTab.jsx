import { useState, useEffect } from 'react'
import client from '../api/client'

const PlusIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

const OUTREACH_METHODS = ['LinkedIn', 'Email', 'Phone', 'Referral', 'Other']

const RESPONSE_STATUSES = [
  { value: 'no_response',    label: 'No Response',    color: 'var(--text-3)'      },
  { value: 'responded',      label: 'Responded',      color: 'var(--c-applied)'   },
  { value: 'scheduled',      label: 'Scheduled',      color: 'var(--c-offer)'     },
  { value: 'not_interested', label: 'Not Interested', color: 'var(--c-rejected)'  },
]

const EMPTY = { name: '', role: '', outreach_method: 'LinkedIn', outreach_date: '', response_status: 'no_response', notes: '' }

export default function ContactsTab({ jobId }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    client.get(`/jobs/${jobId}/contacts`)
      .then(res => setContacts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [jobId])

  function set(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })) }

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
      setForm(EMPTY); setShowForm(false)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    await client.delete(`/jobs/${jobId}/contacts/${id}`)
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  if (loading) return <div style={{ color: 'var(--text-4)', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>Loading...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {contacts.length === 0 && !showForm && (
        <div style={{ color: 'var(--text-4)', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>No contacts yet.</div>
      )}

      {contacts.map(c => {
        const status = RESPONSE_STATUSES.find(s => s.value === c.response_status)
        return (
          <div key={c.id} className="sub-item">
            <div className="sub-item-body">
              <div className="sub-item-title">{c.name}</div>
              <div className="sub-item-meta">
                {c.role && <span>{c.role} · </span>}
                <span>{c.outreach_method}</span>
                {c.outreach_date && (
                  <span> · {new Date(c.outreach_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                )}
              </div>
              {status && (
                <div className="sub-item-badge" style={{ color: status.color }}>{status.label}</div>
              )}
            </div>
            <button className="sub-item-delete" onClick={() => handleDelete(c.id)}>✕</button>
          </div>
        )
      })}

      {showForm ? (
        <form className="sub-form" onSubmit={handleAdd}>
          <div className="field-row">
            <div className="field">
              <label>Name *</label>
              <input name="name" value={form.name} onChange={set} required placeholder="Jane Smith" />
            </div>
            <div className="field">
              <label>Their role</label>
              <input name="role" value={form.role} onChange={set} placeholder="Recruiter" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Method *</label>
              <select name="outreach_method" value={form.outreach_method} onChange={set}>
                {OUTREACH_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Date</label>
              <input type="date" name="outreach_date" value={form.outreach_date} onChange={set} />
            </div>
          </div>
          <div className="field">
            <label>Response</label>
            <select name="response_status" value={form.response_status} onChange={set}>
              {RESPONSE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn" onClick={() => { setShowForm(false); setForm(EMPTY) }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saving...' : 'Add contact'}
            </button>
          </div>
        </form>
      ) : (
        <button className="sub-add-btn" onClick={() => setShowForm(true)}>
          <PlusIcon/> Add contact
        </button>
      )}
    </div>
  )
}
