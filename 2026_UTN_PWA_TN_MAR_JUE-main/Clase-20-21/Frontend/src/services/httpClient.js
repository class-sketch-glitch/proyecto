import asyncHandler from '../helpers/asyncHandler.js'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

async function _httpClient(endpoint, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json()
  return data
}

const httpClient = asyncHandler(_httpClient)
export default httpClient