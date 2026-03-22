/**
 * utils/api.js
 * Thin wrapper around fetch for communicating with the Node backend.
 */

const BASE_URL = '/api'

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`)
  }
  return data
}

export const api = {
  loadRepo: (repoUrl) => post('/repo/load', { repoUrl }),
  query: (question) => post('/query', { question }),
}
