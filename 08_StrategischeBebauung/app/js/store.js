// store.js — Reactive application store (Vue 3 Composition API)
import { reactive, watch, computed, toRaw } from 'vue'

const STORAGE_KEY = 'ea-bebauungsplan-v1'
let debounceTimer = null

// ────────────────────────────────────────────
// Default state shape
// ────────────────────────────────────────────
function createEmptyState () {
  return {
    meta: { version: '1.0', lastUpdated: '', owner: '', company: '', description: '' },
    domains: [],
    applications: [],
    capabilityMappings: [],
    projects: [],
    projectDependencies: [],
    managementKPIs: [],
    vendors: [],
    e2eProcesses: [],
    demands: [],
    integrations: [],
    enums: {}
  }
}

// ────────────────────────────────────────────
// Reactive store
// ────────────────────────────────────────────
export const store = reactive({
  data: createEmptyState(),
  loaded: false,
  sidebarOpen: true,
  darkMode: localStorage.getItem('ea-dark-mode') === 'true',

  // ── Getters (computed-like but on reactive) ──

  get totalApps () { return this.data.applications.length },
  get totalProjects () { return this.data.projects.length },
  get totalVendors () { return (this.data.vendors || []).length },

  get totalCapabilities () {
    return this.data.domains.reduce((n, d) => n + d.capabilities.length, 0)
  },

  get totalSubCapabilities () {
    return this.data.domains.reduce((n, d) =>
      n + d.capabilities.reduce((m, c) => m + (c.subCapabilities ? c.subCapabilities.length : 0), 0), 0)
  },

  get avgMaturity () {
    let sum = 0; let count = 0
    this.data.domains.forEach(d => d.capabilities.forEach(c => { sum += c.maturity; count++ }))
    return count ? +(sum / count).toFixed(1) : 0
  },

  get totalBudget () {
    return this.data.projects.reduce((s, p) => s + (p.budget || 0), 0)
  },

  get timeDistribution () {
    const dist = { Invest: 0, Tolerate: 0, Migrate: 0, Eliminate: 0 }
    this.data.applications.forEach(a => { if (dist[a.timeQuadrant] !== undefined) dist[a.timeQuadrant]++ })
    return dist
  },

  get projectStatusCounts () {
    const c = { green: 0, yellow: 0, red: 0 }
    this.data.projects.forEach(p => { if (c[p.status] !== undefined) c[p.status]++ })
    return c
  },

  get avgTargetMaturity () {
    let sum = 0; let count = 0
    this.data.domains.forEach(d => d.capabilities.forEach(c => {
      if (c.targetMaturity) { sum += c.targetMaturity; count++ }
    }))
    return count ? +(sum / count).toFixed(1) : 0
  },

  get maturityGaps () {
    const gaps = []
    this.data.domains.forEach(d => d.capabilities.forEach(c => {
      const gap = (c.targetMaturity || c.maturity) - c.maturity
      if (gap > 0) gaps.push({ capId: c.id, capName: c.name, domainName: d.name, domainColor: d.color, current: c.maturity, target: c.targetMaturity, gap })
    }))
    return gaps.sort((a, b) => b.gap - a.gap)
  },

  // ── Domain helpers ──

  domainById (id) {
    return this.data.domains.find(d => d.id === Number(id))
  },

  capabilityById (capId) {
    for (const d of this.data.domains) {
      const c = d.capabilities.find(cap => cap.id === capId)
      if (c) return { ...c, domain: d }
    }
    return null
  },

  domainForCapability (capId) {
    return this.data.domains.find(d => d.capabilities.some(c => c.id === capId))
  },

  // ── Application CRUD ──

  appById (id) {
    return this.data.applications.find(a => a.id === id)
  },

  addApp (app) {
    app.id = app.id || 'APP-' + String(this.data.applications.length + 1).padStart(3, '0')
    this.data.applications.push(app)
  },

  updateApp (id, patch) {
    const idx = this.data.applications.findIndex(a => a.id === id)
    if (idx !== -1) Object.assign(this.data.applications[idx], patch)
  },

  deleteApp (id) {
    this.data.applications = this.data.applications.filter(a => a.id !== id)
    this.data.capabilityMappings = this.data.capabilityMappings.filter(m => m.applicationId !== id)
    this.data.projects.forEach(p => {
      if (p.affectedApps) p.affectedApps = p.affectedApps.filter(a => a.appId !== id)
    })
  },

  appsForCapability (capId) {
    const mappings = this.data.capabilityMappings.filter(m => m.capabilityId === capId)
    return mappings.map(m => ({
      ...this.appById(m.applicationId),
      role: m.role
    })).filter(a => a.id)
  },

  capabilitiesForApp (appId) {
    const mappings = this.data.capabilityMappings.filter(m => m.applicationId === appId)
    return mappings.map(m => ({
      ...this.capabilityById(m.capabilityId),
      role: m.role
    })).filter(c => c)
  },

  // ── Mapping CRUD ──

  addMapping (capId, appId, role = 'Primary') {
    const exists = this.data.capabilityMappings.find(m => m.capabilityId === capId && m.applicationId === appId)
    if (!exists) this.data.capabilityMappings.push({ capabilityId: capId, applicationId: appId, role })
  },

  removeMapping (capId, appId) {
    this.data.capabilityMappings = this.data.capabilityMappings.filter(
      m => !(m.capabilityId === capId && m.applicationId === appId)
    )
  },

  // ── Project CRUD ──

  projectById (id) {
    return this.data.projects.find(p => p.id === id)
  },

  addProject (proj) {
    proj.id = proj.id || 'PRJ-' + String(this.data.projects.length + 1).padStart(3, '0')
    this.data.projects.push(proj)
  },

  updateProject (id, patch) {
    const idx = this.data.projects.findIndex(p => p.id === id)
    if (idx !== -1) Object.assign(this.data.projects[idx], patch)
  },

  deleteProject (id) {
    this.data.projects = this.data.projects.filter(p => p.id !== id)
    this.data.projectDependencies = this.data.projectDependencies.filter(
      d => d.sourceProjectId !== id && d.targetProjectId !== id
    )
  },

  depsForProject (id) {
    return this.data.projectDependencies.filter(d => d.sourceProjectId === id || d.targetProjectId === id)
  },

  projectsForDomain (domainId) {
    return this.data.projects.filter(p =>
      p.primaryDomain === Number(domainId) ||
      (p.secondaryDomains && p.secondaryDomains.includes(Number(domainId)))
    )
  },

  // ── Dependency CRUD ──

  addDependency (dep) {
    this.data.projectDependencies.push(dep)
  },

  removeDependency (sourceId, targetId) {
    this.data.projectDependencies = this.data.projectDependencies.filter(
      d => !(d.sourceProjectId === sourceId && d.targetProjectId === targetId)
    )
  },

  // ── Domain CRUD ──

  addDomain (domain) {
    const maxId = this.data.domains.reduce((m, d) => Math.max(m, d.id), 0)
    domain.id = maxId + 1
    if (!domain.capabilities) domain.capabilities = []
    if (!domain.kpis) domain.kpis = []
    this.data.domains.push(domain)
    return domain.id
  },

  updateDomain (id, patch) {
    const d = this.domainById(id)
    if (d) Object.assign(d, patch)
  },

  deleteDomain (id) {
    const d = this.domainById(id)
    if (!d) return
    const capIds = d.capabilities.map(c => c.id)
    this.data.capabilityMappings = this.data.capabilityMappings.filter(m => !capIds.includes(m.capabilityId))
    this.data.projects.forEach(p => {
      if (p.primaryDomain === Number(id)) p.primaryDomain = null
      if (p.secondaryDomains) p.secondaryDomains = p.secondaryDomains.filter(x => x !== Number(id))
      if (p.capabilities) p.capabilities = p.capabilities.filter(c => !capIds.includes(c))
    })
    this.data.e2eProcesses?.forEach(proc => {
      if (proc.domains) proc.domains = proc.domains.filter(x => x !== Number(id))
    })
    this.data.domains = this.data.domains.filter(d => d.id !== Number(id))
  },

  // ── Capability CRUD ──

  addCapability (domainId, cap) {
    const d = this.domainById(domainId)
    if (!d) return
    const nextIdx = d.capabilities.length + 1
    cap.id = cap.id || `${d.id}.${nextIdx}`
    if (!cap.subCapabilities) cap.subCapabilities = []
    if (cap.targetMaturity === undefined) cap.targetMaturity = cap.maturity || 1
    d.capabilities.push(cap)
  },

  updateCapability (capId, patch) {
    for (const d of this.data.domains) {
      const c = d.capabilities.find(cap => cap.id === capId)
      if (c) { Object.assign(c, patch); return }
    }
  },

  deleteCapability (capId) {
    this.data.capabilityMappings = this.data.capabilityMappings.filter(m => m.capabilityId !== capId)
    this.data.projects.forEach(p => {
      if (p.capabilities) p.capabilities = p.capabilities.filter(c => c !== capId)
    })
    for (const d of this.data.domains) {
      const idx = d.capabilities.findIndex(c => c.id === capId)
      if (idx !== -1) { d.capabilities.splice(idx, 1); return }
    }
  },

  addSubCapability (capId, sub) {
    for (const d of this.data.domains) {
      const c = d.capabilities.find(cap => cap.id === capId)
      if (c) {
        if (!c.subCapabilities) c.subCapabilities = []
        const nextIdx = c.subCapabilities.length + 1
        sub.id = sub.id || `${capId}.${nextIdx}`
        c.subCapabilities.push(sub)
        return
      }
    }
  },

  deleteSubCapability (capId, subId) {
    for (const d of this.data.domains) {
      const c = d.capabilities.find(cap => cap.id === capId)
      if (c && c.subCapabilities) {
        c.subCapabilities = c.subCapabilities.filter(s => s.id !== subId)
        return
      }
    }
  },

  // ── E2E Process CRUD ──

  processById (id) {
    return (this.data.e2eProcesses || []).find(p => p.id === id)
  },

  addProcess (proc) {
    if (!this.data.e2eProcesses) this.data.e2eProcesses = []
    this.data.e2eProcesses.push(proc)
  },

  updateProcess (id, patch) {
    const p = this.processById(id)
    if (p) Object.assign(p, patch)
  },

  deleteProcess (id) {
    if (!this.data.e2eProcesses) return
    this.data.e2eProcesses = this.data.e2eProcesses.filter(p => p.id !== id)
  },

  processesForDomain (domainId) {
    return (this.data.e2eProcesses || []).filter(p => p.domains && p.domains.includes(Number(domainId)))
  },

  /** Derive applications involved in an E2E process via domain→capability→mapping chain */
  appsForProcess (processId) {
    const proc = this.processById(processId)
    if (!proc || !proc.domains) return []
    const appMap = new Map()
    proc.domains.forEach(domId => {
      const d = this.domainById(domId)
      if (!d) return
      d.capabilities.forEach(cap => {
        const mappings = this.data.capabilityMappings.filter(m => m.capabilityId === cap.id)
        mappings.forEach(m => {
          const app = this.appById(m.applicationId)
          if (app && !appMap.has(app.id)) {
            appMap.set(app.id, { ...app, roles: new Set(), capCount: 0 })
          }
          if (app && appMap.has(app.id)) {
            appMap.get(app.id).roles.add(m.role)
            appMap.get(app.id).capCount++
          }
        })
      })
    })
    return Array.from(appMap.values()).map(a => ({
      ...a, roles: Array.from(a.roles).join(', ')
    })).sort((a, b) => b.capCount - a.capCount)
  },

  /** Find all E2E processes that touch an application (derived via mapping chain) */
  processesForApp (appId) {
    const capMappings = this.data.capabilityMappings.filter(m => m.applicationId === appId)
    const domainIds = new Set()
    capMappings.forEach(m => {
      const d = this.domainForCapability(m.capabilityId)
      if (d) domainIds.add(d.id)
    })
    return (this.data.e2eProcesses || []).filter(p =>
      p.domains && p.domains.some(did => domainIds.has(did))
    )
  },

  // ── Vendor CRUD ──

  vendorById (id) {
    return (this.data.vendors || []).find(v => v.id === id)
  },

  addVendor (vendor) {
    if (!this.data.vendors) this.data.vendors = []
    vendor.id = vendor.id || 'VND-' + String(this.data.vendors.length + 1).padStart(3, '0')
    this.data.vendors.push(vendor)
  },

  updateVendor (id, patch) {
    const v = this.vendorById(id)
    if (v) Object.assign(v, patch)
  },

  deleteVendor (id) {
    if (!this.data.vendors) return
    this.data.vendors = this.data.vendors.filter(v => v.id !== id)
  },

  /** Find all applications that reference this vendor (by vendor name match or vendorId) */
  appsForVendor (vendorId) {
    const vendor = this.vendorById(vendorId)
    if (!vendor) return []
    return this.data.applications.filter(a => a.vendor === vendor.name || a.vendorId === vendorId)
  },

  /** Find the vendor record for a given application */
  vendorForApp (appId) {
    const app = this.appById(appId)
    if (!app) return null
    if (app.vendorId) return this.vendorById(app.vendorId)
    return (this.data.vendors || []).find(v => v.name === app.vendor)
  },

  // ── Demand CRUD ──

  get totalDemands () { return (this.data.demands || []).length },

  demandById (id) {
    return (this.data.demands || []).find(d => d.id === id)
  },

  addDemand (demand) {
    if (!this.data.demands) this.data.demands = []
    if (!demand.id) {
      const maxNum = this.data.demands.reduce((m, d) => {
        const n = parseInt(d.id.replace('DEM-', ''), 10)
        return isNaN(n) ? m : Math.max(m, n)
      }, 0)
      demand.id = 'DEM-' + String(maxNum + 1).padStart(3, '0')
    }
    this.data.demands.push(demand)
  },

  updateDemand (id, patch) {
    const d = this.demandById(id)
    if (d) Object.assign(d, patch)
  },

  deleteDemand (id) {
    if (!this.data.demands) return
    this.data.demands = this.data.demands.filter(d => d.id !== id)
  },

  demandsForDomain (domainId) {
    return (this.data.demands || []).filter(d =>
      d.primaryDomain === Number(domainId) ||
      (d.relatedDomains && d.relatedDomains.includes(Number(domainId)))
    )
  },

  demandsForApp (appId) {
    return (this.data.demands || []).filter(d =>
      d.relatedApps && d.relatedApps.includes(appId)
    )
  },

  demandsForVendor (vendorId) {
    return (this.data.demands || []).filter(d =>
      d.relatedVendors && d.relatedVendors.includes(vendorId)
    )
  },

  // ── Integration CRUD ──

  integrationById (id) {
    return (this.data.integrations || []).find(i => i.id === id)
  },

  addIntegration (integration) {
    if (!this.data.integrations) this.data.integrations = []
    if (!integration.id) {
      const maxNum = this.data.integrations.reduce((m, i) => {
        const n = parseInt(i.id.replace('INT-', ''), 10)
        return isNaN(n) ? m : Math.max(m, n)
      }, 0)
      integration.id = 'INT-' + String(maxNum + 1).padStart(3, '0')
    }
    this.data.integrations.push(integration)
  },

  updateIntegration (id, patch) {
    const i = this.integrationById(id)
    if (i) Object.assign(i, patch)
  },

  deleteIntegration (id) {
    if (!this.data.integrations) return
    this.data.integrations = this.data.integrations.filter(i => i.id !== id)
  },

  integrationsForApp (appId) {
    return (this.data.integrations || []).filter(i =>
      i.sourceAppId === appId || i.targetAppId === appId
    )
  },

  // ── Management KPI CRUD ──

  updateManagementKPI (id, patch) {
    const kpi = (this.data.managementKPIs || []).find(k => k.id === id)
    if (kpi) Object.assign(kpi, patch)
  },

  // ── Global Full-Text Search ──

  globalSearch (query) {
    if (!query || !query.trim()) return []
    const q = query.trim().toLowerCase()
    const results = []

    // Applications
    ;(this.data.applications || []).forEach(a => {
      const fields = [a.id, a.name, a.vendor, a.category, a.type, a.description, a.businessOwner, a.itOwner, a.criticality, a.timeQuadrant].filter(Boolean).join(' ')
      if (fields.toLowerCase().includes(q)) {
        results.push({ type: 'Application', id: a.id, name: a.name, detail: [a.vendor, a.category].filter(Boolean).join(' · '), route: '/apps/' + a.id })
      }
    })

    // Domains
    ;(this.data.domains || []).forEach(d => {
      const fields = [d.name, d.description, d.domainOwner, d.strategicFocus, d.vision].filter(Boolean).join(' ')
      if (fields.toLowerCase().includes(q)) {
        results.push({ type: 'Domain', id: d.id, name: d.name, detail: d.domainOwner || '', route: '/domains/' + d.id })
      }
      // Capabilities within domain
      ;(d.capabilities || []).forEach(c => {
        const cFields = [c.id, c.name, c.description].filter(Boolean).join(' ')
        if (cFields.toLowerCase().includes(q)) {
          results.push({ type: 'Capability', id: c.id, name: c.name, detail: d.name, route: '/domains/' + d.id })
        }
      })
    })

    // Projects
    ;(this.data.projects || []).forEach(p => {
      const fields = [p.id, p.name, p.category, p.sponsor, p.projectLead, p.statusText, p.strategicContribution].filter(Boolean).join(' ')
      if (fields.toLowerCase().includes(q)) {
        results.push({ type: 'Project', id: p.id, name: p.name, detail: [p.category, p.status].filter(Boolean).join(' · '), route: '/projects/' + p.id })
      }
    })

    // Vendors
    ;(this.data.vendors || []).forEach(v => {
      const fields = [v.id, v.name, v.category, v.description, v.contactPerson, v.vendorManager].filter(Boolean).join(' ')
      if (fields.toLowerCase().includes(q)) {
        results.push({ type: 'Vendor', id: v.id, name: v.name, detail: v.category || '', route: '/vendors/' + v.id })
      }
    })

    // E2E Processes
    ;(this.data.e2eProcesses || []).forEach(p => {
      const fields = [p.id, p.name, p.owner, p.description].filter(Boolean).join(' ')
      if (fields.toLowerCase().includes(q)) {
        results.push({ type: 'Process', id: p.id, name: p.name, detail: p.owner || '', route: '/processes/' + p.id })
      }
    })

    // Demands
    ;(this.data.demands || []).forEach(d => {
      const fields = [d.id, d.title, d.description, d.category, d.status, d.requestedBy, d.businessCase].filter(Boolean).join(' ')
      if (fields.toLowerCase().includes(q)) {
        results.push({ type: 'Demand', id: d.id, name: d.title, detail: [d.category, d.status].filter(Boolean).join(' · '), route: '/demands/' + d.id })
      }
    })

    return results
  }
})

