import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: attach access token ──────────────────────────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartshine_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: silent token refresh on 401 ────────────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return client(original)
          })
          .catch((err) => Promise.reject(err))
      }

      original._retry = true
      isRefreshing = true

      const refresh = localStorage.getItem('smartshine_refresh')
      if (!refresh) {
        isRefreshing = false
        localStorage.removeItem('smartshine_access')
        localStorage.removeItem('smartshine_refresh')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post('http://localhost:8000/api/token/refresh/', { refresh })
        localStorage.setItem('smartshine_access', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        processQueue(null, data.access)
        return client(original)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('smartshine_access')
        localStorage.removeItem('smartshine_refresh')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default client
