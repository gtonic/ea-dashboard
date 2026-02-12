import { describe, it, expect, beforeEach } from 'vitest'
import { store } from '../app/js/store.js'

// Helper to reset store state before each test
function createTestState() {
  return {
    meta: { version: '1.0', lastUpdated: '', owner: '', company: 'Test Corp', description: '' },
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
    enums: {}
  }
}

beforeEach(() => {
  store.data = createTestState()
  store.loaded = false
  store.sidebarOpen = true
})

// ─── Getter Tests ─────────────────────────────────────────

describe('Store Getters', () => {
  it('totalApps returns number of applications', () => {
    expect(store.totalApps).toBe(0)
    store.data.applications.push({ id: 'APP-001', name: 'Test' })
    expect(store.totalApps).toBe(1)
  })

  it('totalProjects returns number of projects', () => {
    expect(store.totalProjects).toBe(0)
    store.data.projects.push({ id: 'PRJ-001', name: 'Test' })
    expect(store.totalProjects).toBe(1)
  })

  it('totalVendors returns number of vendors', () => {
    expect(store.totalVendors).toBe(0)
    store.data.vendors.push({ id: 'VND-001', name: 'Vendor A' })
    expect(store.totalVendors).toBe(1)
  })

  it('totalVendors handles missing vendors array', () => {
    store.data.vendors = undefined
    expect(store.totalVendors).toBe(0)
  })

  it('totalCapabilities counts capabilities across domains', () => {
    store.data.domains = [
      { id: 1, name: 'D1', capabilities: [{ id: '1.1', name: 'C1', maturity: 3 }] },
      { id: 2, name: 'D2', capabilities: [{ id: '2.1', name: 'C2', maturity: 4 }, { id: '2.2', name: 'C3', maturity: 2 }] }
    ]
    expect(store.totalCapabilities).toBe(3)
  })

  it('totalSubCapabilities counts sub-capabilities across domains', () => {
    store.data.domains = [
      { id: 1, name: 'D1', capabilities: [
        { id: '1.1', name: 'C1', maturity: 3, subCapabilities: [{ id: '1.1.1' }, { id: '1.1.2' }] }
      ]},
      { id: 2, name: 'D2', capabilities: [
        { id: '2.1', name: 'C2', maturity: 4, subCapabilities: [{ id: '2.1.1' }] },
        { id: '2.2', name: 'C3', maturity: 2 } // no subCapabilities
      ]}
    ]
    expect(store.totalSubCapabilities).toBe(3)
  })

  it('avgMaturity calculates average across all capabilities', () => {
    store.data.domains = [
      { id: 1, name: 'D1', capabilities: [
        { id: '1.1', maturity: 2 },
        { id: '1.2', maturity: 4 }
      ]}
    ]
    expect(store.avgMaturity).toBe(3.0)
  })

  it('avgMaturity returns 0 when no capabilities exist', () => {
    expect(store.avgMaturity).toBe(0)
  })

  it('totalBudget sums project budgets', () => {
    store.data.projects = [
      { id: 'PRJ-001', budget: 100000 },
      { id: 'PRJ-002', budget: 200000 },
      { id: 'PRJ-003' } // no budget
    ]
    expect(store.totalBudget).toBe(300000)
  })

  it('timeDistribution counts apps per TIME quadrant', () => {
    store.data.applications = [
      { id: 'APP-001', timeQuadrant: 'Invest' },
      { id: 'APP-002', timeQuadrant: 'Invest' },
      { id: 'APP-003', timeQuadrant: 'Tolerate' },
      { id: 'APP-004', timeQuadrant: 'Migrate' },
      { id: 'APP-005', timeQuadrant: 'Eliminate' }
    ]
    const dist = store.timeDistribution
    expect(dist.Invest).toBe(2)
    expect(dist.Tolerate).toBe(1)
    expect(dist.Migrate).toBe(1)
    expect(dist.Eliminate).toBe(1)
  })

  it('projectStatusCounts counts projects by status', () => {
    store.data.projects = [
      { id: 'PRJ-001', status: 'green' },
      { id: 'PRJ-002', status: 'green' },
      { id: 'PRJ-003', status: 'yellow' },
      { id: 'PRJ-004', status: 'red' }
    ]
    const counts = store.projectStatusCounts
    expect(counts.green).toBe(2)
    expect(counts.yellow).toBe(1)
    expect(counts.red).toBe(1)
  })

  it('avgTargetMaturity calculates average of target maturities', () => {
    store.data.domains = [
      { id: 1, name: 'D1', capabilities: [
        { id: '1.1', maturity: 2, targetMaturity: 4 },
        { id: '1.2', maturity: 3, targetMaturity: 5 }
      ]}
    ]
    expect(store.avgTargetMaturity).toBe(4.5)
  })

  it('avgTargetMaturity returns 0 when no targets defined', () => {
    store.data.domains = [
      { id: 1, name: 'D1', capabilities: [
        { id: '1.1', maturity: 2 }
      ]}
    ]
    expect(store.avgTargetMaturity).toBe(0)
  })

  it('maturityGaps identifies and sorts gaps', () => {
    store.data.domains = [
      { id: 1, name: 'D1', color: '#ff0000', capabilities: [
        { id: '1.1', name: 'C1', maturity: 2, targetMaturity: 5 },
        { id: '1.2', name: 'C2', maturity: 3, targetMaturity: 4 },
        { id: '1.3', name: 'C3', maturity: 4, targetMaturity: 4 } // no gap
      ]}
    ]
    const gaps = store.maturityGaps
    expect(gaps).toHaveLength(2)
    expect(gaps[0].gap).toBe(3) // largest gap first
    expect(gaps[0].capName).toBe('C1')
    expect(gaps[1].gap).toBe(1)
    expect(gaps[1].capName).toBe('C2')
  })

  it('totalDemands returns count of demands', () => {
    expect(store.totalDemands).toBe(0)
    store.data.demands.push({ id: 'DEM-001' })
    expect(store.totalDemands).toBe(1)
  })

  it('totalDemands handles missing demands array', () => {
    store.data.demands = undefined
    expect(store.totalDemands).toBe(0)
  })
})

// ─── Domain CRUD ──────────────────────────────────────────

describe('Domain CRUD', () => {
  it('domainById finds a domain by id', () => {
    store.data.domains = [
      { id: 1, name: 'Production', capabilities: [] },
      { id: 2, name: 'Sales', capabilities: [] }
    ]
    expect(store.domainById(1).name).toBe('Production')
    expect(store.domainById(2).name).toBe('Sales')
    expect(store.domainById(99)).toBeUndefined()
  })

  it('addDomain assigns incremented id and initializes arrays', () => {
    const id = store.addDomain({ name: 'New Domain', color: '#abcdef' })
    expect(id).toBe(1)
    expect(store.data.domains).toHaveLength(1)
    expect(store.data.domains[0].capabilities).toEqual([])
    expect(store.data.domains[0].kpis).toEqual([])
  })

  it('addDomain increments id based on existing domains', () => {
    store.data.domains = [{ id: 5, name: 'Existing', capabilities: [] }]
    const id = store.addDomain({ name: 'Another' })
    expect(id).toBe(6)
  })

  it('updateDomain patches domain properties', () => {
    store.data.domains = [{ id: 1, name: 'Old', color: '#000', capabilities: [] }]
    store.updateDomain(1, { name: 'Updated', color: '#fff' })
    expect(store.domainById(1).name).toBe('Updated')
    expect(store.domainById(1).color).toBe('#fff')
  })

  it('deleteDomain removes domain and cleans up references', () => {
    store.data.domains = [
      { id: 1, name: 'D1', capabilities: [{ id: '1.1' }] },
      { id: 2, name: 'D2', capabilities: [] }
    ]
    store.data.capabilityMappings = [
      { capabilityId: '1.1', applicationId: 'APP-001' },
      { capabilityId: '2.1', applicationId: 'APP-002' }
    ]
    store.data.projects = [
      { id: 'PRJ-001', primaryDomain: 1, secondaryDomains: [2], capabilities: ['1.1'] }
    ]

    store.deleteDomain(1)

    expect(store.data.domains).toHaveLength(1)
    expect(store.data.domains[0].id).toBe(2)
    expect(store.data.capabilityMappings).toHaveLength(1)
    expect(store.data.projects[0].primaryDomain).toBeNull()
    expect(store.data.projects[0].capabilities).toEqual([])
  })
})

// ─── Capability CRUD ──────────────────────────────────────

