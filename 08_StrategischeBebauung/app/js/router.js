// router.js — Minimal hash-based SPA router
import { reactive } from 'vue'

export const router = reactive({
  path: '',
  params: {},
  query: {}
})

// Route definitions: pattern → component name
const routes = [
  { pattern: /^\/$/,                        component: 'dashboard-view' },
  { pattern: /^\/domains$/,                 component: 'domain-list' },
  { pattern: /^\/domains\/(\d+)$/,          component: 'domain-detail',   paramNames: ['id'] },
  { pattern: /^\/apps$/,                    component: 'app-list' },
  { pattern: /^\/apps\/(APP-\d+)$/,         component: 'app-detail',      paramNames: ['id'] },
  { pattern: /^\/capability-matrix$/,       component: 'cap-app-matrix' },
  { pattern: /^\/time$/,                    component: 'time-quadrant' },
  { pattern: /^\/projects$/,                component: 'project-list' },
  { pattern: /^\/projects\/(PRJ-\d+)$/,     component: 'project-detail',   paramNames: ['id'] },
  { pattern: /^\/project-heatmap$/,         component: 'project-heatmap' },
  { pattern: /^\/dependencies$/,            component: 'dependency-graph' },
  { pattern: /^\/processes$/,               component: 'process-list' },
  { pattern: /^\/processes\/([A-Za-z0-9]+)$/, component: 'process-detail', paramNames: ['id'] },
  { pattern: /^\/vendors$/,                  component: 'vendor-list' },
  { pattern: /^\/vendors\/(VND-\d+)$/,       component: 'vendor-detail',   paramNames: ['id'] },
  { pattern: /^\/demands$/,                   component: 'demand-list' },
  { pattern: /^\/demands\/(DEM-\d+)$/,        component: 'demand-detail',   paramNames: ['id'] },
  { pattern: /^\/demand-pipeline$/,            component: 'demand-pipeline' },
  { pattern: /^\/budget-dashboard$/,            component: 'budget-dashboard' },
  { pattern: /^\/maturity-gap$/,            component: 'maturity-gap' },
  { pattern: /^\/roadmap$/,                component: 'roadmap-view' },
  { pattern: /^\/executive-summary$/,      component: 'executive-summary' },
  { pattern: /^\/settings$/,               component: 'settings-view' }
]

function resolve () {
  const hash = window.location.hash.slice(1) || '/'
  const [pathPart, queryPart] = hash.split('?')
  const path = pathPart || '/'

  // Parse query string
  const query = {}
  if (queryPart) {
    queryPart.split('&').forEach(p => {
      const [k, v] = p.split('=')
      query[decodeURIComponent(k)] = decodeURIComponent(v || '')
    })
  }

  // Match route
  for (const r of routes) {
    const match = path.match(r.pattern)
    if (match) {
      const params = {}
      if (r.paramNames) {
        r.paramNames.forEach((name, i) => { params[name] = match[i + 1] })
      }
      router.path = path
      router.params = params
      router.query = query
      router.component = r.component
      return
    }
  }

  // 404 fallback → dashboard
  router.path = '/'
  router.params = {}
  router.query = query
  router.component = 'dashboard-view'
}

export function navigateTo (path) {
  window.location.hash = '#' + path
}

export function initRouter () {
  window.addEventListener('hashchange', resolve)
  resolve()
}

// Navigation helper for templates
export function linkTo (path) {
  return '#' + path
}