// ────────────────────────────────────────────
// Persistence — localStorage with debounce
// ────────────────────────────────────────────
function persist () {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    try {
      const raw = JSON.parse(JSON.stringify(store.data))
      raw.meta.lastUpdated = new Date().toISOString()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(raw))
    } catch (e) {
      console.warn('[store] persist failed', e)
    }
  }, 500)
}

// Watch deeply and auto-persist
export function startWatching () {
  watch(() => store.data, persist, { deep: true })
  watch(() => store.darkMode, (v) => {
    localStorage.setItem('ea-dark-mode', v)
    document.documentElement.classList.toggle('dark', v)
  })
}

// ────────────────────────────────────────────
// Load — from localStorage or seed JSON
// ────────────────────────────────────────────
export async function loadData () {
  // 1. Try localStorage
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      store.data = JSON.parse(saved)
      store.loaded = true
      return
    } catch (e) {
      console.warn('[store] corrupt localStorage, loading seed', e)
    }
  }

  // 2. Fetch seed file
  try {
    const res = await fetch('./data/bebauungsplan.json')
    if (!res.ok) throw new Error(res.statusText)
    store.data = await res.json()
    store.loaded = true
    persist() // save initial seed to localStorage
  } catch (e) {
    console.error('[store] failed to load seed data', e)
    store.data = createEmptyState()
    store.loaded = true
  }
}

// ────────────────────────────────────────────
// Import / Export / Reset
// ────────────────────────────────────────────
export function exportJSON () {
  const raw = JSON.parse(JSON.stringify(store.data))
  raw.meta.lastUpdated = new Date().toISOString()
  const blob = new Blob([JSON.stringify(raw, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bebauungsplan_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importJSON (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        store.data = data
        persist()
        resolve()
      } catch (e) { reject(e) }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export function resetToSeed () {
  localStorage.removeItem(STORAGE_KEY)
  return loadData()
}