describe('Capability CRUD', () => {
  beforeEach(() => {
    store.data.domains = [
      { id: 1, name: 'D1', capabilities: [] }
    ]
  })

  it('capabilityById finds capability across domains', () => {
    store.data.domains[0].capabilities = [{ id: '1.1', name: 'Cap1', maturity: 3 }]
    const result = store.capabilityById('1.1')
    expect(result.name).toBe('Cap1')
    expect(result.domain.id).toBe(1)
  })

  it('capabilityById returns null for unknown id', () => {
    expect(store.capabilityById('99.99')).toBeNull()
  })

  it('addCapability adds to correct domain', () => {
    store.addCapability(1, { name: 'New Cap', maturity: 2 })
    expect(store.data.domains[0].capabilities).toHaveLength(1)
    expect(store.data.domains[0].capabilities[0].name).toBe('New Cap')
    expect(store.data.domains[0].capabilities[0].id).toBe('1.1')
    expect(store.data.domains[0].capabilities[0].subCapabilities).toEqual([])
  })

  it('addCapability sets targetMaturity to maturity when not specified', () => {
    store.addCapability(1, { name: 'Cap', maturity: 3 })
    expect(store.data.domains[0].capabilities[0].targetMaturity).toBe(3)
  })

  it('addCapability preserves explicit targetMaturity', () => {
    store.addCapability(1, { name: 'Cap', maturity: 2, targetMaturity: 5 })
    expect(store.data.domains[0].capabilities[0].targetMaturity).toBe(5)
  })

  it('updateCapability patches capability properties', () => {
    store.data.domains[0].capabilities = [{ id: '1.1', name: 'Old', maturity: 1 }]
    store.updateCapability('1.1', { name: 'Updated', maturity: 4 })
    expect(store.data.domains[0].capabilities[0].name).toBe('Updated')
    expect(store.data.domains[0].capabilities[0].maturity).toBe(4)
  })

  it('deleteCapability removes capability and cleans up mappings', () => {
    store.data.domains[0].capabilities = [{ id: '1.1', name: 'Cap1', maturity: 3 }]
    store.data.capabilityMappings = [{ capabilityId: '1.1', applicationId: 'APP-001' }]
    store.data.projects = [{ id: 'PRJ-001', capabilities: ['1.1', '2.1'] }]

    store.deleteCapability('1.1')

    expect(store.data.domains[0].capabilities).toHaveLength(0)
    expect(store.data.capabilityMappings).toHaveLength(0)
    expect(store.data.projects[0].capabilities).toEqual(['2.1'])
  })

  it('addSubCapability adds to correct parent capability', () => {
    store.data.domains[0].capabilities = [{ id: '1.1', name: 'Parent' }]
    store.addSubCapability('1.1', { name: 'Sub1' })
    expect(store.data.domains[0].capabilities[0].subCapabilities).toHaveLength(1)
    expect(store.data.domains[0].capabilities[0].subCapabilities[0].id).toBe('1.1.1')
  })

  it('deleteSubCapability removes from parent', () => {
    store.data.domains[0].capabilities = [
      { id: '1.1', name: 'Parent', subCapabilities: [
        { id: '1.1.1', name: 'Sub1' },
        { id: '1.1.2', name: 'Sub2' }
      ]}
    ]
    store.deleteSubCapability('1.1', '1.1.1')
    expect(store.data.domains[0].capabilities[0].subCapabilities).toHaveLength(1)
    expect(store.data.domains[0].capabilities[0].subCapabilities[0].id).toBe('1.1.2')
  })

  it('domainForCapability finds the parent domain', () => {
    store.data.domains[0].capabilities = [{ id: '1.1', name: 'Cap1' }]
    const d = store.domainForCapability('1.1')
    expect(d.id).toBe(1)
  })
})

// ─── Application CRUD ─────────────────────────────────────

describe('Application CRUD', () => {
  it('appById finds application by id', () => {
    store.data.applications = [{ id: 'APP-001', name: 'SAP' }]
    expect(store.appById('APP-001').name).toBe('SAP')
    expect(store.appById('APP-999')).toBeUndefined()
  })

  it('addApp assigns auto-generated id', () => {
    store.addApp({ name: 'New App' })
    expect(store.data.applications).toHaveLength(1)
    expect(store.data.applications[0].id).toBe('APP-001')
  })

  it('addApp preserves explicit id', () => {
    store.addApp({ id: 'APP-100', name: 'Explicit' })
    expect(store.data.applications[0].id).toBe('APP-100')
  })

  it('updateApp patches application properties', () => {
    store.data.applications = [{ id: 'APP-001', name: 'Old', vendor: 'V1' }]
    store.updateApp('APP-001', { name: 'Updated', vendor: 'V2' })
    expect(store.appById('APP-001').name).toBe('Updated')
    expect(store.appById('APP-001').vendor).toBe('V2')
  })

  it('updateApp does nothing for unknown id', () => {
    store.data.applications = [{ id: 'APP-001', name: 'Test' }]
    store.updateApp('APP-999', { name: 'Nope' })
    expect(store.data.applications[0].name).toBe('Test')
  })

  it('deleteApp removes app and cleans up mappings and project refs', () => {
    store.data.applications = [
      { id: 'APP-001', name: 'App1' },
      { id: 'APP-002', name: 'App2' }
    ]
    store.data.capabilityMappings = [
      { capabilityId: '1.1', applicationId: 'APP-001' },
      { capabilityId: '1.2', applicationId: 'APP-002' }
    ]
    store.data.projects = [
      { id: 'PRJ-001', affectedApps: [{ appId: 'APP-001' }, { appId: 'APP-002' }] }
    ]

    store.deleteApp('APP-001')

    expect(store.data.applications).toHaveLength(1)
    expect(store.data.capabilityMappings).toHaveLength(1)
    expect(store.data.projects[0].affectedApps).toHaveLength(1)
    expect(store.data.projects[0].affectedApps[0].appId).toBe('APP-002')
  })

  it('appsForCapability returns apps mapped to a capability', () => {
    store.data.applications = [
      { id: 'APP-001', name: 'App1' },
      { id: 'APP-002', name: 'App2' }
    ]
    store.data.capabilityMappings = [
      { capabilityId: '1.1', applicationId: 'APP-001', role: 'Primary' },
      { capabilityId: '1.1', applicationId: 'APP-002', role: 'Secondary' }
    ]
    const apps = store.appsForCapability('1.1')
    expect(apps).toHaveLength(2)
    expect(apps[0].role).toBe('Primary')
  })

  it('capabilitiesForApp returns capabilities linked to an app', () => {
    store.data.domains = [
      { id: 1, name: 'D1', capabilities: [{ id: '1.1', name: 'Cap1', maturity: 3 }] }
    ]
    store.data.capabilityMappings = [
      { capabilityId: '1.1', applicationId: 'APP-001', role: 'Primary' }
    ]
    const caps = store.capabilitiesForApp('APP-001')
    expect(caps).toHaveLength(1)
    expect(caps[0].name).toBe('Cap1')
  })
})

// ─── Mapping CRUD ─────────────────────────────────────────

describe('Mapping CRUD', () => {
  it('addMapping adds a new capability-app mapping', () => {
    store.addMapping('1.1', 'APP-001', 'Primary')
    expect(store.data.capabilityMappings).toHaveLength(1)
    expect(store.data.capabilityMappings[0]).toEqual({
      capabilityId: '1.1', applicationId: 'APP-001', role: 'Primary'
    })
  })

  it('addMapping prevents duplicate mappings', () => {
    store.addMapping('1.1', 'APP-001')
    store.addMapping('1.1', 'APP-001')
    expect(store.data.capabilityMappings).toHaveLength(1)
  })

  it('removeMapping removes specific mapping', () => {
    store.data.capabilityMappings = [
      { capabilityId: '1.1', applicationId: 'APP-001', role: 'Primary' },
      { capabilityId: '1.2', applicationId: 'APP-001', role: 'Primary' }
    ]
    store.removeMapping('1.1', 'APP-001')
    expect(store.data.capabilityMappings).toHaveLength(1)
    expect(store.data.capabilityMappings[0].capabilityId).toBe('1.2')
  })
})

// ─── Project CRUD ─────────────────────────────────────────

