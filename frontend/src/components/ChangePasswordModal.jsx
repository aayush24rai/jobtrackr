import { useState, useEffect, useRef } from 'react'
import client, { getErrorMessage } from '../api/client'

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
)

const EMPTY = { current_password: '', new_password: '', confirm: '' }

export default function ChangePasswordModal({ onClose }) {
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)
  const firstRef = useRef(null)

  useEffect(() => { firstRef.current?.focus() }, [])

  function set(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.new_password !== form.confirm) {
      setError('New passwords do not match.')
      return
    }
    setError(''); setLoading(true)
    try {
      await client.post('/auth/change-password', {
        current_password: form.current_password,
        new_password:     form.new_password,
      })
      setDone(true)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to change password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <form className="modal modal-sm" onMouseDown={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-hd">
          <h3>Change password</h3>
          <button type="button" className="modal-close" onClick={onClose}><CloseIcon/></button>
        </div>

        {done ? (
          <>
            <div className="modal-body">
              <div className="success-banner">Your password has been updated.</div>
            </div>
            <div className="modal-ft">
              <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-body">
              {error && <div className="error-banner">{error}</div>}

              <div className="field">
                <label>Current password</label>
                <input ref={firstRef} type="password" name="current_password" value={form.current_password}
                  onChange={set} required autoComplete="current-password" />
              </div>
              <div className="field">
                <label>New password</label>
                <input type="password" name="new_password" value={form.new_password}
                  onChange={set} required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
              </div>
              <div className="field">
                <label>Confirm new password</label>
                <input type="password" name="confirm" value={form.confirm}
                  onChange={set} required minLength={8} autoComplete="new-password" />
              </div>
            </div>

            <div className="modal-ft">
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Update password'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
