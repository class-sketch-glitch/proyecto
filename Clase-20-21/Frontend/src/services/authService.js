import httpClient from './httpClient'

export const login = (email, password) =>
  httpClient('/auth/login', { method: 'POST', body: { email, password } })

export const register = (name, email, password) =>
  httpClient('/auth/register', { method: 'POST', body: { name, email, password } })

export const verifyEmail = (verification_token) =>
  httpClient(`/auth/verify-email?verification_token=${verification_token}`)