describe('Project CRUD', () => {
  it('projectById finds a project', () => {
    store.data.projects = [{ id: 'PRJ-001', name: 'Migration' }]
    expect(store.projectById('PRJ-001').name).toBe('Migration')
    expect(store.projectById('PRJ-999')).toBeUndefined()
  })

  it('addProject assigns auto-generated id', () => {
    store.addProject({ name: 'New Project', budget: 50000 })
    expect(store.data.projects).toHaveLength(1)
    expect(store.data.projects[0].id).toBe('PRJ-001')
  })

  it('updateProject patches project properties', () => {
    store.data.projects = [{ id: 'PRJ-001', name: 'Old', status: 'green' }]
    store.updateProject('PRJ-001', { name: 'Updated', status: 'yellow' })
    expect(store.projectById('PRJ-001').name).toBe('Updated')
    expect(store.projectById('PRJ-001').status).toBe('yellow')
  })

  it('deleteProject removes project and cleans up dependencies', () => {
    store.data.projects = [{ id: 'PRJ-001' }, { id: 'PRJ-002' }]
    store.data.projectDependencies = [
      { sourceProjectId: 'PRJ-001', targetProjectId: 'PRJ-002' },
      { sourceProjectId: 'PRJ-003', targetProjectId: 'PRJ-004' }
    ]
    store.deleteProject('PRJ-001')
    expect(store.data.projects).toHaveLength(1)
    expect(store.data.projectDependencies).toHaveLength(1)
  })

  it('depsForProject returns dependencies for a project', () => {
    store.data.projectDependencies = [
      { sourceProjectId: 'PRJ-001', targetProjectId: 'PRJ-002' },
      { sourceProjectId: 'PRJ-003', targetProjectId: 'PRJ-001' },
      { sourceProjectId: 'PRJ-004', targetProjectId: 'PRJ-005' }
    ]
    expect(store.depsForProject('PRJ-001')).toHaveLength(2)
  })

  it('projectsForDomain finds projects by primary or secondary domain', () => {
    store.data.projects = [
      { id: 'PRJ-001', primaryDomain: 1 },
      { id: 'PRJ-002', primaryDomain: 2, secondaryDomains: [1] },
      { id: 'PRJ-003', primaryDomain: 3 }
    ]
    expect(store.projectsForDomain(1)).toHaveLength(2)
    expect(store.projectsForDomain(3)).toHaveLength(1)
  })
})

// ─── Dependency CRUD ──────────────────────────────────────

describe('Dependency CRUD', () => {
  it('addDependency adds a project dependency', () => {
    store.addDependency({ sourceProjectId: 'PRJ-001', targetProjectId: 'PRJ-002' })
    expect(store.data.projectDependencies).toHaveLength(1)
  })

  it('removeDependency removes specific dependency', () => {
    store.data.projectDependencies = [
      { sourceProjectId: 'PRJ-001', targetProjectId: 'PRJ-002' },
      { sourceProjectId: 'PRJ-003', targetProjectId: 'PRJ-004' }
    ]
    store.removeDependency('PRJ-001', 'PRJ-002')
    expect(store.data.projectDependencies).toHaveLength(1)
  })
})

// ─── Process CRUD ─────────────────────────────────────────

describe('Process CRUD', () => {
  it('processById finds a process', () => {
    store.data.e2eProcesses = [{ id: 'PRC-001', name: 'Order-to-Cash' }]
    expect(store.processById('PRC-001').name).toBe('Order-to-Cash')
  })

  it('processById handles missing array', () => {
    store.data.e2eProcesses = undefined
    expect(store.processById('PRC-001')).toBeUndefined()
  })

  it('addProcess creates process array if needed', () => {
    store.data.e2eProcesses = undefined
    store.addProcess({ id: 'PRC-001', name: 'New Process' })
    expect(store.data.e2eProcesses).toHaveLength(1)
  })

  it('updateProcess patches process properties', () => {
    store.data.e2eProcesses = [{ id: 'PRC-001', name: 'Old' }]
    store.updateProcess('PRC-001', { name: 'Updated' })
    expect(store.processById('PRC-001').name).toBe('Updated')
  })

  it('deleteProcess removes process', () => {
    store.data.e2eProcesses = [{ id: 'PRC-001' }, { id: 'PRC-002' }]
    store.deleteProcess('PRC-001')
    expect(store.data.e2eProcesses).toHaveLength(1)
  })

  it('deleteProcess handles missing array', () => {
    store.data.e2eProcesses = undefined
    store.deleteProcess('PRC-001') // should not throw
  })

  it('processesForDomain filters by domain id', () => {
    store.data.e2eProcesses = [
      { id: 'PRC-001', domains: [1, 2] },
      { id: 'PRC-002', domains: [2, 3] },
      { id: 'PRC-003', domains: [3] }
    ]
    expect(store.processesForDomain(2)).toHaveLength(2)
  })
})

// ─── Vendor CRUD ──────────────────────────────────────────

describe('Vendor CRUD', () => {
  it('vendorById finds a vendor', () => {
    store.data.vendors = [{ id: 'VND-001', name: 'SAP SE' }]
    expect(store.vendorById('VND-001').name).toBe('SAP SE')
  })

  it('vendorById handles missing vendors', () => {
    store.data.vendors = undefined
    expect(store.vendorById('VND-001')).toBeUndefined()
  })

  it('addVendor assigns auto-generated id', () => {
    store.addVendor({ name: 'New Vendor' })
    expect(store.data.vendors).toHaveLength(1)
    expect(store.data.vendors[0].id).toBe('VND-001')
  })

  it('addVendor creates array if missing', () => {
    store.data.vendors = undefined
    store.addVendor({ name: 'Test' })
    expect(store.data.vendors).toHaveLength(1)
  })

  it('updateVendor patches vendor properties', () => {
    store.data.vendors = [{ id: 'VND-001', name: 'Old' }]
    store.updateVendor('VND-001', { name: 'Updated' })
    expect(store.vendorById('VND-001').name).toBe('Updated')
  })

  it('deleteVendor removes vendor', () => {
    store.data.vendors = [{ id: 'VND-001' }, { id: 'VND-002' }]
    store.deleteVendor('VND-001')
    expect(store.data.vendors).toHaveLength(1)
  })

  it('deleteVendor handles missing array', () => {
    store.data.vendors = undefined
    store.deleteVendor('VND-001')
  })

  it('appsForVendor finds apps by vendor name', () => {
    store.data.vendors = [{ id: 'VND-001', name: 'SAP SE' }]
    store.data.applications = [
      { id: 'APP-001', vendor: 'SAP SE' },
      { id: 'APP-002', vendor: 'Microsoft' }
    ]
    expect(store.appsForVendor('VND-001')).toHaveLength(1)
  })

  it('appsForVendor finds apps by vendorId', () => {
    store.data.vendors = [{ id: 'VND-001', name: 'SAP SE' }]
    store.data.applications = [
      { id: 'APP-001', vendorId: 'VND-001' }
    ]
    expect(store.appsForVendor('VND-001')).toHaveLength(1)
  })

  it('vendorForApp finds vendor for an application', () => {
    store.data.vendors = [{ id: 'VND-001', name: 'SAP SE' }]
    store.data.applications = [{ id: 'APP-001', vendorId: 'VND-001' }]
    expect(store.vendorForApp('APP-001').name).toBe('SAP SE')
  })

  it('vendorForApp matches by vendor name', () => {
    store.data.vendors = [{ id: 'VND-001', name: 'SAP SE' }]
    store.data.applications = [{ id: 'APP-001', vendor: 'SAP SE' }]
    expect(store.vendorForApp('APP-001').name).toBe('SAP SE')
  })

  it('vendorForApp returns null for unknown app', () => {
    expect(store.vendorForApp('APP-999')).toBeNull()
  })
})

// ─── Vendor Scorecard Data ───────────────────────────────

