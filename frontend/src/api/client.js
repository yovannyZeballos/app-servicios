import axios from 'axios'
import toast from 'react-hot-toast'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach access token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue  = []

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config
    const mensaje =
      err.response?.data?.mensaje ||
      err.response?.data?.errores?.[0]?.mensaje ||
      'Error de conexión con el servidor'

    if (err.response?.status === 401 && !originalRequest._retry) {
      // Don't attempt refresh if this request IS the refresh endpoint
      if (originalRequest.url === '/auth/refresh') {
        clearSession()
        return Promise.reject(err)
      }

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        clearSession()
        return Promise.reject(err)
      }

      // Queue subsequent requests while a refresh is in progress
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return client(originalRequest)
          })
          .catch((e) => Promise.reject(e))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await client.post('/auth/refresh', { refreshToken })
        const { accessToken } = res.data
        localStorage.setItem('token', accessToken)
        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return client(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        clearSession()
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    if (err.response?.status !== 401) {
      toast.error(mensaje)
    }
    return Promise.reject(err)
  },
)

export default client
