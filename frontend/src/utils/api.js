/**
 * utils/api.js
 * Thin wrapper around fetch for communicating with the Node backend.
 * Includes a long timeout to handle Render free-tier cold starts (up to 60s).
 */

const BASE_URL = '/api'

// Render free tier can take 30-60s to wake up — use a generous timeout
const TIMEOUT_MS = 90_000

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  )
}

async function post(path, body) {
  let res
  try {
    res = await fetchWithTimeout(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The server may be waking up — please try again in a moment.')
    }
    throw new Error('Could not reach the server. Check your connection or try again shortly.')
  }

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`)
  }
  return data
}

/** Silently ping the backend so it wakes up before the user hits Load Repo */
export async function warmUpBackend() {
  try {
    await fetch('/api/health', { method: 'GET' })
  } catch (_) {
    // ignore — this is best-effort only
  }
}

export const api = {
  loadRepo: (repoUrl) => post('/repo/load', { repoUrl }),
  query: (question) => post('/query', { question }),
}