describe('Vendor Scorecard Data', () => {
  beforeEach(() => {
    store.data.vendors = [
      { id: 'VND-001', name: 'SAP SE', criticality: 'Strategic', status: 'Active', contractValue: 550000, contractEnd: '2027-12-31', rating: 8 },
      { id: 'VND-002', name: 'Microsoft', criticality: 'Strategic', status: 'Active', contractValue: 320000, contractEnd: '2025-06-30', rating: 7 },
      { id: 'VND-003', name: 'SmallVendor', criticality: 'Standard', status: 'Active', contractValue: 10000, rating: 5 }
    ]
    store.data.applications = [
      { id: 'APP-001', name: 'SAP ERP', vendor: 'SAP SE', criticality: 'Mission-Critical' },
      { id: 'APP-002', name: 'SAP BW', vendor: 'SAP SE', criticality: 'Mission-Critical' },
      { id: 'APP-003', name: 'Office 365', vendor: 'Microsoft', criticality: 'Business-Critical' },
      { id: 'APP-004', name: 'Azure', vendor: 'Microsoft', criticality: 'Mission-Critical' },
      { id: 'APP-005', name: 'SmallApp', vendor: 'SmallVendor', criticality: 'Administrative' }
    ]
  })

  it('appsForVendor returns correct app count per vendor', () => {
    expect(store.appsForVendor('VND-001')).toHaveLength(2)
    expect(store.appsForVendor('VND-002')).toHaveLength(2)
    expect(store.appsForVendor('VND-003')).toHaveLength(1)
  })

  it('vendor concentration risk: SAP has most Mission-Critical apps', () => {
    const mcApps = store.data.applications.filter(a => a.criticality === 'Mission-Critical')
    expect(mcApps).toHaveLength(3)
    const sapMC = mcApps.filter(a => a.vendor === 'SAP SE')
    expect(sapMC).toHaveLength(2)
    const sapPercent = Math.round((sapMC.length / mcApps.length) * 100)
    expect(sapPercent).toBe(67)
  })

  it('vendor concentration risk: SmallVendor has no Mission-Critical apps', () => {
    const mcApps = store.data.applications.filter(a => a.criticality === 'Mission-Critical')
    const smallMC = mcApps.filter(a => a.vendor === 'SmallVendor')
    expect(smallMC).toHaveLength(0)
  })

  it('total contract value sums all vendors', () => {
    const total = store.data.vendors.reduce((s, v) => s + (v.contractValue || 0), 0)
    expect(total).toBe(880000)
  })

  it('contract timeline identifies vendors without contractEnd', () => {
    const vendorsWithContract = store.data.vendors.filter(v => v.contractEnd)
    expect(vendorsWithContract).toHaveLength(2)
    const vendorsWithoutContract = store.data.vendors.filter(v => !v.contractEnd)
    expect(vendorsWithoutContract).toHaveLength(1)
    expect(vendorsWithoutContract[0].name).toBe('SmallVendor')
  })

  it('handles empty vendors array for scorecard', () => {
    store.data.vendors = []
    store.data.applications = []
    const mcApps = store.data.applications.filter(a => a.criticality === 'Mission-Critical')
    expect(mcApps).toHaveLength(0)
    const total = store.data.vendors.reduce((s, v) => s + (v.contractValue || 0), 0)
    expect(total).toBe(0)
  })
})

// ─── Vendor Type Data ─────────────────────────────────────

describe('Vendor Type Data', () => {
  it('vendorType enum exists and contains expected types', () => {
    store.data.enums = {
      vendorType: [
        { value: 'MSP', label: 'Managed Service Provider' },
        { value: 'HYP', label: 'Hyperscaler' },
        { value: 'INF', label: 'Infrastruktur' },
        { value: 'SAAS-I', label: 'SaaS (Infrastruktur)' },
        { value: 'SAAS-S', label: 'SaaS (Spezialisiert)' },
        { value: 'LIC', label: 'Lizenz-Software' },
        { value: 'MKT', label: 'Marktprodukt' },
        { value: 'PBR', label: 'Beratung / Professional Services' }
      ]
    }
    expect(store.data.enums.vendorType).toHaveLength(8)
    const values = store.data.enums.vendorType.map(t => t.value)
    expect(values).toContain('MSP')
    expect(values).toContain('HYP')
    expect(values).toContain('SAAS-S')
    expect(values).toContain('LIC')
  })

  it('vendors can be filtered by vendorType', () => {
    store.data.vendors = [
      { id: 'VND-001', name: 'SAP SE', vendorType: 'LIC' },
      { id: 'VND-002', name: 'Microsoft', vendorType: 'HYP' },
      { id: 'VND-003', name: 'Salesforce', vendorType: 'SAAS-S' },
      { id: 'VND-004', name: 'Personio', vendorType: 'SAAS-S' }
    ]
    const saasVendors = store.data.vendors.filter(v => v.vendorType === 'SAAS-S')
    expect(saasVendors).toHaveLength(2)
    const licVendors = store.data.vendors.filter(v => v.vendorType === 'LIC')
    expect(licVendors).toHaveLength(1)
    expect(licVendors[0].name).toBe('SAP SE')
  })

  it('vendorType label can be resolved from enum', () => {
    store.data.enums = {
      vendorType: [
        { value: 'HYP', label: 'Hyperscaler' },
        { value: 'LIC', label: 'Lizenz-Software' }
      ]
    }
    const vendorTypeLabel = (val) => {
      const types = store.data.enums.vendorType || []
      const t = types.find(e => e.value === val)
      return t ? t.label : val
    }
    expect(vendorTypeLabel('HYP')).toBe('Hyperscaler')
    expect(vendorTypeLabel('LIC')).toBe('Lizenz-Software')
    expect(vendorTypeLabel('UNKNOWN')).toBe('UNKNOWN')
  })
})

// ─── Demand CRUD ──────────────────────────────────────────

describe('Demand CRUD', () => {
  it('demandById finds a demand', () => {
    store.data.demands = [{ id: 'DEM-001', title: 'New CRM' }]
    expect(store.demandById('DEM-001').title).toBe('New CRM')
  })

  it('demandById handles missing demands', () => {
    store.data.demands = undefined
    expect(store.demandById('DEM-001')).toBeUndefined()
  })

  it('addDemand assigns auto-generated id', () => {
    store.addDemand({ title: 'New Demand' })
    expect(store.data.demands).toHaveLength(1)
    expect(store.data.demands[0].id).toBe('DEM-001')
  })

  it('addDemand increments id based on existing demands', () => {
    store.data.demands = [{ id: 'DEM-005', title: 'Existing' }]
    store.addDemand({ title: 'New' })
    expect(store.data.demands[1].id).toBe('DEM-006')
  })

  it('addDemand preserves explicit id', () => {
    store.addDemand({ id: 'DEM-100', title: 'Explicit' })
    expect(store.data.demands[0].id).toBe('DEM-100')
  })

  it('updateDemand patches demand properties', () => {
    store.data.demands = [{ id: 'DEM-001', title: 'Old', status: 'draft' }]
    store.updateDemand('DEM-001', { title: 'Updated', status: 'approved' })
    expect(store.demandById('DEM-001').title).toBe('Updated')
  })

  it('deleteDemand removes demand', () => {
    store.data.demands = [{ id: 'DEM-001' }, { id: 'DEM-002' }]
    store.deleteDemand('DEM-001')
    expect(store.data.demands).toHaveLength(1)
  })

  it('deleteDemand handles missing array', () => {
    store.data.demands = undefined
    store.deleteDemand('DEM-001')
  })

  it('demandsForDomain filters by primary and related domains', () => {
    store.data.demands = [
      { id: 'DEM-001', primaryDomain: 1 },
      { id: 'DEM-002', primaryDomain: 2, relatedDomains: [1] },
      { id: 'DEM-003', primaryDomain: 3 }
    ]
    expect(store.demandsForDomain(1)).toHaveLength(2)
  })

  it('demandsForApp filters by related apps', () => {
    store.data.demands = [
      { id: 'DEM-001', relatedApps: ['APP-001', 'APP-002'] },
      { id: 'DEM-002', relatedApps: ['APP-003'] }
    ]
    expect(store.demandsForApp('APP-001')).toHaveLength(1)
  })

  it('demandsForVendor filters by related vendors', () => {
    store.data.demands = [
      { id: 'DEM-001', relatedVendors: ['VND-001'] },
      { id: 'DEM-002', relatedVendors: ['VND-002'] }
    ]
    expect(store.demandsForVendor('VND-001')).toHaveLength(1)
  })
})

// ─── Integration CRUD ─────────────────────────────────────

