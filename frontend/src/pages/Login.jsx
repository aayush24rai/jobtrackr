import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client, { getErrorMessage } from '../api/client'
import AuthLayout, { InputGroup, PasswordGroup } from '../components/AuthLayout'

const HERO_STEPS = [
  { text: 'Your board, sorted by stage' },
  { text: 'Interviews and follow-ups on a calendar' },
  { text: 'Insights on what gets replies' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data: tokens } = await client.post('/auth/login', { email, password })
      // Store temporarily so the interceptor includes it on the /auth/me call
      localStorage.setItem('access_token', tokens.access_token)
      const { data: user } = await client.get('/auth/me')
      login(tokens, user)
      navigate('/board')
    } catch (err) {
      localStorage.removeItem('access_token')
      setError(getErrorMessage(err, 'Login failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      heroTitle="Welcome back"
      heroText="Your board, calendar and insights are right where you left them."
      steps={HERO_STEPS}
      title="Log in to JobTrackr"
      subtitle="Enter your details to open your board."
    >
      <form className="au-fields" onSubmit={handleSubmit}>
        {error && <div className="au-error">{error}</div>}

        <InputGroup
          id="email" label="Email" type="email" placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)}
          required autoComplete="email"
        />
        <PasswordGroup
          id="password" label="Password" placeholder="••••••••"
          value={password} onChange={e => setPassword(e.target.value)}
          required autoComplete="current-password"
        />

        <button type="submit" className="au-submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="au-foot">
          New to JobTrackr? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
