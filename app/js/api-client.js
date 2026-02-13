// api-client.js — HTTP client with JWT support for server mode
// In standalone mode (file:// or no server), this module is not used.
import { reactive } from 'vue'

const API_BASE = '/api'

// ────────────────────────────────────────────
// Auth state (reactive so Vue components can watch it)
// ────────────────────────────────────────────
export const auth = reactive({
  accessToken: null,
  refreshToken: null,
  user: null,       // { id, email, name, role }
  isLoggedIn: false,
  isAdmin: false,
  isEditor: false
})

function updateAuthState () {
  auth.isLoggedIn = !!auth.accessToken
  auth.isAdmin = auth.user?.role === 'admin'
  auth.isEditor = auth.user?.role === 'editor' || auth.isAdmin
}

// ────────────────────────────────────────────
// Token persistence (sessionStorage for security)
// ────────────────────────────────────────────
function saveTokens () {
  if (auth.accessToken) sessionStorage.setItem('ea-access-token', auth.accessToken)
  if (auth.refreshToken) sessionStorage.setItem('ea-refresh-token', auth.refreshToken)
  if (auth.user) sessionStorage.setItem('ea-user', JSON.stringify(auth.user))
}

function loadTokens () {
  auth.accessToken = sessionStorage.getItem('ea-access-token')
  auth.refreshToken = sessionStorage.getItem('ea-refresh-token')
  try { auth.user = JSON.parse(sessionStorage.getItem('ea-user')) } catch { auth.user = null }
  updateAuthState()
}

function clearTokens () {
  auth.accessToken = null
  auth.refreshToken = null
  auth.user = null
  sessionStorage.removeItem('ea-access-token')
  sessionStorage.removeItem('ea-refresh-token')
  sessionStorage.removeItem('ea-user')
  updateAuthState()
}

// Load on module init
loadTokens()

// ────────────────────────────────────────────
// Toast notification system
// ────────────────────────────────────────────
export const toasts = reactive([])
let toastId = 0

export function addToast (message, type = 'info', duration = 4000) {
  const id = ++toastId
  toasts.push({ id, message, type })
  if (duration > 0) setTimeout(() => removeToast(id), duration)
}

export function removeToast (id) {
  const idx = toasts.findIndex(t => t.id === id)
  if (idx !== -1) toasts.splice(idx, 1)
}

// ────────────────────────────────────────────
// Custom API Error class
// ────────────────────────────────────────────
export class ApiError extends Error {
  constructor (type, message, data = null) {
    super(message)
    this.type = type
    this.data = data
  }
}

// ────────────────────────────────────────────
// Core HTTP request with JWT
// ────────────────────────────────────────────
let isRefreshing = false

async function request (method, path, body = null, options = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth.accessToken) headers['Authorization'] = `Bearer ${auth.accessToken}`
  if (options.ifMatch != null) headers['If-Match'] = String(options.ifMatch)

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  })

  // 401 → try refresh once
  if (res.status === 401 && auth.refreshToken && !isRefreshing) {
    isRefreshing = true
    const refreshed = await refreshAccessToken()
    isRefreshing = false
    if (refreshed) return request(method, path, body, options)
    clearTokens()
    window.location.hash = '#/login'
    throw new ApiError('AUTH_EXPIRED', 'Session expired')
  }

  // 409 → Optimistic Locking conflict
  if (res.status === 409) {
    const detail = await res.json().catch(() => ({}))
    throw new ApiError('CONFLICT', detail.detail || 'Conflict: entity was modified by another user', detail)
  }

  // 403 → Forbidden
  if (res.status === 403) {
    throw new ApiError('FORBIDDEN', 'Forbidden')
  }

  // Other errors
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new ApiError('HTTP_ERROR', text)
  }

  // 204 No Content
  if (res.status === 204) return null
  return res.json()
}

// ────────────────────────────────────────────
// Auth API
// ────────────────────────────────────────────
export async function login (email, password) {
  const data = await request('POST', '/auth/login', { email, password })
  auth.accessToken = data.access_token
  auth.refreshToken = data.refresh_token
  auth.user = { id: data.user_id, email: data.email, name: data.name, role: data.role }
  updateAuthState()
  saveTokens()
  return auth.user
}

async function refreshAccessToken () {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: auth.refreshToken })
    })
    if (!res.ok) return false
    const data = await res.json()
    auth.accessToken = data.access_token
    saveTokens()
    return true
  } catch {
    return false
  }
}

export function logout () {
  clearTokens()
  window.location.hash = '#/login'
}

export async function fetchMe () {
  const data = await request('GET', '/auth/me')
  auth.user = { id: data.id, email: data.email, name: data.name, role: data.role }
  updateAuthState()
  saveTokens()
  return auth.user
}

export async function updateMe (patch) {
  return request('PUT', '/auth/me', patch)
}

// ────────────────────────────────────────────
// Admin API
// ────────────────────────────────────────────
export const adminApi = {
  listUsers: () => request('GET', '/admin/users'),
  getUser: (id) => request('GET', `/admin/users/${id}`),
  createUser: (data) => request('POST', '/admin/users', data),
  updateUser: (id, data) => request('PUT', `/admin/users/${id}`, data),
  deleteUser: (id) => request('DELETE', `/admin/users/${id}`),
  getAuditLog: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.entity_type) qs.set('entity_type', params.entity_type)
    if (params.action) qs.set('action', params.action)
    if (params.user_email) qs.set('user_email', params.user_email)
    if (params.limit) qs.set('limit', params.limit)
    if (params.offset) qs.set('offset', params.offset)
    const q = qs.toString()
    return request('GET', `/admin/audit-log${q ? '?' + q : ''}`)
  }
}

// ────────────────────────────────────────────
// Entity CRUD API (generic)
// ────────────────────────────────────────────
function entityApi (resource) {
  return {
    list: (params) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      return request('GET', `/${resource}${qs}`)
    },
    get: (id) => request('GET', `/${resource}/${id}`),
    create: (data) => request('POST', `/${resource}`, data),
    update: (id, data, version) => request('PUT', `/${resource}/${id}`, data, { ifMatch: version }),
    delete: (id) => request('DELETE', `/${resource}/${id}`)
  }
}

export const api = {
  applications: entityApi('applications'),
  domains: entityApi('domains'),
  capabilities: entityApi('capabilities'),
  projects: entityApi('projects'),
  vendors: entityApi('vendors'),
  demands: entityApi('demands'),
  integrations: entityApi('integrations'),
  processes: entityApi('processes'),
  entities: entityApi('entities'),
  compliance: entityApi('compliance'),
  kpis: entityApi('kpis'),
  mappings: entityApi('capability-mappings'),

  // Dashboard aggregation
  dashboard: {
    summary: () => request('GET', '/dashboard/summary'),
    timeDistribution: () => request('GET', '/dashboard/time-distribution'),
    appCategories: () => request('GET', '/dashboard/application-categories'),
    criticalityDistribution: () => request('GET', '/dashboard/criticality-distribution'),
    complianceStatus: () => request('GET', '/dashboard/compliance-status')
  },

  // Seed & Export
  seed: () => request('POST', '/seed'),
  exportJson: () => request('GET', '/export/json'),
  health: () => request('GET', '/health')
}

// ────────────────────────────────────────────
// Server availability check
// ────────────────────────────────────────────
export async function checkServerAvailable () {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}