describe('Integration CRUD', () => {
  it('integrationById finds an integration', () => {
    store.data.integrations = [{ id: 'INT-001', name: 'SAP-Salesforce' }]
    expect(store.integrationById('INT-001').name).toBe('SAP-Salesforce')
  })

  it('integrationById handles missing array', () => {
    store.data.integrations = undefined
    expect(store.integrationById('INT-001')).toBeUndefined()
  })

  it('addIntegration assigns auto-generated id', () => {
    store.addIntegration({ name: 'New Integration', sourceAppId: 'APP-001', targetAppId: 'APP-002' })
    expect(store.data.integrations).toHaveLength(1)
    expect(store.data.integrations[0].id).toBe('INT-001')
  })

  it('addIntegration increments id based on existing', () => {
    store.data.integrations = [{ id: 'INT-003', name: 'Existing' }]
    store.addIntegration({ name: 'New' })
    expect(store.data.integrations[1].id).toBe('INT-004')
  })

  it('updateIntegration patches integration properties', () => {
    store.data.integrations = [{ id: 'INT-001', name: 'Old' }]
    store.updateIntegration('INT-001', { name: 'Updated' })
    expect(store.integrationById('INT-001').name).toBe('Updated')
  })

  it('deleteIntegration removes integration', () => {
    store.data.integrations = [{ id: 'INT-001' }, { id: 'INT-002' }]
    store.deleteIntegration('INT-001')
    expect(store.data.integrations).toHaveLength(1)
  })

  it('deleteIntegration handles missing array', () => {
    store.data.integrations = undefined
    store.deleteIntegration('INT-001')
  })

  it('integrationsForApp returns integrations involving an app', () => {
    store.data.integrations = [
      { id: 'INT-001', sourceAppId: 'APP-001', targetAppId: 'APP-002' },
      { id: 'INT-002', sourceAppId: 'APP-003', targetAppId: 'APP-001' },
      { id: 'INT-003', sourceAppId: 'APP-004', targetAppId: 'APP-005' }
    ]
    expect(store.integrationsForApp('APP-001')).toHaveLength(2)
  })
})

// ─── Management KPI ───────────────────────────────────────

describe('Management KPI', () => {
  it('updateManagementKPI patches KPI properties', () => {
    store.data.managementKPIs = [
      { id: 'KPI-001', name: 'Uptime', current: 99.5, target: 99.9 }
    ]
    store.updateManagementKPI('KPI-001', { current: 99.8 })
    expect(store.data.managementKPIs[0].current).toBe(99.8)
  })

  it('updateManagementKPI handles missing KPIs', () => {
    store.data.managementKPIs = undefined
    store.updateManagementKPI('KPI-001', { current: 99.8 }) // should not throw
  })
})

// ─── Global Search ────────────────────────────────────────

describe('Global Search', () => {
  beforeEach(() => {
    store.data.applications = [
      { id: 'APP-001', name: 'SAP S/4HANA', vendor: 'SAP SE', category: 'ERP', description: 'Enterprise resource planning' },
      { id: 'APP-002', name: 'Salesforce CRM', vendor: 'Salesforce', category: 'CRM', description: 'Customer relationship management' }
    ]
    store.data.domains = [
      { id: 1, name: 'IT Infrastructure', description: 'Cloud and datacenter', domainOwner: 'CIO', capabilities: [
        { id: '1.1', name: 'Cloud Platform', description: 'Public cloud services' }
      ]},
      { id: 2, name: 'Sales & Marketing', description: 'Revenue generation', domainOwner: 'CSO', capabilities: [] }
    ]
    store.data.projects = [
      { id: 'PRJ-001', name: 'SAP Upgrade 2025', category: 'Modernisierung', status: 'yellow', sponsor: 'CFO' }
    ]
    store.data.vendors = [
      { id: 'VND-001', name: 'SAP SE', category: 'ERP', description: 'Strategic ERP partner' }
    ]
    store.data.e2eProcesses = [
      { id: 'O2C', name: 'Order-to-Cash', owner: 'Vertriebsleiter', description: 'From order to delivery' }
    ]
    store.data.demands = [
      { id: 'DEM-001', title: 'SAP Integration Enhancement', category: 'Projekt', status: 'In Bewertung', description: 'Improve SAP integrations' }
    ]
  })

  it('returns empty array for empty query', () => {
    expect(store.globalSearch('')).toEqual([])
    expect(store.globalSearch('  ')).toEqual([])
    expect(store.globalSearch(null)).toEqual([])
    expect(store.globalSearch(undefined)).toEqual([])
  })

  it('finds applications by name', () => {
    const results = store.globalSearch('SAP')
    const appResults = results.filter(r => r.type === 'Application')
    expect(appResults.length).toBeGreaterThanOrEqual(1)
    expect(appResults[0].name).toBe('SAP S/4HANA')
    expect(appResults[0].route).toBe('/apps/APP-001')
  })

  it('finds domains by name', () => {
    const results = store.globalSearch('Infrastructure')
    const domainResults = results.filter(r => r.type === 'Domain')
    expect(domainResults).toHaveLength(1)
    expect(domainResults[0].name).toBe('IT Infrastructure')
    expect(domainResults[0].route).toBe('/domains/1')
  })

  it('finds capabilities within domains', () => {
    const results = store.globalSearch('Cloud Platform')
    const capResults = results.filter(r => r.type === 'Capability')
    expect(capResults).toHaveLength(1)
    expect(capResults[0].name).toBe('Cloud Platform')
    expect(capResults[0].route).toBe('/domains/1')
  })

  it('finds projects by name', () => {
    const results = store.globalSearch('Upgrade')
    const projResults = results.filter(r => r.type === 'Project')
    expect(projResults).toHaveLength(1)
    expect(projResults[0].name).toBe('SAP Upgrade 2025')
    expect(projResults[0].route).toBe('/projects/PRJ-001')
  })

  it('finds vendors by name', () => {
    const results = store.globalSearch('SAP SE')
    const vendorResults = results.filter(r => r.type === 'Vendor')
    expect(vendorResults).toHaveLength(1)
    expect(vendorResults[0].route).toBe('/vendors/VND-001')
  })

  it('finds processes by name', () => {
    const results = store.globalSearch('Order-to-Cash')
    const procResults = results.filter(r => r.type === 'Process')
    expect(procResults).toHaveLength(1)
    expect(procResults[0].route).toBe('/processes/O2C')
  })

  it('finds demands by title', () => {
    const results = store.globalSearch('Integration Enhancement')
    const demandResults = results.filter(r => r.type === 'Demand')
    expect(demandResults).toHaveLength(1)
    expect(demandResults[0].route).toBe('/demands/DEM-001')
  })

  it('search is case-insensitive', () => {
    const results = store.globalSearch('sap')
    expect(results.length).toBeGreaterThan(0)
  })

  it('searches across all entity types at once', () => {
    const results = store.globalSearch('SAP')
    const types = [...new Set(results.map(r => r.type))]
    expect(types).toContain('Application')
    expect(types).toContain('Project')
    expect(types).toContain('Vendor')
    expect(types).toContain('Demand')
  })

  it('searches in description fields', () => {
    const results = store.globalSearch('resource planning')
    const appResults = results.filter(r => r.type === 'Application')
    expect(appResults).toHaveLength(1)
    expect(appResults[0].name).toBe('SAP S/4HANA')
  })

  it('handles missing entity arrays gracefully', () => {
    store.data.applications = undefined
    store.data.domains = undefined
    store.data.projects = undefined
    store.data.vendors = undefined
    store.data.e2eProcesses = undefined
    store.data.demands = undefined
    expect(store.globalSearch('test')).toEqual([])
  })
})

// ─── E2E Process relationships ────────────────────────────

describe('Process Relationships', () => {
  beforeEach(() => {
    store.data.domains = [
      { id: 1, name: 'Sales', capabilities: [{ id: '1.1', name: 'CRM' }] },
      { id: 2, name: 'Logistics', capabilities: [{ id: '2.1', name: 'Warehouse' }] }
    ]
    store.data.applications = [
      { id: 'APP-001', name: 'Salesforce' },
      { id: 'APP-002', name: 'SAP WM' }
    ]
    store.data.capabilityMappings = [
      { capabilityId: '1.1', applicationId: 'APP-001', role: 'Primary' },
      { capabilityId: '2.1', applicationId: 'APP-002', role: 'Primary' }
    ]
    store.data.e2eProcesses = [
      { id: 'PRC-001', name: 'Order-to-Cash', domains: [1, 2] },
      { id: 'PRC-002', name: 'Procurement', domains: [2] }
    ]
  })

  it('appsForProcess returns apps via domain→capability→mapping chain', () => {
    const apps = store.appsForProcess('PRC-001')
    expect(apps).toHaveLength(2)
    const names = apps.map(a => a.name)
    expect(names).toContain('Salesforce')
    expect(names).toContain('SAP WM')
  })

  it('appsForProcess returns empty for unknown process', () => {
    expect(store.appsForProcess('PRC-999')).toEqual([])
  })

  it('processesForApp finds processes touching an application', () => {
    const procs = store.processesForApp('APP-001')
    expect(procs).toHaveLength(1)
    expect(procs[0].name).toBe('Order-to-Cash')
  })

  it('processesForApp returns both processes for APP-002', () => {
    const procs = store.processesForApp('APP-002')
    expect(procs).toHaveLength(2)
  })
})

