import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client, { getErrorMessage } from '../api/client'

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
      navigate('/')
    } catch (err) {
      localStorage.removeItem('access_token')
      setError(getErrorMessage(err, 'Login failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-2">JobTrackr</h1>
        <p className="text-gray-400 text-center mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 space-y-5 border border-gray-700">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
