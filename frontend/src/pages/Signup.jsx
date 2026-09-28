import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client, { getErrorMessage } from '../api/client'
import AuthLayout, { InputGroup, PasswordGroup } from '../components/AuthLayout'

const HERO_STEPS = [
  { text: 'Create your account', active: true },
  { text: "Add the jobs you're tracking" },
  { text: 'Log contacts and interviews' },
]

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data: tokens } = await client.post('/auth/signup', { email, password })
      localStorage.setItem('access_token', tokens.access_token)
      const { data: user } = await client.get('/auth/me')
      login(tokens, user)
      navigate('/board')
    } catch (err) {
      localStorage.removeItem('access_token')
      setError(getErrorMessage(err, 'Sign up failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      heroTitle="Join JobTrackr"
      heroText="Three quick steps and your whole job search lives in one place."
      steps={HERO_STEPS}
      title="Create your account"
      subtitle="Just an email and a password to get started."
    >
      <form className="au-fields" onSubmit={handleSubmit}>
        {error && <div className="au-error">{error}</div>}

        <InputGroup
          id="email" label="Email" type="email" placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)}
          required autoComplete="email"
        />
        <PasswordGroup
          id="password" label="Password" placeholder="••••••••" help="At least 8 characters."
          value={password} onChange={e => setPassword(e.target.value)}
          required minLength={8} autoComplete="new-password"
        />
        <PasswordGroup
          id="confirm" label="Confirm password" placeholder="••••••••"
          value={confirm} onChange={e => setConfirm(e.target.value)}
          required minLength={8} autoComplete="new-password"
        />

        <button type="submit" className="au-submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="au-foot">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