// ─── Legal Entity CRUD ─────────────────────────────────────

describe('Legal Entity CRUD', () => {
  beforeEach(() => {
    store.data.legalEntities = [
      { id: 'ENT-001', name: 'Parent Corp', shortName: 'Parent', country: 'AT', city: 'Wien', region: 'Headquarters', parentEntity: null },
      { id: 'ENT-002', name: 'Subsidiary GmbH', shortName: 'Sub', country: 'DE', city: 'München', region: 'DACH', parentEntity: 'ENT-001' }
    ]
    store.data.applications = [
      { id: 'APP-001', name: 'ERP', vendor: 'SAP', entities: ['ENT-001', 'ENT-002'], criticality: 'Mission-Critical', timeQuadrant: 'Invest' },
      { id: 'APP-002', name: 'CRM', vendor: 'SF', entities: ['ENT-001'], criticality: 'Business-Critical', timeQuadrant: 'Invest' },
      { id: 'APP-003', name: 'HRM', vendor: 'HR', entities: ['ENT-002'], criticality: 'Administrative', timeQuadrant: 'Tolerate' }
    ]
  })

  it('totalEntities returns count of legal entities', () => {
    expect(store.totalEntities).toBe(2)
  })

  it('totalEntities handles missing legalEntities array', () => {
    store.data.legalEntities = undefined
    expect(store.totalEntities).toBe(0)
  })

  it('entityById finds entity by id', () => {
    const e = store.entityById('ENT-001')
    expect(e).toBeDefined()
    expect(e.shortName).toBe('Parent')
  })

  it('entityById returns undefined for unknown id', () => {
    expect(store.entityById('ENT-999')).toBeUndefined()
  })

  it('addEntity creates legalEntities array if needed', () => {
    store.data.legalEntities = undefined
    store.addEntity({ name: 'New Corp', shortName: 'NC', country: 'CH', city: 'Zürich', region: 'DACH' })
    expect(store.data.legalEntities).toHaveLength(1)
    expect(store.data.legalEntities[0].id).toBe('ENT-001')
  })

  it('addEntity appends entity with auto-generated id', () => {
    store.addEntity({ name: 'New Corp', shortName: 'NC', country: 'CH', city: 'Zürich', region: 'DACH' })
    expect(store.data.legalEntities).toHaveLength(3)
    expect(store.data.legalEntities[2].shortName).toBe('NC')
    expect(store.data.legalEntities[2].id).toBe('ENT-003')
  })

  it('addEntity preserves explicit id', () => {
    store.addEntity({ id: 'ENT-100', name: 'Explicit', shortName: 'EX' })
    expect(store.entityById('ENT-100')).toBeDefined()
  })

  it('addEntity avoids duplicate id after deletion', () => {
    store.addEntity({ name: 'Third', shortName: 'T3' })
    expect(store.data.legalEntities[2].id).toBe('ENT-003')
    store.deleteEntity('ENT-003')
    store.addEntity({ name: 'Fourth', shortName: 'T4' })
    // max existing is ENT-002 → next is ENT-003 (reuses gap, no conflict)
    expect(store.data.legalEntities[2].id).toBe('ENT-003')
  })

  it('updateEntity patches entity properties', () => {
    store.updateEntity('ENT-001', { name: 'Updated Corp', city: 'Graz' })
    const e = store.entityById('ENT-001')
    expect(e.name).toBe('Updated Corp')
    expect(e.city).toBe('Graz')
    expect(e.shortName).toBe('Parent')
  })

  it('updateEntity does nothing for unknown id', () => {
    store.updateEntity('ENT-999', { name: 'Nope' })
    expect(store.data.legalEntities).toHaveLength(2)
  })

  it('deleteEntity removes entity by id', () => {
    store.deleteEntity('ENT-002')
    expect(store.data.legalEntities).toHaveLength(1)
    expect(store.entityById('ENT-002')).toBeUndefined()
  })

  it('deleteEntity handles missing array', () => {
    store.data.legalEntities = undefined
    store.deleteEntity('ENT-001')
    expect(store.data.legalEntities).toBeUndefined()
  })

  it('appsForEntity returns apps assigned to entity', () => {
    const apps = store.appsForEntity('ENT-001')
    expect(apps).toHaveLength(2)
    expect(apps.map(a => a.name)).toContain('ERP')
    expect(apps.map(a => a.name)).toContain('CRM')
  })

  it('appsForEntity returns apps for subsidiary', () => {
    const apps = store.appsForEntity('ENT-002')
    expect(apps).toHaveLength(2)
    expect(apps.map(a => a.name)).toContain('ERP')
    expect(apps.map(a => a.name)).toContain('HRM')
  })

  it('appsForEntity returns empty for unknown entity', () => {
    expect(store.appsForEntity('ENT-999')).toEqual([])
  })

  it('entitiesForApp returns entities for an app', () => {
    const ents = store.entitiesForApp('APP-001')
    expect(ents).toHaveLength(2)
    expect(ents.map(e => e.shortName)).toContain('Parent')
    expect(ents.map(e => e.shortName)).toContain('Sub')
  })

  it('entitiesForApp returns empty for app without entities', () => {
    store.data.applications.push({ id: 'APP-004', name: 'NoEnt', vendor: 'X' })
    expect(store.entitiesForApp('APP-004')).toEqual([])
  })
})

// ─── Feature Toggles ──────────────────────────────────────

describe('Feature Toggles', () => {
  beforeEach(() => {
    store.featureToggles = { analysisEnabled: true, governanceEnabled: true }
  })

  it('featureToggles has correct default shape', () => {
    expect(store.featureToggles).toHaveProperty('analysisEnabled')
    expect(store.featureToggles).toHaveProperty('governanceEnabled')
  })

  it('featureToggles defaults to both enabled', () => {
    expect(store.featureToggles.analysisEnabled).toBe(true)
    expect(store.featureToggles.governanceEnabled).toBe(true)
  })

  it('analysisEnabled can be toggled off', () => {
    store.featureToggles.analysisEnabled = false
    expect(store.featureToggles.analysisEnabled).toBe(false)
    expect(store.featureToggles.governanceEnabled).toBe(true)
  })

  it('governanceEnabled can be toggled off', () => {
    store.featureToggles.governanceEnabled = false
    expect(store.featureToggles.governanceEnabled).toBe(false)
    expect(store.featureToggles.analysisEnabled).toBe(true)
  })

  it('both toggles can be disabled independently', () => {
    store.featureToggles.analysisEnabled = false
    store.featureToggles.governanceEnabled = false
    expect(store.featureToggles.analysisEnabled).toBe(false)
    expect(store.featureToggles.governanceEnabled).toBe(false)
  })

  it('complianceEnabled defaults to false', () => {
    // Reset featureToggles to the default state (as if localStorage was empty)
    store.featureToggles = JSON.parse('{"analysisEnabled":true,"governanceEnabled":true,"complianceEnabled":false,"selectedRegulations":[]}')
    expect(store.featureToggles.complianceEnabled).toBe(false)
  })

  it('complianceEnabled can be toggled on', () => {
    store.featureToggles.complianceEnabled = true
    expect(store.featureToggles.complianceEnabled).toBe(true)
  })

  it('selectedRegulations defaults to empty array', () => {
    store.featureToggles = JSON.parse('{"analysisEnabled":true,"governanceEnabled":true,"complianceEnabled":false,"selectedRegulations":[]}')
    expect(store.featureToggles.selectedRegulations).toEqual([])
  })

  it('selectedRegulations can hold regulation values', () => {
    store.featureToggles.selectedRegulations = ['GDPR', 'DORA']
    expect(store.featureToggles.selectedRegulations).toContain('GDPR')
    expect(store.featureToggles.selectedRegulations).toContain('DORA')
    expect(store.featureToggles.selectedRegulations).toHaveLength(2)
  })

  it('compliance toggle is independent of other toggles', () => {
    store.featureToggles.complianceEnabled = true
    store.featureToggles.analysisEnabled = false
    expect(store.featureToggles.complianceEnabled).toBe(true)
    expect(store.featureToggles.analysisEnabled).toBe(false)
    expect(store.featureToggles.governanceEnabled).toBe(true)
  })
})

// ─── Compliance Helpers (Phase C2) ───────────────────────────

