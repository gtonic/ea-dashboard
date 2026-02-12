import { describe, it, expect, beforeEach, vi } from 'vitest'
import { router } from '../app/js/router.js'

// We need to mock window.location and window.addEventListener for the router
// The router module has already been imported, so we test the reactive state directly

describe('Router State', () => {
  it('router has correct initial shape', () => {
    expect(router).toHaveProperty('path')
    expect(router).toHaveProperty('params')
    expect(router).toHaveProperty('query')
  })
})

describe('navigateTo', () => {
  it('sets window.location.hash', async () => {
    const { navigateTo } = await import('../app/js/router.js')
    navigateTo('/apps')
    expect(window.location.hash).toBe('#/apps')
  })

  it('navigates to nested path', async () => {
    const { navigateTo } = await import('../app/js/router.js')
    navigateTo('/domains/1')
    expect(window.location.hash).toBe('#/domains/1')
  })
})

describe('linkTo', () => {
  it('returns hash-prefixed path', async () => {
    const { linkTo } = await import('../app/js/router.js')
    expect(linkTo('/apps')).toBe('#/apps')
    expect(linkTo('/projects')).toBe('#/projects')
    expect(linkTo('/')).toBe('#/')
  })
})

describe('initRouter and route resolution', () => {
  it('resolves root path', async () => {
    const { initRouter } = await import('../app/js/router.js')
    window.location.hash = '#/'
    initRouter()
    // Trigger hashchange
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/')
    expect(router.component).toBe('dashboard-view')
  })

  it('resolves /apps path', () => {
    window.location.hash = '#/apps'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/apps')
    expect(router.component).toBe('app-list')
  })

  it('resolves /apps/APP-001 with params', () => {
    window.location.hash = '#/apps/APP-001'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/apps/APP-001')
    expect(router.component).toBe('app-detail')
    expect(router.params.id).toBe('APP-001')
  })

  it('resolves /domains path', () => {
    window.location.hash = '#/domains'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/domains')
    expect(router.component).toBe('domain-list')
  })

  it('resolves /domains/:id with numeric param', () => {
    window.location.hash = '#/domains/3'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/domains/3')
    expect(router.component).toBe('domain-detail')
    expect(router.params.id).toBe('3')
  })

  it('resolves /projects path', () => {
    window.location.hash = '#/projects'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/projects')
    expect(router.component).toBe('project-list')
  })

  it('resolves /projects/PRJ-001 with params', () => {
    window.location.hash = '#/projects/PRJ-001'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/projects/PRJ-001')
    expect(router.component).toBe('project-detail')
    expect(router.params.id).toBe('PRJ-001')
  })

  it('resolves /vendors path', () => {
    window.location.hash = '#/vendors'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/vendors')
    expect(router.component).toBe('vendor-list')
  })

  it('resolves /vendors/VND-001 with params', () => {
    window.location.hash = '#/vendors/VND-001'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/vendors/VND-001')
    expect(router.component).toBe('vendor-detail')
    expect(router.params.id).toBe('VND-001')
  })

  it('resolves /demands path', () => {
    window.location.hash = '#/demands'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/demands')
    expect(router.component).toBe('demand-list')
  })

  it('resolves /demands/DEM-001 with params', () => {
    window.location.hash = '#/demands/DEM-001'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/demands/DEM-001')
    expect(router.component).toBe('demand-detail')
    expect(router.params.id).toBe('DEM-001')
  })

  it('resolves /processes path', () => {
    window.location.hash = '#/processes'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/processes')
    expect(router.component).toBe('process-list')
  })

  it('resolves /capability-matrix path', () => {
    window.location.hash = '#/capability-matrix'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/capability-matrix')
    expect(router.component).toBe('cap-app-matrix')
  })

  it('resolves /budget-dashboard path', () => {
    window.location.hash = '#/budget-dashboard'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/budget-dashboard')
    expect(router.component).toBe('budget-dashboard')
  })

  it('resolves /risk-heatmap path', () => {
    window.location.hash = '#/risk-heatmap'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/risk-heatmap')
    expect(router.component).toBe('risk-heatmap')
  })

  it('resolves /data-quality path', () => {
    window.location.hash = '#/data-quality'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/data-quality')
    expect(router.component).toBe('data-quality')
  })

  it('resolves /roadmap path', () => {
    window.location.hash = '#/roadmap'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/roadmap')
    expect(router.component).toBe('roadmap-view')
  })

  it('resolves /executive-summary path', () => {
    window.location.hash = '#/executive-summary'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/executive-summary')
    expect(router.component).toBe('executive-summary')
  })

  it('resolves /settings path', () => {
    window.location.hash = '#/settings'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/settings')
    expect(router.component).toBe('settings-view')
  })

  it('resolves /demand-pipeline path', () => {
    window.location.hash = '#/demand-pipeline'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/demand-pipeline')
    expect(router.component).toBe('demand-pipeline')
  })

  it('resolves /integration-map path', () => {
    window.location.hash = '#/integration-map'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/integration-map')
    expect(router.component).toBe('integration-map')
  })

  it('resolves /ai-usecases path', () => {
    window.location.hash = '#/ai-usecases'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/ai-usecases')
    expect(router.component).toBe('ai-usecases-list')
  })

  it('resolves /time path', () => {
    window.location.hash = '#/time'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/time')
    expect(router.component).toBe('time-quadrant')
  })

  it('resolves /dependencies path', () => {
    window.location.hash = '#/dependencies'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/dependencies')
    expect(router.component).toBe('dependency-graph')
  })

  it('resolves /maturity-gap path', () => {
    window.location.hash = '#/maturity-gap'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/maturity-gap')
    expect(router.component).toBe('maturity-gap')
  })

  it('resolves /project-heatmap path', () => {
    window.location.hash = '#/project-heatmap'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/project-heatmap')
    expect(router.component).toBe('project-heatmap')
  })

  it('resolves /search path', () => {
    window.location.hash = '#/search'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/search')
    expect(router.component).toBe('global-search')
  })

  it('resolves /resource-overlaps path', () => {
    window.location.hash = '#/resource-overlaps'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/resource-overlaps')
    expect(router.component).toBe('resource-overlap')
  })

  it('resolves /scenario-planner path', () => {
    window.location.hash = '#/scenario-planner'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/scenario-planner')
    expect(router.component).toBe('scenario-planner')
  })

  it('resolves /vendor-scorecard path', () => {
    window.location.hash = '#/vendor-scorecard'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/vendor-scorecard')
    expect(router.component).toBe('vendor-scorecard')
  })

  it('resolves /capability-investment path', () => {
    window.location.hash = '#/capability-investment'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/capability-investment')
    expect(router.component).toBe('capability-investment')
  })

  it('resolves /conformity-scorecard path', () => {
    window.location.hash = '#/conformity-scorecard'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/conformity-scorecard')
    expect(router.component).toBe('conformity-scorecard')
  })

  it('resolves /tech-radar path', () => {
    window.location.hash = '#/tech-radar'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/tech-radar')
    expect(router.component).toBe('tech-radar')
  })

  it('resolves /ea-health-score path', () => {
    window.location.hash = '#/ea-health-score'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/ea-health-score')
    expect(router.component).toBe('ea-health-score')
  })

  it('resolves /app-lifecycle-timeline path', () => {
    window.location.hash = '#/app-lifecycle-timeline'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/app-lifecycle-timeline')
    expect(router.component).toBe('app-lifecycle-timeline')
  })

  it('resolves /tco-calculator path', () => {
    window.location.hash = '#/tco-calculator'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/tco-calculator')
    expect(router.component).toBe('tco-calculator')
  })

  it('falls back to dashboard for unknown routes', () => {
    window.location.hash = '#/nonexistent-page'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/')
    expect(router.component).toBe('dashboard-view')
  })

  it('parses query parameters', () => {
    window.location.hash = '#/apps?filter=active&sort=name'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.query.filter).toBe('active')
    expect(router.query.sort).toBe('name')
  })

  it('handles empty hash as root path', () => {
    window.location.hash = ''
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/')
    expect(router.component).toBe('dashboard-view')
  })

  it('resolves /compliance-dashboard path', () => {
    window.location.hash = '#/compliance-dashboard'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/compliance-dashboard')
    expect(router.component).toBe('compliance-dashboard')
  })

  it('resolves /compliance-audit path', () => {
    window.location.hash = '#/compliance-audit'
    window.dispatchEvent(new Event('hashchange'))
    expect(router.path).toBe('/compliance-audit')
    expect(router.component).toBe('compliance-audit')
  })
})
