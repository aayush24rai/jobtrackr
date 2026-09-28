import { useState, useEffect, useRef } from 'react'
import client from '../api/client'
import DatePicker from './DatePicker'

// ── Icons ─────────────────────────────────────────────────────────────
const LinkedInIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22zM8.5 8h4.37v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 6.99V22h-4.56v-6.6c0-1.57-.03-3.6-2.19-3.6-2.19 0-2.53 1.71-2.53 3.48V22H8.5z"/>
  </svg>
)
const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>
  </svg>
)
const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>
  </svg>
)
const ReferralIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-1.5-3.1"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>
  </svg>
)
const CalIconDr = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
  </svg>
)
const BellIconDr = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8Z"/><path d="M10 21a2 2 0 0 0 4 0"/>
  </svg>
)
const PlusIconDr = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)
const CloseIconDr = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
)
const EditIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
  </svg>
)
const PhoneIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92V21a1 1 0 0 1-1.1 1 19 19 0 0 1-8.3-3 19 19 0 0 1-6-6 19 19 0 0 1-3-8.3A1 1 0 0 1 4.6 3.7L8 4a1 1 0 0 1 .9 1.1 12 12 0 0 0 .6 2.6 1 1 0 0 1-.3 1L7.6 10a16 16 0 0 0 6 6l1.3-1.6a1 1 0 0 1 1-.3 12 12 0 0 0 2.6.6 1 1 0 0 1 1 1Z"/>
  </svg>
)
const CodeIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m8 6-6 6 6 6M16 6l6 6-6 6"/>
  </svg>
)
const BuildingIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01"/>
  </svg>
)
const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="m12 2 2.9 6.9 7.1.6-5.4 4.7 1.6 7.1L12 17.8 5.8 21.3 7.4 14.2 2 9.5l7.1-.6Z"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
  </svg>
)

// ── Helpers ───────────────────────────────────────────────────────────
function logoStyle(company) {
  const hue = (company.charCodeAt(0) * 37) % 360
  return { background: `oklch(0.42 0.1 ${hue})` }
}

function fmtSalary(min, max) {
  if (!min && !max) return null
  const toK = (n) => Math.round(n / 1000)
  if (min && max) return `$${toK(min)}–${toK(max)}k`
  if (min) return `$${toK(min)}k+`
  return `up to $${toK(max)}k`
}