describe('Compliance Helpers', () => {
  beforeEach(() => {
    store.data.applications = [
      { id: 'APP-001', name: 'App One', vendor: 'Vendor A', criticality: 'Mission-Critical', regulations: ['GDPR', 'ISO27001', 'NIS2'] },
      { id: 'APP-002', name: 'App Two', vendor: 'Vendor A', criticality: 'Business-Critical', regulations: ['GDPR', 'ISO27001'] },
      { id: 'APP-003', name: 'App Three', vendor: 'Vendor B', criticality: 'Administrative', regulations: ['ISO27001'] }
    ]
    store.data.complianceAssessments = [
      { id: 'CA-001', appId: 'APP-001', regulation: 'GDPR', status: 'compliant', assessedBy: 'Max', assessedDate: '2025-11-15' },
      { id: 'CA-002', appId: 'APP-001', regulation: 'ISO27001', status: 'partial', assessedBy: 'Max', assessedDate: '2025-11-15' },
      { id: 'CA-003', appId: 'APP-002', regulation: 'GDPR', status: 'nonCompliant', assessedBy: 'Lisa', assessedDate: '2025-10-01' },
      { id: 'CA-004', appId: 'APP-002', regulation: 'ISO27001', status: 'compliant', assessedBy: 'Lisa', assessedDate: '2025-10-01' },
      { id: 'CA-005', appId: 'APP-003', regulation: 'ISO27001', status: 'notAssessed', assessedBy: 'Tom', assessedDate: '2025-09-15' }
    ]
  })

  it('assessmentsForApp returns assessments for a given app', () => {
    const result = store.assessmentsForApp('APP-001')
    expect(result).toHaveLength(2)
    expect(result[0].regulation).toBe('GDPR')
    expect(result[1].regulation).toBe('ISO27001')
  })

  it('assessmentsForApp returns empty for unknown app', () => {
    expect(store.assessmentsForApp('APP-999')).toHaveLength(0)
  })

  it('assessmentsForRegulation returns assessments for a given regulation', () => {
    const result = store.assessmentsForRegulation('ISO27001')
    expect(result).toHaveLength(3)
  })

  it('complianceGaps detects missing assessments', () => {
    const gaps = store.complianceGaps
    // APP-001 is missing NIS2 assessment, APP-003 has notAssessed for ISO27001
    const missingGap = gaps.find(g => g.appId === 'APP-001' && g.regulation === 'NIS2')
    expect(missingGap).toBeDefined()
    expect(missingGap.reason).toBe('missing')
  })

  it('complianceGaps detects notAssessed as a gap', () => {
    const gaps = store.complianceGaps
    const notAssessedGap = gaps.find(g => g.appId === 'APP-003' && g.regulation === 'ISO27001')
    expect(notAssessedGap).toBeDefined()
    expect(notAssessedGap.reason).toBe('notAssessed')
  })

  it('regulationLoadScores sorts apps by regulation count descending', () => {
    const scores = store.regulationLoadScores
    expect(scores).toHaveLength(3)
    expect(scores[0].appId).toBe('APP-001')
    expect(scores[0].count).toBe(3)
    expect(scores[1].count).toBe(2)
    expect(scores[2].count).toBe(1)
  })

  it('vendorComplianceStatus aggregates per vendor', () => {
    const status = store.vendorComplianceStatus
    expect(status.length).toBeGreaterThan(0)
    const vendorA = status.find(v => v.vendor === 'Vendor A')
    expect(vendorA).toBeDefined()
    expect(vendorA.apps).toBe(2)
    expect(vendorA.compliant).toBeGreaterThanOrEqual(1)
  })

  it('vendorComplianceStatus calculates compliance rate', () => {
    const status = store.vendorComplianceStatus
    const vendorB = status.find(v => v.vendor === 'Vendor B')
    expect(vendorB).toBeDefined()
    expect(vendorB.complianceRate).toBe(0) // only notAssessed
  })

  it('overallComplianceScore calculates percentage', () => {
    const score = store.overallComplianceScore
    // Total applicable: 3 (APP-001) + 2 (APP-002) + 1 (APP-003) = 6
    // Compliant: GDPR-APP001(1) + ISO27001-APP002(1) = 2
    // Partial: ISO27001-APP001(0.5) = 0.5
    // Total compliant: 2.5 / 6 = 41.67%
    expect(score).toBe(42) // Math.round(2.5/6*100) = 42
  })

  it('overallComplianceScore handles empty data', () => {
    store.data.applications = []
    store.data.complianceAssessments = []
    expect(store.overallComplianceScore).toBe(0)
  })

  it('complianceGaps handles apps without regulations array', () => {
    store.data.applications.push({ id: 'APP-099', name: 'No Regs App', vendor: 'X' })
    const gaps = store.complianceGaps
    expect(gaps.find(g => g.appId === 'APP-099')).toBeUndefined()
  })
})

// ─── Compliance Helpers (Phase C3) ───────────────────────────

describe('Compliance Phase C3 — Workflow Transitions', () => {
  beforeEach(() => {
    store.data.applications = [
      { id: 'APP-001', name: 'App One', vendor: 'Vendor A', criticality: 'Mission-Critical', dataClassification: 'personenbezogeneDaten', regulations: ['GDPR', 'ISO27001'] },
      { id: 'APP-002', name: 'App Two', vendor: 'Vendor A', criticality: 'Administrative', dataClassification: 'intern', regulations: ['ISO27001'] }
    ]
    store.data.complianceAssessments = [
      { id: 'CA-001', appId: 'APP-001', regulation: 'GDPR', status: 'compliant', workflowStatus: 'open', assessedBy: 'Max', assessedDate: '2025-01-15', deadline: '2025-06-30', auditTrail: [] },
      { id: 'CA-002', appId: 'APP-001', regulation: 'ISO27001', status: 'partial', workflowStatus: 'inReview', assessedBy: 'Max', assessedDate: '2025-02-10', deadline: '2025-03-15', auditTrail: [] },
      { id: 'CA-003', appId: 'APP-002', regulation: 'ISO27001', status: 'nonCompliant', workflowStatus: 'assessed', assessedBy: 'Lisa', assessedDate: '2025-01-20', deadline: '2025-12-31', auditTrail: [] }
    ]
    store.data.enums = {
      complianceRegulations: [
        { value: 'GDPR', label: 'GDPR / DSGVO', description: 'General Data Protection Regulation', deadline: '2018-05-25', applicableScopes: ['personenbezogeneDaten'], applicableCriticalities: ['Mission-Critical', 'Business-Critical', 'Administrative'] },
        { value: 'ISO27001', label: 'ISO 27001', description: 'Information Security Management', deadline: '2025-10-31', applicableScopes: ['alle'], applicableCriticalities: ['Mission-Critical', 'Business-Critical'] },
        { value: 'DORA', label: 'DORA', description: 'Digital Operational Resilience Act', deadline: '2025-01-17', applicableScopes: ['finanzdaten', 'kritischeInfrastruktur'], applicableCriticalities: ['Mission-Critical'] }
      ]
    }
    store.data.domains = [
      { id: 1, name: 'IT', color: '#3b82f6', capabilities: [{ id: '1.1' }] }
    ]
    store.data.capabilityMappings = [
      { capabilityId: '1.1', applicationId: 'APP-001', role: 'Primary' }
    ]
  })

  it('valid transition open → inReview succeeds', () => {
    const result = store.assessmentWorkflowTransition('CA-001', 'inReview', 'Max', 'Starting review')
    expect(result).toBe(true)
    const a = store.data.complianceAssessments.find(x => x.id === 'CA-001')
    expect(a.workflowStatus).toBe('inReview')
  })

  it('valid transition inReview → assessed succeeds', () => {
    const result = store.assessmentWorkflowTransition('CA-002', 'assessed', 'Max', 'Done')
    expect(result).toBe(true)
    const a = store.data.complianceAssessments.find(x => x.id === 'CA-002')
    expect(a.workflowStatus).toBe('assessed')
  })

  it('invalid transition open → assessed fails', () => {
    const result = store.assessmentWorkflowTransition('CA-001', 'assessed', 'Max')
    expect(result).toBe(false)
    const a = store.data.complianceAssessments.find(x => x.id === 'CA-001')
    expect(a.workflowStatus).toBe('open')
  })

  it('transition for unknown assessment returns false', () => {
    expect(store.assessmentWorkflowTransition('CA-999', 'inReview', 'Max')).toBe(false)
  })

  it('transition adds audit trail entry', () => {
    store.assessmentWorkflowTransition('CA-001', 'inReview', 'Max', 'Review started')
    const trail = store.auditTrailForAssessment('CA-001')
    expect(trail.length).toBe(1)
    expect(trail[0].action).toBe('statusChange')
    expect(trail[0].fromStatus).toBe('open')
    expect(trail[0].toStatus).toBe('inReview')
    expect(trail[0].user).toBe('Max')
    expect(trail[0].comment).toBe('Review started')
  })
})

