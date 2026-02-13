// store.js — Reactive application store (Vue 3 Composition API)
import { reactive, watch, computed, toRaw } from 'vue'
import { domainTemplates } from './domain-templates.js'

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
    legalEntities: [],
    complianceAssessments: [],
    dataObjects: [],
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
  featureToggles: JSON.parse(localStorage.getItem('ea-feature-toggles') || '{"analysisEnabled":true,"governanceEnabled":true,"complianceEnabled":false,"skillImpactEnabled":true,"selectedRegulations":[]}'),

  // ── Getters (computed-like but on reactive) ──

  get totalApps () { return this.data.applications.length },
  get totalProjects () { return this.data.projects.length },
  get totalVendors () { return (this.data.vendors || []).length },
  get totalEntities () { return (this.data.legalEntities || []).length },

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

  /** Get applications for a process — direct assignment or derived via domain→capability→mapping */
  appsForProcess (processId) {
    const proc = this.processById(processId)
    if (!proc) return []

    // Direct assignment takes priority
    if (proc.applicationIds && proc.applicationIds.length > 0) {
      return proc.applicationIds.map(appId => {
        const app = this.appById(appId)
        if (!app) return null
        // Enrich with capability info
        const caps = this.capabilitiesForApp(appId)
        return { ...app, capCount: caps.length, roles: 'Direct', source: 'direct' }
      }).filter(Boolean)
    }

    // Fallback: derive from domain→capability→mapping chain
    if (!proc.domains) return []
    const appMap = new Map()
    proc.domains.forEach(domId => {
      const d = this.domainById(domId)
      if (!d) return
      d.capabilities.forEach(cap => {
        const mappings = this.data.capabilityMappings.filter(m => m.capabilityId === cap.id)
        mappings.forEach(m => {
          const app = this.appById(m.applicationId)
          if (app && !appMap.has(app.id)) {
            appMap.set(app.id, { ...app, roles: new Set(), capCount: 0, source: 'derived' })
          }
          if (app && appMap.has(app.id)) {
            appMap.get(app.id).roles.add(m.role)
            appMap.get(app.id).capCount++
          }
        })
      })
    })
    return Array.from(appMap.values()).map(a => ({
      ...a, roles: a.source === 'derived' ? Array.from(a.roles).join(', ') : a.roles
    })).sort((a, b) => b.capCount - a.capCount)
  },

  /** Check if a process uses direct app assignments */
  processHasDirectApps (processId) {
    const proc = this.processById(processId)
    return proc && proc.applicationIds && proc.applicationIds.length > 0
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

  /** Find all applications that reference this vendor (by vendors array, vendor name match or vendorId) */
  appsForVendor (vendorId) {
    const vendor = this.vendorById(vendorId)
    if (!vendor) return []
    return this.data.applications.filter(a => {
      // New multi-vendor array
      if (a.vendors && Array.isArray(a.vendors)) {
        return a.vendors.some(v => v.vendorId === vendorId || v.vendorName === vendor.name)
      }
      // Legacy single vendor field
      return a.vendor === vendor.name || a.vendorId === vendorId
    })
  },

  /** Find all vendor records for a given application (multi-vendor aware) */
  vendorsForApp (appId) {
    const app = this.appById(appId)
    if (!app) return []
    if (app.vendors && Array.isArray(app.vendors) && app.vendors.length > 0) {
      return app.vendors.map(v => ({
        ...v,
        vendorRecord: v.vendorId ? this.vendorById(v.vendorId) : (this.data.vendors || []).find(vr => vr.name === v.vendorName)
      }))
    }
    // Legacy: single vendor field
    const vendorRecord = app.vendorId ? this.vendorById(app.vendorId) : (this.data.vendors || []).find(v => v.name === app.vendor)
    if (!vendorRecord && !app.vendor) return []
    return [{ vendorId: vendorRecord?.id || '', vendorName: app.vendor || vendorRecord?.name || '', role: 'Hersteller', vendorRecord }]
  },

  /** Find the vendor record for a given application (legacy, returns first/primary vendor) */
  vendorForApp (appId) {
    const vendors = this.vendorsForApp(appId)
    const primary = vendors.find(v => v.role === 'Hersteller') || vendors[0]
    return primary?.vendorRecord || null
  },

  /** Get the role of a vendor for a specific app */
  vendorRoleForApp (vendorId, appId) {
    const app = this.appById(appId)
    if (!app || !app.vendors) return null
    const entry = app.vendors.find(v => v.vendorId === vendorId)
    return entry?.role || null
  },

  // ── Legal Entity CRUD ──

  entityById (id) {
    return (this.data.legalEntities || []).find(e => e.id === id)
  },

  addEntity (entity) {
    if (!this.data.legalEntities) this.data.legalEntities = []
    if (!entity.id) {
      const maxNum = this.data.legalEntities.reduce((max, e) => {
        const m = e.id && e.id.match(/^ENT-(\d+)$/)
        return m ? Math.max(max, parseInt(m[1], 10)) : max
      }, 0)
      entity.id = 'ENT-' + String(maxNum + 1).padStart(3, '0')
    }
    this.data.legalEntities.push(entity)
  },

  updateEntity (id, patch) {
    const e = this.entityById(id)
    if (e) Object.assign(e, patch)
  },

  deleteEntity (id) {
    if (!this.data.legalEntities) return
    this.data.legalEntities = this.data.legalEntities.filter(e => e.id !== id)
  },

  /** All applications assigned to a given entity */
  appsForEntity (entityId) {
    return this.data.applications.filter(a =>
      a.entities && Array.isArray(a.entities) && a.entities.includes(entityId)
    )
  },

  /** All entity records assigned to a given application */
  entitiesForApp (appId) {
    const app = this.appById(appId)
    if (!app || !app.entities || !Array.isArray(app.entities)) return []
    return app.entities.map(id => this.entityById(id)).filter(Boolean)
  },

  // ── Compliance Helpers (Phase C2) ──

  /** All compliance assessments for a given app */
  assessmentsForApp (appId) {
    return (this.data.complianceAssessments || []).filter(a => a.appId === appId)
  },

  /** All compliance assessments for a given regulation */
  assessmentsForRegulation (regulation) {
    return (this.data.complianceAssessments || []).filter(a => a.regulation === regulation)
  },

  /** Gap analysis: apps that have a regulation in their list but no assessment (or notAssessed) */
  get complianceGaps () {
    const assessments = this.data.complianceAssessments || []
    const gaps = []
    ;(this.data.applications || []).forEach(app => {
      ;(app.regulations || []).forEach(reg => {
        const assessment = assessments.find(a => a.appId === app.id && a.regulation === reg)
        if (!assessment || assessment.status === 'notAssessed') {
          gaps.push({ appId: app.id, appName: app.name, regulation: reg, reason: assessment ? 'notAssessed' : 'missing' })
        }
      })
    })
    return gaps
  },

  /** Regulation load score: apps sorted by number of applicable regulations (descending) */
  get regulationLoadScores () {
    return (this.data.applications || [])
      .filter(a => a.regulations && a.regulations.length > 0)
      .map(a => ({ appId: a.id, appName: a.name, vendor: a.vendor, criticality: a.criticality, count: a.regulations.length, regulations: a.regulations }))
      .sort((a, b) => b.count - a.count)
  },

  /** Vendor compliance: aggregated compliance status per vendor */
  get vendorComplianceStatus () {
    const assessments = this.data.complianceAssessments || []
    const vendorMap = {}
    ;(this.data.applications || []).forEach(app => {
      const vendor = app.vendor || 'Unknown'
      if (!vendorMap[vendor]) vendorMap[vendor] = { vendor, apps: 0, compliant: 0, partial: 0, nonCompliant: 0, notAssessed: 0, total: 0 }
      vendorMap[vendor].apps++
      ;(app.regulations || []).forEach(reg => {
        vendorMap[vendor].total++
        const assessment = assessments.find(a => a.appId === app.id && a.regulation === reg)
        if (!assessment || assessment.status === 'notAssessed') vendorMap[vendor].notAssessed++
        else if (assessment.status === 'compliant') vendorMap[vendor].compliant++
        else if (assessment.status === 'partial') vendorMap[vendor].partial++
        else vendorMap[vendor].nonCompliant++
      })
    })
    return Object.values(vendorMap)
      .filter(v => v.total > 0)
      .map(v => ({ ...v, complianceRate: v.total ? Math.round((v.compliant / v.total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total)
  },

  /** Overall compliance score: percentage of compliant assessments out of all applicable */
  get overallComplianceScore () {
    const assessments = this.data.complianceAssessments || []
    let total = 0
    let compliant = 0
    ;(this.data.applications || []).forEach(app => {
      ;(app.regulations || []).forEach(reg => {
        total++
        const assessment = assessments.find(a => a.appId === app.id && a.regulation === reg)
        if (assessment && assessment.status === 'compliant') compliant++
        else if (assessment && assessment.status === 'partial') compliant += 0.5
      })
    })
    return total ? Math.round((compliant / total) * 100) : 0
  },

  // ── Compliance Helpers (Phase C3) ──

  /** Transition an assessment through the workflow and log to audit trail */
  assessmentWorkflowTransition (assessmentId, newStatus, user, comment) {
    const assessment = (this.data.complianceAssessments || []).find(a => a.id === assessmentId)
    if (!assessment) return false
    const validTransitions = {
      open: ['inReview'],
      inReview: ['assessed', 'reviewRequired'],
      assessed: ['reviewRequired'],
      reviewRequired: ['inReview']
    }
    const current = assessment.workflowStatus || 'open'
    if (!validTransitions[current] || !validTransitions[current].includes(newStatus)) return false
    const oldStatus = current
    assessment.workflowStatus = newStatus
    if (!assessment.auditTrail) assessment.auditTrail = []
    assessment.auditTrail.push({
      timestamp: new Date().toISOString(),
      user: user || 'System',
      action: 'statusChange',
      fromStatus: oldStatus,
      toStatus: newStatus,
      comment: comment || ''
    })
    return true
  },

  /** Audit trail for a specific assessment */
  auditTrailForAssessment (assessmentId) {
    const assessment = (this.data.complianceAssessments || []).find(a => a.id === assessmentId)
    return (assessment && assessment.auditTrail) || []
  },

  /** Assessments with approaching or expired deadlines */
  get deadlineWarnings () {
    const now = new Date()
    const warnings = []
    ;(this.data.complianceAssessments || []).forEach(a => {
      if (!a.deadline) return
      const dl = new Date(a.deadline)
      const diffDays = Math.ceil((dl - now) / (1000 * 60 * 60 * 24))
      if (diffDays <= 90) {
        const app = this.appById(a.appId)
        warnings.push({
          assessmentId: a.id,
          appId: a.appId,
          appName: app ? app.name : a.appId,
          regulation: a.regulation,
          deadline: a.deadline,
          daysRemaining: diffDays,
          status: a.status,
          workflowStatus: a.workflowStatus || 'open',
          expired: diffDays < 0
        })
      }
    })
    return warnings.sort((a, b) => a.daysRemaining - b.daysRemaining)
  },

  /** Regulation-level deadline warnings (transition deadlines from regulation enum) */
  get regulationDeadlineWarnings () {
    const now = new Date()
    const regs = (this.data.enums && this.data.enums.complianceRegulations) || []
    const selected = this.featureToggles.selectedRegulations || []
    return regs
      .filter(r => r.deadline && selected.includes(r.value))
      .map(r => {
        const dl = new Date(r.deadline)
        const diffDays = Math.ceil((dl - now) / (1000 * 60 * 60 * 24))
        return { ...r, daysRemaining: diffDays, expired: diffDays < 0 }
      })
      .filter(r => r.daysRemaining <= 180)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
  },

  /** Auto-assign regulations to an app based on criticality and data classification */
  autoAssignRegulations (app) {
    const regs = (this.data.enums && this.data.enums.complianceRegulations) || []
    const selected = this.featureToggles.selectedRegulations || []
    const assigned = []
    regs.forEach(reg => {
      if (!selected.includes(reg.value)) return
      const critMatch = !reg.applicableCriticalities || reg.applicableCriticalities.length === 0 ||
        reg.applicableCriticalities.includes(app.criticality)
      const scopeMatch = !reg.applicableScopes || reg.applicableScopes.length === 0 ||
        reg.applicableScopes.includes('alle') ||
        reg.applicableScopes.includes(app.dataClassification)
      if (critMatch && scopeMatch) assigned.push(reg.value)
    })
    return assigned
  },

  /** Compliance scorecard per domain: aggregated conformity grade */
  get complianceScorecardByDomain () {
    const domains = this.data.domains || []
    const mappings = this.data.capabilityMappings || []
    const assessments = this.data.complianceAssessments || []
    const apps = this.data.applications || []

    return domains.map(d => {
      const capIds = d.capabilities.map(c => c.id)
      const domainAppIds = [...new Set(
        mappings.filter(m => capIds.includes(m.capabilityId)).map(m => m.applicationId)
      )]
      const domainApps = domainAppIds.map(id => apps.find(a => a.id === id)).filter(Boolean)

      let total = 0; let compliant = 0; let partial = 0; let nonCompliant = 0; let notAssessed = 0
      domainApps.forEach(app => {
        ;(app.regulations || []).forEach(reg => {
          total++
          const a = assessments.find(x => x.appId === app.id && x.regulation === reg)
          if (!a || a.status === 'notAssessed') notAssessed++
          else if (a.status === 'compliant') compliant++
          else if (a.status === 'partial') partial++
          else nonCompliant++
        })
      })
      const score = total > 0 ? Math.round(((compliant + partial * 0.5) / total) * 100) : 0
      return {
        domainId: d.id,
        domainName: d.name,
        domainColor: d.color,
        appCount: domainApps.length,
        total,
        compliant,
        partial,
        nonCompliant,
        notAssessed,
        score
      }
    }).filter(d => d.total > 0).sort((a, b) => b.score - a.score)
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

  get totalIntegrations () { return (this.data.integrations || []).length },

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

  // ── Data Object CRUD ──

  get totalDataObjects () { return (this.data.dataObjects || []).length },

  dataObjectById (id) {
    return (this.data.dataObjects || []).find(d => d.id === id)
  },

  addDataObject (obj) {
    if (!this.data.dataObjects) this.data.dataObjects = []
    if (!obj.id) {
      const maxNum = this.data.dataObjects.reduce((m, d) => {
        const n = d.id && d.id.match(/^DO-(\d+)$/)
        return n ? Math.max(m, parseInt(n[1], 10)) : m
      }, 0)
      obj.id = 'DO-' + String(maxNum + 1).padStart(3, '0')
    }
    this.data.dataObjects.push(obj)
  },

  updateDataObject (id, patch) {
    const d = this.dataObjectById(id)
    if (d) Object.assign(d, patch)
  },

  deleteDataObject (id) {
    if (!this.data.dataObjects) return
    this.data.dataObjects = this.data.dataObjects.filter(d => d.id !== id)
  },

  dataObjectsForApp (appId) {
    return (this.data.dataObjects || []).filter(d =>
      (d.sourceAppIds && d.sourceAppIds.includes(appId)) ||
      (d.consumingAppIds && d.consumingAppIds.includes(appId))
    )
  },

  appsForDataObject (dataObjectId) {
    const obj = this.dataObjectById(dataObjectId)
    if (!obj) return { source: [], consuming: [] }
    const source = (obj.sourceAppIds || []).map(id => this.appById(id)).filter(Boolean)
    const consuming = (obj.consumingAppIds || []).map(id => this.appById(id)).filter(Boolean)
    return { source, consuming }
  },

  // ── Skill / Fachkräfte Analysis ──

  get skillSummary () {
    const skillMap = {}
    ;(this.data.applications || []).forEach(app => {
      ;(app.skillProfiles || []).forEach(sp => {
        if (!skillMap[sp.skill]) {
          skillMap[sp.skill] = { skill: sp.skill, totalHeadcount: 0, appIds: [], keyPersons: new Set(), outsourceable: sp.outsourceable }
        }
        skillMap[sp.skill].totalHeadcount += sp.headcount || 0
        skillMap[sp.skill].appIds.push(app.id)
        ;(sp.keyPersons || []).forEach(p => skillMap[sp.skill].keyPersons.add(p))
        if (!sp.outsourceable) skillMap[sp.skill].outsourceable = false
      })
    })
    return Object.values(skillMap).map(s => ({
      ...s,
      keyPersons: [...s.keyPersons],
      appCount: s.appIds.length
    }))
  },

  appsBySkill (skill) {
    return (this.data.applications || []).filter(app =>
      (app.skillProfiles || []).some(sp => sp.skill === skill)
    )
  },

  get busFactor () {
    const personMap = {}
    ;(this.data.applications || []).forEach(app => {
      ;(app.skillProfiles || []).forEach(sp => {
        ;(sp.keyPersons || []).forEach(person => {
          if (!personMap[person]) personMap[person] = { person, skills: new Set(), appIds: new Set() }
          personMap[person].skills.add(sp.skill)
          personMap[person].appIds.add(app.id)
        })
      })
    })
    return Object.values(personMap).map(p => ({
      person: p.person,
      skills: [...p.skills],
      appIds: [...p.appIds],
      appCount: p.appIds.size,
      risk: p.appIds.size >= 4 ? 'high' : p.appIds.size >= 2 ? 'medium' : 'low'
    })).sort((a, b) => b.appCount - a.appCount)
  },

  skillLossImpact (skill, count) {
    const affected = this.appsBySkill(skill)
    return affected.map(app => {
      const sp = (app.skillProfiles || []).find(s => s.skill === skill)
      if (!sp) return null
      const remaining = Math.max(0, (sp.headcount || 0) - (count || 0))
      return {
        appId: app.id,
        appName: app.name,
        criticality: app.criticality,
        currentHeadcount: sp.headcount || 0,
        lostHeadcount: Math.min(count || 0, sp.headcount || 0),
        remainingHeadcount: remaining,
        keyPersons: sp.keyPersons || [],
        outsourceable: sp.outsourceable,
        severity: remaining === 0 ? 'critical' : remaining === 1 ? 'high' : 'medium'
      }
    }).filter(Boolean)
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

    // Data Objects
    ;(this.data.dataObjects || []).forEach(d => {
      const fields = [d.id, d.name, d.description, d.classification, d.owner, d.steward].filter(Boolean).join(' ')
      if (fields.toLowerCase().includes(q)) {
        results.push({ type: 'DataObject', id: d.id, name: d.name, detail: [d.classification, d.owner].filter(Boolean).join(' · '), route: '/data-objects/' + d.id })
      }
    })

    // Legal Entities
    ;(this.data.legalEntities || []).forEach(e => {
      const fields = [e.id, e.name, e.shortName, e.description, e.country, e.city, e.region].filter(Boolean).join(' ')
      if (fields.toLowerCase().includes(q)) {
        results.push({ type: 'Entity', id: e.id, name: e.name, detail: [e.city, e.country].filter(Boolean).join(', '), route: '/entities/' + e.id })
      }
    })

    // Integrations
    ;(this.data.integrations || []).forEach(i => {
      const fields = [i.id, i.description, i.interfaceType, i.protocol, i.dataObjects, i.status].filter(Boolean).join(' ')
      if (fields.toLowerCase().includes(q)) {
        results.push({ type: 'Integration', id: i.id, name: i.description || i.id, detail: [i.interfaceType, i.protocol].filter(Boolean).join(' · '), route: '/integration-map' })
      }
    })

    return results
  }
})

// ────────────────────────────────────────────
// Persistence — localStorage + server file
// ────────────────────────────────────────────
let serverSaveTimer = null

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

  // Debounced server save (2s delay to batch rapid changes)
  clearTimeout(serverSaveTimer)
  serverSaveTimer = setTimeout(() => persistToServer(), 2000)
}

async function persistToServer () {
  try {
    const raw = JSON.parse(JSON.stringify(store.data))
    raw.meta.lastUpdated = new Date().toISOString()
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(raw)
    })
    if (res.ok) {
      const result = await res.json()
      console.info('[store] ✓ saved to server', result.timestamp)
      store._lastServerSave = result.timestamp
    } else {
      console.warn('[store] server save failed:', res.status, res.statusText)
    }
  } catch (e) {
    // Server not available (e.g. static hosting) — silently ignore
    console.debug('[store] server save unavailable (static hosting?)', e.message)
  }
}

// Watch deeply and auto-persist
export function startWatching () {
  watch(() => store.data, persist, { deep: true })
  watch(() => store.darkMode, (v) => {
    localStorage.setItem('ea-dark-mode', v)
    document.documentElement.classList.toggle('dark', v)
  })
  watch(() => store.featureToggles, (v) => {
    localStorage.setItem('ea-feature-toggles', JSON.stringify(v))
  }, { deep: true })
}

// ────────────────────────────────────────────
// Load — from localStorage or seed JSON
// ────────────────────────────────────────────
const CACHE_VERSION = 'v10-2026-02-13-skill-profiles'

export async function loadData () {
  // 0. Force reload from seed when cache version changes
  const currentCacheVersion = localStorage.getItem(STORAGE_KEY + '-version')
  if (currentCacheVersion !== CACHE_VERSION) {
    console.info('[store] cache version mismatch — clearing localStorage to load fresh seed data')
    localStorage.removeItem(STORAGE_KEY)
    localStorage.setItem(STORAGE_KEY + '-version', CACHE_VERSION)
  }

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

// ────────────────────────────────────────────
// Domain / Capability Templates
// ────────────────────────────────────────────
export { domainTemplates }

export function applyDomainTemplate (templateId) {
  const tpl = domainTemplates.find(t => t.id === templateId)
  if (!tpl) return false
  store.data.domains = JSON.parse(JSON.stringify(tpl.domains))
  store.data.capabilityMappings = []
  return true
}