function fmtRel(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const days = Math.round((today - d) / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return '1d ago'
  if (days === -1) return 'tomorrow'
  if (days > 0 && days < 14) return `${days}d ago`
  if (days < 0 && days > -14) return `in ${-days}d`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtFullDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

// ── Constants (field names match the actual backend schema) ───────────
const METHOD_ICON = {
  LinkedIn: <LinkedInIcon />,
  Email:    <MailIcon />,
  Phone:    <PhoneIcon />,
  Referral: <ReferralIcon />,
  Other:    <LinkIcon />,
}

// backend response_status values
const RESPONSE_PILL = {
  'no_response':    { label: 'No response',    cls: 'gray'  },
  'responded':      { label: 'Replied',         cls: 'green' },
  'scheduled':      { label: 'Scheduled',       cls: 'blue'  },
  'not_interested': { label: 'Not interested',  cls: 'red'   },
}

const OUTCOME_PILL = {
  pending: { label: 'Pending', cls: 'gray'  },
  passed:  { label: 'Passed',  cls: 'green' },
  failed:  { label: 'Failed',  cls: 'red'   },
}

const ROUND_ICON = {
  'Phone Screen': <PhoneIcon />,
  Technical:      <CodeIcon />,
  Onsite:         <BuildingIcon />,
  Final:          <StarIcon />,
}

const OUTREACH_METHODS   = ['LinkedIn', 'Email', 'Phone', 'Referral', 'Other']
const RESPONSE_OPTIONS   = [
  { value: 'no_response',    label: 'No response'    },
  { value: 'responded',      label: 'Replied'        },
  { value: 'scheduled',      label: 'Scheduled'      },
  { value: 'not_interested', label: 'Not interested' },
]
const ROUND_OPTIONS      = ['Phone Screen', 'Technical', 'Onsite', 'Final']
const OUTCOME_OPTIONS    = [
  { value: 'pending', label: 'Pending' },
  { value: 'passed',  label: 'Passed'  },
  { value: 'failed',  label: 'Failed'  },
]

// ── AddContactForm ────────────────────────────────────────────────────
const CONTACT_EMPTY = {
  name: '', role: '', outreach_method: 'LinkedIn',
  outreach_date: '', response_status: 'no_response',
  follow_up_date: '', notes: '',
}

function AddContactForm({ jobId, onAdd, onCancel }) {
  const [form, setForm]     = useState({ ...CONTACT_EMPTY, outreach_date: todayIso() })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)
  const firstRef = useRef(null)

  useEffect(() => { firstRef.current?.focus() }, [])

  function set(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { data } = await client.post(`/jobs/${jobId}/contacts`, {
        name:            form.name,
        role:            form.role            || null,
        outreach_method: form.outreach_method,
        outreach_date:   form.outreach_date   || null,
        response_status: form.response_status,
        follow_up_date:  form.follow_up_date  || null,
        notes:           form.notes           || null,
      })
      onAdd(data)
    } catch {
      setError('Could not save contact. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="dr-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <div className="field">
          <label>Name *</label>
          <input ref={firstRef} name="name" value={form.name} onChange={set} required placeholder="Jane Smith" />
        </div>
        <div className="field">
          <label>Their title</label>
          <input name="role" value={form.role} onChange={set} placeholder="Recruiter at Acme" />
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
          <label>Outreach date</label>
          <DatePicker name="outreach_date" value={form.outreach_date} onChange={set} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Response</label>
          <select name="response_status" value={form.response_status} onChange={set}>
            {RESPONSE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Follow-up date</label>
          <DatePicker name="follow_up_date" value={form.follow_up_date} onChange={set} />
        </div>
      </div>
      <div className="field">
        <label>Notes</label>
        <textarea name="notes" value={form.notes} onChange={set} rows={2} placeholder="Context, talking points…" />
      </div>
      {error && <div className="error-banner">{error}</div>}
      <div className="dr-form-actions">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Add contact'}
        </button>
      </div>
    </form>
  )
}

// ── AddInterviewForm ──────────────────────────────────────────────────
const INTERVIEW_EMPTY = { round: 'Phone Screen', scheduled_date: '', outcome: 'pending', notes: '' }

function AddInterviewForm({ jobId, onAdd, onCancel }) {
  const [form, setForm]     = useState(INTERVIEW_EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)
  const firstRef = useRef(null)

  useEffect(() => { firstRef.current?.focus() }, [])

  function set(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { data } = await client.post(`/jobs/${jobId}/interviews`, {
        round:          form.round,
        scheduled_date: form.scheduled_date || null,
        outcome:        form.outcome,
        notes:          form.notes          || null,
      })
      onAdd(data)
    } catch {
      setError('Could not save interview. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="dr-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <div className="field">
          <label>Round *</label>
          <select ref={firstRef} name="round" value={form.round} onChange={set}>
            {ROUND_OPTIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Date</label>
          <DatePicker name="scheduled_date" value={form.scheduled_date} onChange={set} />
        </div>
      </div>
      <div className="field">
        <label>Outcome</label>
        <select name="outcome" value={form.outcome} onChange={set}>
          {OUTCOME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Notes</label>
        <textarea name="notes" value={form.notes} onChange={set} rows={2} placeholder="Topics covered, feedback…" />
      </div>
      {error && <div className="error-banner">{error}</div>}
      <div className="dr-form-actions">
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Add interview'}
        </button>
      </div>
    </form>
  )
}

// ── ContactCard ───────────────────────────────────────────────────────
// Field names match backend: outreach_method, outreach_date, response_status, follow_up_date, role
function ContactCard({ c, onDelete }) {
  const r = RESPONSE_PILL[c.response_status] ?? RESPONSE_PILL['no_response']
  const initials = c.name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
  const hue = (c.name.charCodeAt(0) * 47) % 360
  const avatarBg = `linear-gradient(135deg, oklch(0.55 0.1 ${hue}), oklch(0.4 0.1 ${(hue + 40) % 360}))`
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const followupUrgent = c.follow_up_date
    ? (new Date(c.follow_up_date + 'T00:00:00') - today) / 86400000 <= 4
    : false

  return (
    <div className="entry">
      <div className="entry-row">
        <div className="entry-avatar" style={{ background: avatarBg }}>{initials}</div>
        <div className="entry-title-wrap">
          <div className="entry-name">{c.name}</div>
          {c.role && <div className="entry-sub">{c.role}</div>}
        </div>
        <div className="entry-method" title={c.outreach_method}>
          {METHOD_ICON[c.outreach_method] ?? METHOD_ICON.Other}
        </div>
        <button className="entry-delete" onClick={onDelete} aria-label="Delete contact">
          <TrashIcon />
        </button>
      </div>
      {c.notes && <div className="entry-notes">{c.notes}</div>}
      <div className="entry-foot">
        <div className="entry-meta">
          {c.outreach_date && (
            <span className="icon-pair mono"><CalIconDr /> {fmtRel(c.outreach_date)}</span>
          )}
          {c.follow_up_date && (
            <span className={`followup${followupUrgent ? ' urgent' : ''}`}>
              <BellIconDr /> Follow up {fmtRel(c.follow_up_date)}
            </span>
          )}
        </div>
        <span className={`pill ${r.cls}`}>
          <span className="stat-dot" style={{ width: 5, height: 5, flex: '0 0 5px', background: 'currentColor' }} />
          {r.label}
        </span>
      </div>
    </div>
  )
}

// ── InterviewCard ─────────────────────────────────────────────────────
// Field names match backend: scheduled_date, round, outcome
function InterviewCard({ iv, onDelete }) {
  const o = OUTCOME_PILL[iv.outcome] ?? OUTCOME_PILL.pending

  return (
    <div className="entry">
      <div className="entry-row">
        <div className="entry-method">{ROUND_ICON[iv.round] ?? <StarIcon />}</div>
        <div className="entry-title-wrap">
          <div className="entry-name">{iv.round}</div>
          {iv.scheduled_date && (
            <div className="entry-sub mono">{fmtFullDate(iv.scheduled_date)} · {fmtRel(iv.scheduled_date)}</div>
          )}
        </div>
        <span className={`pill ${o.cls}`}>
          <span className="stat-dot" style={{ width: 5, height: 5, flex: '0 0 5px', background: 'currentColor' }} />
          {o.label}
        </span>
        <button className="entry-delete" onClick={onDelete} aria-label="Delete interview">
          <TrashIcon />
        </button>
      </div>
      {iv.notes && <div className="entry-notes">{iv.notes}</div>}
    </div>
  )
}

// ── JobDrawer ─────────────────────────────────────────────────────────
export default function JobDrawer({ job, onClose, onEdit }) {
  const [tab, setTab]                       = useState('contacts')
  const [contacts, setContacts]             = useState([])
  const [interviews, setInterviews]         = useState([])
  const [showContactForm, setShowContactForm]   = useState(false)
  const [showInterviewForm, setShowInterviewForm] = useState(false)
  const closeRef    = useRef(null)
  const prevFocusRef = useRef(null)

  // Focus management: capture prior focus, move to close button, restore on unmount
  useEffect(() => {
    prevFocusRef.current = document.activeElement
    closeRef.current?.focus()
    return () => prevFocusRef.current?.focus()
  }, [])

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Load contacts and interviews when job changes
  useEffect(() => {
    setContacts([])
    setInterviews([])
    setShowContactForm(false)
    setShowInterviewForm(false)
    client.get(`/jobs/${job.id}/contacts`).then(r => setContacts(r.data)).catch(() => setContacts([]))
    client.get(`/jobs/${job.id}/interviews`).then(r => setInterviews(r.data)).catch(() => setInterviews([]))
  }, [job.id])

  // Reset the form state when switching tabs
  function switchTab(t) {
    setTab(t)
    setShowContactForm(false)
    setShowInterviewForm(false)
  }

  function handleAddContact(contact) {
    setContacts(prev => [...prev, contact])
    setShowContactForm(false)
  }

  async function handleDeleteContact(contactId) {
    await client.delete(`/jobs/${job.id}/contacts/${contactId}`)
    setContacts(prev => prev.filter(c => c.id !== contactId))
  }

  function handleAddInterview(interview) {
    setInterviews(prev => [...prev, interview])
    setShowInterviewForm(false)
  }

  async function handleDeleteInterview(interviewId) {
    await client.delete(`/jobs/${job.id}/interviews/${interviewId}`)
    setInterviews(prev => prev.filter(iv => iv.id !== interviewId))
  }

  const initial  = (job.company?.[0] ?? '?').toUpperCase()
  const salary   = fmtSalary(job.salary_min, job.salary_max)
  const location = job.location || (job.url ? job.url.replace(/^https?:\/\//, '').split('/')[0] : null)
  const statusCls = job.status.toLowerCase()

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`${job.company} — ${job.role}`}
      >
        {/* ── header ── */}
        <header className="dr-hd">
          <div className="dr-logo" style={logoStyle(job.company)}>{initial}</div>
          <div className="dr-hd-text">
            <div className="dr-hd-company">
              {job.company}
              <span className={`status-badge ${statusCls}`}>
                <span className="stat-dot" style={{ width: 5, height: 5, flex: '0 0 5px', background: 'currentColor' }} />
                {job.status}
              </span>
            </div>
            <div className="dr-hd-role">{job.role}</div>
            <div className="dr-hd-meta">
              {salary   && <span className="salary">{salary}</span>}
              {location && <span>· {location}</span>}
              {job.date_applied && <span>· Applied {fmtRel(job.date_applied)}</span>}
            </div>
          </div>
          <button className="dr-edit" onClick={() => onEdit(job)} aria-label="Edit job">
            <EditIcon /> Edit
          </button>
          <button ref={closeRef} className="dr-close" onClick={onClose} aria-label="Close drawer">
            <CloseIconDr />
          </button>
        </header>

        {/* ── tabs ── */}
        <nav className="dr-tabs">
          <div
            className={`dr-tab${tab === 'contacts' ? ' active' : ''}`}
            role="tab"
            aria-selected={tab === 'contacts'}
            onClick={() => switchTab('contacts')}
          >
            Contacts <span className="count">{contacts.length}</span>
          </div>
          <div
            className={`dr-tab${tab === 'interviews' ? ' active' : ''}`}
            role="tab"
            aria-selected={tab === 'interviews'}
            onClick={() => switchTab('interviews')}
          >
            Interviews <span className="count">{interviews.length}</span>
          </div>
        </nav>

        {/* ── body ── */}
        <div className="dr-body">
          {tab === 'contacts' && (
            <>
              {contacts.length === 0 && !showContactForm && (
                <div className="dr-empty">No contacts yet. Add a referral or recruiter to track outreach.</div>
              )}
              {contacts.map(c => (
                <ContactCard key={c.id} c={c} onDelete={() => handleDeleteContact(c.id)} />
              ))}
              {showContactForm ? (
                <AddContactForm
                  jobId={job.id}
                  onAdd={handleAddContact}
                  onCancel={() => setShowContactForm(false)}
                />
              ) : (
                <div className="dr-add" onClick={() => setShowContactForm(true)}>
                  <PlusIconDr /> Add contact
                </div>
              )}
            </>
          )}

          {tab === 'interviews' && (
            <>
              {interviews.length === 0 && !showInterviewForm && (
                <div className="dr-empty">No interview rounds logged. Add one as you progress through the pipeline.</div>
              )}
              {interviews.map(iv => (
                <InterviewCard key={iv.id} iv={iv} onDelete={() => handleDeleteInterview(iv.id)} />
              ))}
              {showInterviewForm ? (
                <AddInterviewForm
                  jobId={job.id}
                  onAdd={handleAddInterview}
                  onCancel={() => setShowInterviewForm(false)}
                />
              ) : (
                <div className="dr-add" onClick={() => setShowInterviewForm(true)}>
                  <PlusIconDr /> Add interview
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  )
}
