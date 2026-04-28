import { configs } from '@eslint/js'
import axios from 'axios'

// create a pre-configured axios instance
// baseURL comes from .env - VITE_ prefix is required for Vite to expose it
const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})


// request interceptor - runs before every request
// this is where we inhect the authorization header automatically
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
        //bearer scheme - standard for JWT auth
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})


// response interceptor - runs after every response
// if we get a 401 our access token expired so try and refresh it
client.interceptors.response.use(
  // Success — just return the response unchanged
  (response) => response,

  // Error — check if it's a 401 and try to refresh
  async (error) => {
    const originalRequest = error.config

    // _retry flag prevents infinite loops if refresh itself fails
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          // Call refresh endpoint with the refresh token
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/refresh`,
            { refresh_token: refreshToken }
          )

          const { access_token, refresh_token } = response.data

          // Store the new tokens
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return client(originalRequest)

        } catch {
          // Refresh failed — clear tokens and redirect to login
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default client