describe('Compliance Phase C3 — Audit Trail', () => {
  beforeEach(() => {
    store.data.complianceAssessments = [
      { id: 'CA-001', appId: 'APP-001', regulation: 'GDPR', status: 'compliant', auditTrail: [
        { timestamp: '2025-01-15T09:00:00Z', user: 'Max', action: 'created', fromStatus: null, toStatus: 'open', comment: 'Created' }
      ] },
      { id: 'CA-002', appId: 'APP-002', regulation: 'ISO27001', status: 'partial', auditTrail: [] }
    ]
  })

  it('auditTrailForAssessment returns trail', () => {
    const trail = store.auditTrailForAssessment('CA-001')
    expect(trail).toHaveLength(1)
    expect(trail[0].user).toBe('Max')
  })

  it('auditTrailForAssessment returns empty for no trail', () => {
    expect(store.auditTrailForAssessment('CA-002')).toHaveLength(0)
  })

  it('auditTrailForAssessment returns empty for unknown', () => {
    expect(store.auditTrailForAssessment('CA-999')).toHaveLength(0)
  })
})

describe('Compliance Phase C3 — Deadline Warnings', () => {
  beforeEach(() => {
    store.data.applications = [
      { id: 'APP-001', name: 'App One', vendor: 'V', regulations: ['GDPR'] }
    ]
    const now = new Date()
    const soon = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const past = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const far = new Date(now.getTime() + 200 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    store.data.complianceAssessments = [
      { id: 'CA-001', appId: 'APP-001', regulation: 'GDPR', status: 'partial', deadline: soon, workflowStatus: 'inReview', auditTrail: [] },
      { id: 'CA-002', appId: 'APP-001', regulation: 'ISO', status: 'compliant', deadline: past, workflowStatus: 'assessed', auditTrail: [] },
      { id: 'CA-003', appId: 'APP-001', regulation: 'NIS2', status: 'compliant', deadline: far, workflowStatus: 'assessed', auditTrail: [] }
    ]
  })

  it('deadlineWarnings includes soon and expired, excludes far', () => {
    const warnings = store.deadlineWarnings
    expect(warnings.find(w => w.assessmentId === 'CA-001')).toBeDefined()
    expect(warnings.find(w => w.assessmentId === 'CA-002')).toBeDefined()
    expect(warnings.find(w => w.assessmentId === 'CA-003')).toBeUndefined()
  })

  it('deadlineWarnings marks expired correctly', () => {
    const warnings = store.deadlineWarnings
    const expired = warnings.find(w => w.assessmentId === 'CA-002')
    expect(expired.expired).toBe(true)
    expect(expired.daysRemaining).toBeLessThan(0)
  })

  it('deadlineWarnings sorted by daysRemaining ascending', () => {
    const warnings = store.deadlineWarnings
    for (let i = 1; i < warnings.length; i++) {
      expect(warnings[i].daysRemaining).toBeGreaterThanOrEqual(warnings[i - 1].daysRemaining)
    }
  })
})

describe('Compliance Phase C3 — Regulation Deadline Warnings', () => {
  beforeEach(() => {
    store.data.enums = {
      complianceRegulations: [
        { value: 'GDPR', label: 'GDPR', description: 'GDPR', deadline: '2018-05-25' },
        { value: 'DORA', label: 'DORA', description: 'DORA', deadline: '2025-01-17' },
        { value: 'FUTURE', label: 'Future Reg', description: 'Future', deadline: '2099-01-01' }
      ]
    }
  })

  it('regulationDeadlineWarnings includes expired and close deadlines', () => {
    const warnings = store.regulationDeadlineWarnings
    expect(warnings.find(w => w.value === 'GDPR')).toBeDefined()
    expect(warnings.find(w => w.value === 'DORA')).toBeDefined()
  })

  it('regulationDeadlineWarnings excludes far-future deadlines', () => {
    const warnings = store.regulationDeadlineWarnings
    expect(warnings.find(w => w.value === 'FUTURE')).toBeUndefined()
  })
})

describe('Compliance Phase C3 — Auto-Assign Regulations', () => {
  beforeEach(() => {
    store.data.enums = {
      complianceRegulations: [
        { value: 'GDPR', label: 'GDPR', description: 'GDPR', applicableScopes: ['personenbezogeneDaten'], applicableCriticalities: ['Mission-Critical', 'Business-Critical', 'Administrative'] },
        { value: 'ISO27001', label: 'ISO 27001', description: 'ISO', applicableScopes: ['alle'], applicableCriticalities: ['Mission-Critical', 'Business-Critical'] },
        { value: 'DORA', label: 'DORA', description: 'DORA', applicableScopes: ['finanzdaten', 'kritischeInfrastruktur'], applicableCriticalities: ['Mission-Critical'] },
        { value: 'BAIT', label: 'BAIT', description: 'BAIT', applicableScopes: ['finanzdaten'], applicableCriticalities: ['Mission-Critical'] }
      ]
    }
  })

  it('assigns GDPR and ISO27001 to Mission-Critical app with personenbezogeneDaten', () => {
    const regs = store.autoAssignRegulations({ criticality: 'Mission-Critical', dataClassification: 'personenbezogeneDaten' })
    expect(regs).toContain('GDPR')
    expect(regs).toContain('ISO27001')
  })

  it('assigns DORA to Mission-Critical with finanzdaten', () => {
    const regs = store.autoAssignRegulations({ criticality: 'Mission-Critical', dataClassification: 'finanzdaten' })
    expect(regs).toContain('DORA')
    expect(regs).toContain('BAIT')
  })

  it('does not assign DORA to Administrative app', () => {
    const regs = store.autoAssignRegulations({ criticality: 'Administrative', dataClassification: 'finanzdaten' })
    expect(regs).not.toContain('DORA')
  })

  it('assigns GDPR to Administrative app with personenbezogeneDaten', () => {
    const regs = store.autoAssignRegulations({ criticality: 'Administrative', dataClassification: 'personenbezogeneDaten' })
    expect(regs).toContain('GDPR')
    expect(regs).not.toContain('ISO27001')
  })
})

describe('Compliance Phase C3 — Domain Compliance Scorecard', () => {
  beforeEach(() => {
    store.data.domains = [
      { id: 1, name: 'IT Ops', color: '#3b82f6', capabilities: [{ id: '1.1' }, { id: '1.2' }] },
      { id: 2, name: 'Finance', color: '#10b981', capabilities: [{ id: '2.1' }] }
    ]
    store.data.applications = [
      { id: 'APP-001', name: 'App One', regulations: ['GDPR', 'ISO27001'] },
      { id: 'APP-002', name: 'App Two', regulations: ['GDPR'] }
    ]
    store.data.capabilityMappings = [
      { capabilityId: '1.1', applicationId: 'APP-001' },
      { capabilityId: '2.1', applicationId: 'APP-002' }
    ]
    store.data.complianceAssessments = [
      { id: 'CA-001', appId: 'APP-001', regulation: 'GDPR', status: 'compliant' },
      { id: 'CA-002', appId: 'APP-001', regulation: 'ISO27001', status: 'partial' },
      { id: 'CA-003', appId: 'APP-002', regulation: 'GDPR', status: 'nonCompliant' }
    ]
  })

  it('returns scorecard per domain', () => {
    const scorecard = store.complianceScorecardByDomain
    expect(scorecard.length).toBe(2)
  })

  it('calculates correct score for IT Ops domain', () => {
    const scorecard = store.complianceScorecardByDomain
    const itOps = scorecard.find(d => d.domainId === 1)
    expect(itOps).toBeDefined()
    expect(itOps.appCount).toBe(1)
    expect(itOps.compliant).toBe(1)
    expect(itOps.partial).toBe(1)
    // score = (1 + 0.5) / 2 * 100 = 75
    expect(itOps.score).toBe(75)
  })

  it('calculates correct score for Finance domain', () => {
    const scorecard = store.complianceScorecardByDomain
    const finance = scorecard.find(d => d.domainId === 2)
    expect(finance).toBeDefined()
    expect(finance.nonCompliant).toBe(1)
    expect(finance.score).toBe(0)
  })

  it('excludes domains with no apps mapped', () => {
    store.data.capabilityMappings = []
    const scorecard = store.complianceScorecardByDomain
    expect(scorecard).toHaveLength(0)
  })
})
