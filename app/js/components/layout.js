// layout.js — App shell with grouped sidebar navigation, breadcrumbs, i18n, favorites
import { store } from '../store.js'
import { i18n } from '../i18n.js'
import { router, linkTo, navigateTo } from '../router.js'
import { auth } from '../api-client.js'

// ────────────────────────────────────────────
// SVG icon library (reusable)
// ────────────────────────────────────────────
const icons = {
  dashboard: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke-width="2"/></svg>',
  executive: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
  roadmap: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
  apps: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
  domains: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>',
  processes: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
  entities: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>',
  integrations: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>',
  dataObject: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3" stroke-width="2"/><path stroke-width="2" d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3"/><path stroke-width="2" d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/></svg>',
  demands: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
  pipeline: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18v4H3V4zm2 6h14v4H5v-4zm4 6h6v4H9v-4z"/></svg>',
  projects: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>',
  heatmap: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>',
  scenario: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  vendors: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
  scorecard: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
  capMatrix: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>',
  capInvest: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>',
  time: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>',
  maturity: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
  dependency: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>',
  overlap: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="9" cy="12" r="5" stroke-width="2"/><circle cx="15" cy="12" r="5" stroke-width="2"/></svg>',
  risk: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
  conformity: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  budget: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  quality: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
  ai: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-1.482 4.446A2.25 2.25 0 0115.378 21H8.622a2.25 2.25 0 01-2.14-1.554L5 14.5m14 0H5"/></svg>',
  settings: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  search: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>',
  techRadar: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M5 14.5l7 7 7-7"/></svg>',
  healthScore: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>',
  compliance: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
  star: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>',
  starFilled: '<svg fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>',
  chevronDown: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>',
  menu: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>',
  panelLeft: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2"/><line x1="9" y1="3" x2="9" y2="21" stroke-width="2"/></svg>',
  home: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
}

// ────────────────────────────────────────────
// Navigation structure definition
// ────────────────────────────────────────────
function buildNavGroups () {
  return [
    {
      id: 'overview',
      labelKey: 'nav.overview',
      icon: icons.dashboard,
      items: [
        { path: '/',                  labelKey: 'nav.dashboard',        icon: icons.dashboard,  pageKey: 'page.dashboard' },
        { path: '/executive-summary', labelKey: 'nav.executiveSummary', icon: icons.executive,  pageKey: 'page.executiveSummary' },
        { path: '/roadmap',           labelKey: 'nav.roadmap',          icon: icons.roadmap,    pageKey: 'page.roadmap' },
      ]
    },
    {
      id: 'portfolio',
      labelKey: 'nav.portfolio',
      icon: icons.apps,
      items: [
        { path: '/apps',             labelKey: 'nav.applications',  icon: icons.apps,         pageKey: 'page.applications',   badgeKey: 'totalApps' },
        { path: '/domains',          labelKey: 'nav.domains',       icon: icons.domains,      pageKey: 'page.domains' },
        { path: '/processes',        labelKey: 'nav.processes',     icon: icons.processes,    pageKey: 'page.processes' },
        { path: '/entities',         labelKey: 'nav.entities',      icon: icons.entities,     pageKey: 'page.entities' },
        { path: '/integration-map',  labelKey: 'nav.integrations',  icon: icons.integrations, pageKey: 'page.integrationMap' },
        { path: '/data-objects',     labelKey: 'nav.dataObjects',   icon: icons.dataObject,   pageKey: 'page.dataObjects',   badgeKey: 'totalDataObjects' },
      ]
    },
    {
      id: 'demand-project',
      labelKey: 'nav.projects',
      icon: icons.projects,
      items: [
        { path: '/demands',          labelKey: 'nav.demands',          icon: icons.demands,  pageKey: 'page.demands',         badgeKey: 'openDemands' },
        { path: '/demand-pipeline',  labelKey: 'nav.demandPipeline',   icon: icons.pipeline, pageKey: 'page.demandPipeline' },
        { path: '/projects',         labelKey: 'nav.projectPortfolio', icon: icons.projects, pageKey: 'page.projectPortfolio', badgeKey: 'totalProjects' },
        { path: '/project-heatmap',  labelKey: 'nav.projectHeatmap',   icon: icons.heatmap,  pageKey: 'page.projectHeatmap' },
        { path: '/scenario-planner', labelKey: 'nav.scenarioPlanner',  icon: icons.scenario, pageKey: 'page.scenarioPlanner' },
      ]
    },
    {
      id: 'vendors',
      labelKey: 'nav.vendors',
      icon: icons.vendors,
      items: [
        { path: '/vendors',          labelKey: 'nav.vendorList',      icon: icons.vendors,   pageKey: 'page.vendors',         badgeKey: 'totalVendors' },
        { path: '/vendor-scorecard', labelKey: 'nav.vendorScorecard', icon: icons.scorecard, pageKey: 'page.vendorScorecard' },
      ]
    },
    {
      id: 'analysis',
      labelKey: 'nav.analysis',
      icon: icons.capMatrix,
      items: [
        { path: '/capability-matrix',     labelKey: 'nav.capabilityMatrix',     icon: icons.capMatrix,  pageKey: 'page.capabilityMatrix' },
        { path: '/capability-investment',  labelKey: 'nav.capabilityInvestment', icon: icons.capInvest,  pageKey: 'page.capabilityInvestment' },
        { path: '/tech-radar',             labelKey: 'nav.techRadar',            icon: icons.techRadar,  pageKey: 'page.techRadar' },
        { path: '/time',                   labelKey: 'nav.timeQuadrant',         icon: icons.time,       pageKey: 'page.timeQuadrant' },
        { path: '/maturity-gap',           labelKey: 'nav.maturityGap',          icon: icons.maturity,   pageKey: 'page.maturityGap' },
        { path: '/dependencies',           labelKey: 'nav.dependencies',         icon: icons.dependency, pageKey: 'page.dependencies' },
        { path: '/resource-overlaps',      labelKey: 'nav.resourceOverlap',      icon: icons.overlap,    pageKey: 'page.resourceOverlap' },
        { path: '/skill-impact',            labelKey: 'nav.skillImpact',          icon: icons.overlap,    pageKey: 'page.skillImpact' },
        { path: '/app-lifecycle-timeline',  labelKey: 'nav.appLifecycleTimeline', icon: icons.roadmap,    pageKey: 'page.appLifecycleTimeline' },
      ]
    },
    {
      id: 'governance',
      labelKey: 'nav.governance',
      icon: icons.risk,
      items: [
        { path: '/risk-heatmap',          labelKey: 'nav.riskHeatmap',        icon: icons.risk,        pageKey: 'page.riskHeatmap' },
        { path: '/conformity-scorecard',  labelKey: 'nav.conformityScorecard', icon: icons.conformity, pageKey: 'page.conformityScorecard' },
        { path: '/budget-dashboard',      labelKey: 'nav.budgetDashboard',    icon: icons.budget,      pageKey: 'page.budgetDashboard' },
        { path: '/data-quality',          labelKey: 'nav.dataQuality',        icon: icons.quality,     pageKey: 'page.dataQuality' },
        { path: '/ea-health-score',       labelKey: 'nav.eaHealthScore',      icon: icons.healthScore, pageKey: 'page.eaHealthScore' },
        { path: '/tco-calculator',        labelKey: 'nav.tcoCalculator',      icon: icons.budget,      pageKey: 'page.tcoCalculator' },
      ]
    },
    {
      id: 'compliance',
      labelKey: 'nav.compliance',
      icon: icons.compliance,
      items: [
        { path: '/compliance-dashboard', labelKey: 'nav.complianceDashboard', icon: icons.compliance, pageKey: 'page.complianceDashboard' },
        { path: '/compliance-audit', labelKey: 'nav.complianceAudit', icon: icons.compliance, pageKey: 'page.complianceAudit' },
      ]
    },
    {
      id: 'admin',
      labelKey: 'nav.admin',
      icon: icons.settings,
      items: [
        { path: '/admin/users', labelKey: 'nav.adminUsers', icon: icons.settings, pageKey: 'page.adminUsers' },
        { path: '/admin/audit-log', labelKey: 'nav.adminAuditLog', icon: icons.conformity, pageKey: 'page.adminAuditLog' },
      ]
    },
    {
      id: 'innovation',
      labelKey: 'nav.innovation',
      icon: icons.ai,
      items: [
        { path: '/ai-usecases', labelKey: 'nav.aiUsecases', icon: icons.ai, pageKey: 'page.aiUsecases' },
      ]
    },
  ]
}

// ────────────────────────────────────────────
// Breadcrumb builder
// ────────────────────────────────────────────
function buildBreadcrumb (path, t) {
  const crumbs = [{ label: t('breadcrumb.home'), path: '/' }]
  if (path === '/') return crumbs

  const groups = buildNavGroups()
  let matched = false
  for (const g of groups) {
    for (const item of g.items) {
      if (path === item.path || path.startsWith(item.path + '/')) {
        crumbs.push({ label: t(g.labelKey), path: null })
        crumbs.push({ label: t(item.labelKey), path: item.path })
        matched = true
        break
      }
    }
    if (matched) break
  }

  if (path.match(/^\/domains\/\d+$/)) crumbs.push({ label: t('page.domainDetail'), path: null })
  else if (path.match(/^\/apps\/APP-\d+$/)) crumbs.push({ label: t('page.appDetail'), path: null })
  else if (path.match(/^\/projects\/[A-Za-z]+-\d+$/)) crumbs.push({ label: t('page.projectDetail'), path: null })
  else if (path.match(/^\/vendors\/VND-\d+$/)) crumbs.push({ label: t('page.vendorDetail'), path: null })
  else if (path.match(/^\/entities\/ENT-\d+$/)) crumbs.push({ label: t('page.entityDetail'), path: null })
  else if (path.match(/^\/demands\/DEM-\d+$/)) crumbs.push({ label: t('page.demandDetail'), path: null })
  else if (path.match(/^\/processes\/[A-Za-z0-9_-]+$/) && path !== '/processes') crumbs.push({ label: t('page.processDetail'), path: null })

  if (!matched) {
    if (path === '/search') crumbs.push({ label: t('page.globalSearch'), path: null })
    else if (path === '/settings') crumbs.push({ label: t('page.settings'), path: null })
  }

  return crumbs
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────
const FAVORITES_KEY = 'ea-nav-favorites'
const EXPANDED_KEY = 'ea-nav-expanded'
const SIDEBAR_COLLAPSED_KEY = 'ea-sidebar-collapsed'

export default {
  name: 'AppLayout',
  template: `
    <div class="flex h-screen overflow-hidden">
      <!-- Mobile Backdrop -->
      <div v-if="store.sidebarOpen && isMobile" class="fixed inset-0 bg-black/40 z-30 lg:hidden" @click="store.sidebarOpen = false" aria-hidden="true"></div>

      <!-- Sidebar -->
      <aside
        class="sidebar no-print bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 flex flex-col transition-all duration-300 fixed inset-y-0 left-0 z-40 lg:static lg:z-auto"
        :class="[
          store.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed && !isMobile ? 'lg:w-16' : 'w-64',
          !store.sidebarOpen && !sidebarCollapsed ? 'lg:w-0 lg:overflow-hidden' : ''
        ]"
        role="navigation" :aria-label="t('ui.openMenu')">

        <!-- Logo / Brand -->
        <div class="h-16 flex items-center px-3 border-b border-surface-200 dark:border-surface-700 shrink-0 gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0" aria-hidden="true">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <template v-if="!sidebarCollapsed || isMobile">
            <div class="min-w-0 flex-1">
              <div class="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight truncate">{{ t('app.title') }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ store.data.meta.company || t('app.subtitle') }}</div>
            </div>
            <button @click="toggleSidebarCollapse"
                    class="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 hidden lg:block"
                    :title="t('ui.collapse')">
              <span class="w-4 h-4 block" v-html="icons.panelLeft"></span>
            </button>
          </template>
        </div>

        <!-- Search bar (expanded mode) -->
        <div v-if="!sidebarCollapsed || isMobile" class="px-3 py-2 border-b border-surface-200 dark:border-surface-700">
          <button @click="openSearch"
                  class="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-surface-300 dark:hover:border-surface-600 text-sm transition-colors">
            <span class="w-4 h-4 shrink-0" v-html="icons.search"></span>
            <span class="flex-1 text-left truncate">{{ t('search.placeholder') }}</span>
            <kbd class="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[10px] font-mono text-gray-400 border border-surface-200 dark:border-surface-700">{{ t('search.shortcut') }}</kbd>
          </button>
        </div>
        <!-- Search icon (collapsed mode) -->
        <div v-else class="px-2 py-2 border-b border-surface-200 dark:border-surface-700 flex justify-center">
          <button @click="openSearch"
                  class="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 group relative"
                  :title="t('search.title')">
            <span class="w-5 h-5 block" v-html="icons.search"></span>
            <span class="absolute left-full ml-2 px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">{{ t('search.title') }}</span>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-2" :class="sidebarCollapsed && !isMobile ? 'px-1' : 'px-2'" id="sidebar-nav" :aria-label="t('ui.openMenu')">

          <!-- Favorites section -->
          <template v-if="favorites.length > 0">
            <div v-if="!sidebarCollapsed || isMobile" class="text-[10px] font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400 px-3 pt-2 pb-1 flex items-center gap-1">
              <span class="w-3 h-3" v-html="icons.starFilled"></span>
              {{ t('nav.favorites') }}
            </div>
            <div v-else class="flex justify-center py-1 mb-1">
              <span class="w-4 h-4 text-amber-500" v-html="icons.starFilled"></span>
            </div>
            <template v-for="fav in favoriteItems" :key="'fav-' + fav.path">
              <a :href="linkTo(fav.path)" @click="closeMobile()"
                 class="nav-item flex items-center gap-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 group relative"
                 :class="[
                   isActive(fav.path) ? 'active' : '',
                   sidebarCollapsed && !isMobile ? 'justify-center px-2 py-2' : 'px-3 py-1.5'
                 ]"
                 :title="sidebarCollapsed && !isMobile ? t(fav.labelKey) : undefined"
                 :aria-current="isActive(fav.path) ? 'page' : undefined">
                <span v-html="fav.icon" class="w-5 h-5 shrink-0" aria-hidden="true"></span>
                <span v-if="!sidebarCollapsed || isMobile" class="truncate">{{ t(fav.labelKey) }}</span>
                <span v-if="sidebarCollapsed && !isMobile"
                      class="absolute left-full ml-2 px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                  {{ t(fav.labelKey) }}
                </span>
              </a>
            </template>
            <div class="border-b border-surface-200 dark:border-surface-700 my-2" :class="sidebarCollapsed && !isMobile ? 'mx-1' : 'mx-3'"></div>
          </template>

          <!-- Nav Groups -->
          <template v-for="group in navGroups" :key="group.id">
            <button
              @click="toggleGroup(group.id)"
              :data-group="group.id"
              class="w-full flex items-center rounded-lg transition-colors group relative"
              :class="[
                isGroupActive(group) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400',
                'hover:bg-surface-100 dark:hover:bg-surface-800',
                sidebarCollapsed && !isMobile ? 'justify-center px-2 py-2' : 'gap-3 px-3 py-2'
              ]">
              <span v-html="group.icon" class="w-5 h-5 shrink-0" aria-hidden="true"></span>
              <template v-if="!sidebarCollapsed || isMobile">
                <span class="flex-1 text-left text-[11px] font-semibold uppercase tracking-wider">{{ t(group.labelKey) }}</span>
                <span v-if="groupBadge(group) > 0" class="px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px] font-medium">
                  {{ groupBadge(group) }}
                </span>
                <span class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200"
                      :class="isGroupExpanded(group.id) ? '' : '-rotate-90'"
                      v-html="icons.chevronDown"></span>
              </template>
              <span v-if="sidebarCollapsed && !isMobile"
                    class="absolute left-full ml-2 px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                {{ t(group.labelKey) }}
              </span>
            </button>

            <!-- Group Items (expanded sidebar) -->
            <div v-if="isGroupExpanded(group.id) && (!sidebarCollapsed || isMobile)"
                 class="ml-3 pl-3 border-l border-surface-200 dark:border-surface-700 space-y-0.5 mb-2">
              <a v-for="item in group.items" :key="item.path"
                 :href="linkTo(item.path)" @click="closeMobile()"
                 class="nav-item flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 group/item"
                 :class="{ active: isActive(item.path) }"
                 :aria-current="isActive(item.path) ? 'page' : undefined">
                <span v-html="item.icon" class="w-4 h-4 shrink-0 opacity-60" aria-hidden="true"></span>
                <span class="flex-1 truncate">{{ t(item.labelKey) }}</span>
                <span v-if="item.badgeKey && getBadge(item.badgeKey) > 0"
                      class="px-1.5 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-gray-500 dark:text-gray-400 text-[10px] font-medium">
                  {{ getBadge(item.badgeKey) }}
                </span>
                <button @click.prevent.stop="toggleFavorite(item.path)"
                        class="opacity-0 group-hover/item:opacity-100 p-0.5 rounded hover:bg-surface-200 dark:hover:bg-surface-700 transition-opacity shrink-0"
                        :title="isFavorite(item.path) ? t('ui.unpin') : t('ui.pin')">
                  <span class="w-3.5 h-3.5 block"
                        :class="isFavorite(item.path) ? 'text-amber-500' : 'text-gray-400'"
                        v-html="isFavorite(item.path) ? icons.starFilled : icons.star"></span>
                </button>
              </a>
            </div>

            <!-- Flyout for collapsed mode -->
            <div v-if="sidebarCollapsed && !isMobile && flyoutGroup === group.id"
                 class="fixed bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-xl py-1 z-50 min-w-[220px]"
                 :style="flyoutStyle"
                 @mouseleave="flyoutGroup = null">
              <div class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-4 pt-2 pb-1">{{ t(group.labelKey) }}</div>
              <a v-for="item in group.items" :key="item.path"
                 :href="linkTo(item.path)" @click="closeMobile(); flyoutGroup = null"
                 class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                 :class="isActive(item.path) ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : ''">
                <span v-html="item.icon" class="w-4 h-4 shrink-0" aria-hidden="true"></span>
                <span class="flex-1">{{ t(item.labelKey) }}</span>
                <span v-if="item.badgeKey && getBadge(item.badgeKey) > 0"
                      class="px-1.5 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-gray-500 text-[10px] font-medium">
                  {{ getBadge(item.badgeKey) }}
                </span>
              </a>
            </div>
          </template>
        </nav>

        <!-- Sidebar Footer -->
        <div class="border-t border-surface-200 dark:border-surface-700 shrink-0">
          <!-- Settings -->
          <a :href="linkTo('/settings')" @click="closeMobile()"
             class="nav-item flex items-center gap-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 group relative"
             :class="[
               isActive('/settings') ? 'active' : '',
               sidebarCollapsed && !isMobile ? 'justify-center px-2 py-2 mx-1 my-1' : 'px-3 py-2 mx-2 my-1'
             ]"
             :title="sidebarCollapsed && !isMobile ? t('nav.settings') : undefined"
             :aria-current="isActive('/settings') ? 'page' : undefined">
            <span v-html="icons.settings" class="w-5 h-5 shrink-0" aria-hidden="true"></span>
            <span v-if="!sidebarCollapsed || isMobile">{{ t('nav.settings') }}</span>
            <span v-if="sidebarCollapsed && !isMobile"
                  class="absolute left-full ml-2 px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
              {{ t('nav.settings') }}
            </span>
          </a>

          <!-- Language switcher + version + collapse toggle -->
          <div class="flex items-center border-t border-surface-200 dark:border-surface-700"
               :class="sidebarCollapsed && !isMobile ? 'flex-col gap-1 px-1 py-2' : 'px-3 py-2 gap-2'">
            <div class="flex rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 text-[11px]">
              <button @click="setLocale('de')"
                      class="px-2 py-1 transition-colors font-medium"
                      :class="i18n.locale === 'de' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-surface-100 dark:hover:bg-surface-800'">
                DE
              </button>
              <button @click="setLocale('en')"
                      class="px-2 py-1 transition-colors font-medium"
                      :class="i18n.locale === 'en' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-surface-100 dark:hover:bg-surface-800'">
                EN
              </button>
            </div>
            <div v-if="!sidebarCollapsed || isMobile" class="flex-1 text-[10px] text-gray-400 truncate">
              v{{ store.data.meta.version }} · {{ t('app.lastSaved') }} {{ lastSaved }}
            </div>
            <button v-if="sidebarCollapsed && !isMobile"
                    @click="toggleSidebarCollapse"
                    class="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    :title="t('ui.expand')">
              <span class="w-4 h-4 block" v-html="icons.panelLeft"></span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main content area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="h-14 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 flex items-center px-4 gap-3 shrink-0 no-print" role="banner">
          <button @click="store.sidebarOpen = !store.sidebarOpen"
                  class="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-gray-500 dark:text-gray-400 lg:hidden"
                  :aria-label="store.sidebarOpen ? t('ui.closeMenu') : t('ui.openMenu')"
                  aria-controls="sidebar-nav">
            <span class="w-5 h-5 block" v-html="icons.menu"></span>
          </button>

          <!-- Breadcrumbs -->
          <nav class="flex items-center gap-1 text-sm min-w-0 overflow-hidden" aria-label="Breadcrumb">
            <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
              <span v-if="idx > 0" class="text-gray-300 dark:text-gray-600 shrink-0">/</span>
              <a v-if="crumb.path && idx < breadcrumbs.length - 1"
                 :href="linkTo(crumb.path)"
                 class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 transition-colors">
                <span v-if="idx === 0" class="w-4 h-4 inline-block align-text-bottom" v-html="icons.home"></span>
                <span v-else>{{ crumb.label }}</span>
              </a>
              <span v-else class="truncate shrink"
                    :class="idx === breadcrumbs.length - 1 ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'">
                {{ crumb.label }}
              </span>
            </template>
          </nav>

          <div class="flex-1"></div>

          <button @click="openSearch"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-surface-300 dark:hover:border-surface-600 transition-colors"
                  :title="t('search.title')">
            <span class="w-4 h-4" v-html="icons.search"></span>
            <span class="text-xs hidden sm:inline">{{ t('search.placeholder') }}</span>
            <kbd class="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[10px] font-mono text-gray-400 border border-surface-200 dark:border-surface-700">{{ t('search.shortcut') }}</kbd>
          </button>

          <span class="text-xs text-gray-400 hidden lg:block">{{ store.data.meta.company }}</span>
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-surface-50 dark:bg-surface-950" role="main" aria-label="Page content">
          <div v-if="!store.loaded" class="flex items-center justify-center h-full" role="status" :aria-label="t('app.loading')">
            <div class="text-center">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4" aria-hidden="true"></div>
              <p class="text-gray-500">{{ t('app.loading') }}</p>
            </div>
          </div>
          <component v-else :is="currentComponent" :key="router.path"></component>
        </main>
      </div>

      <!-- Cmd+K Search Overlay -->
      <teleport to="body">
        <div v-if="searchOverlayOpen" class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" @click.self="closeSearchOverlay">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="closeSearchOverlay"></div>
          <div class="relative bg-white dark:bg-surface-900 rounded-xl shadow-2xl border border-surface-200 dark:border-surface-700 w-full max-w-xl mx-4 overflow-hidden z-10">
            <div class="flex items-center gap-3 px-4 py-3 border-b border-surface-200 dark:border-surface-700">
              <span class="w-5 h-5 text-gray-400 shrink-0" v-html="icons.search"></span>
              <input ref="overlaySearchInput" v-model="overlayQuery" type="text"
                     :placeholder="t('search.fullPlaceholder')"
                     class="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                     @keydown.escape="closeSearchOverlay"
                     @keydown.enter="goToSearchPage" />
              <kbd class="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-[10px] font-mono text-gray-400 border border-surface-200 dark:border-surface-700">ESC</kbd>
            </div>
            <div class="max-h-80 overflow-y-auto py-2">
              <template v-if="quickNavResults.length > 0">
                <a v-for="(item, idx) in quickNavResults" :key="item.path"
                   :href="linkTo(item.path)"
                   @click="closeSearchOverlay"
                   class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                   :class="idx === selectedQuickNav ? 'bg-surface-100 dark:bg-surface-800' : 'text-gray-700 dark:text-gray-300'">
                  <span v-html="item.icon" class="w-4 h-4 shrink-0 text-gray-400" aria-hidden="true"></span>
                  <span class="flex-1">{{ item.label }}</span>
                  <span class="text-[10px] text-gray-400 uppercase">{{ item.group }}</span>
                </a>
              </template>
              <div v-else-if="overlayQuery" class="px-4 py-6 text-center text-sm text-gray-400">
                {{ t('search.noResults') }} &mdash; <a :href="linkTo('/search')" @click="closeSearchOverlay" class="text-primary-600 hover:underline">{{ t('search.title') }}</a>
              </div>
              <div v-else class="px-4 py-4 text-center text-xs text-gray-400">
                {{ t('search.fullPlaceholder') }}
              </div>
            </div>
          </div>
        </div>
      </teleport>
      <toast-container></toast-container>
    </div>
  `,
  setup () {
    const { ref, computed, watch: vWatch, onMounted, onUnmounted, nextTick } = Vue

    const t = (key) => i18n.t(key)
    const setLocale = (lang) => i18n.setLocale(lang)

    // ── Navigation groups (reactive to i18n changes) ──
    const navGroups = computed(() => {
      const groups = buildNavGroups()
      return groups.filter(g => {
        if (g.id === 'analysis' && !store.featureToggles.analysisEnabled) return false
        if (g.id === 'governance' && !store.featureToggles.governanceEnabled) return false
        if (g.id === 'compliance' && !store.featureToggles.complianceEnabled) return false
        if (g.id === 'admin') {
          // Only show admin nav when running in server mode and user is admin
          if (typeof auth === 'undefined' || !auth.isLoggedIn || !auth.isAdmin) return false
        }
        return true
      })
    })

    // ── Component / page title mapping ──
    const componentToPageKey = {
      'dashboard-view': 'page.dashboard',
      'domain-list': 'page.domains',
      'domain-detail': 'page.domainDetail',
      'app-list': 'page.applications',
      'app-detail': 'page.appDetail',
      'cap-app-matrix': 'page.capabilityMatrix',
      'time-quadrant': 'page.timeQuadrant',
      'integration-map': 'page.integrationMap',
      'project-list': 'page.projectPortfolio',
      'project-detail': 'page.projectDetail',
      'project-heatmap': 'page.projectHeatmap',
      'dependency-graph': 'page.dependencies',
      'process-list': 'page.processes',
      'process-detail': 'page.processDetail',
      'vendor-list': 'page.vendors',
      'vendor-detail': 'page.vendorDetail',
      'vendor-scorecard': 'page.vendorScorecard',
      'entity-list': 'page.entities',
      'entity-detail': 'page.entityDetail',
      'data-object-list': 'page.dataObjects',
      'data-object-detail': 'page.dataObjectDetail',
      'demand-list': 'page.demands',
      'demand-detail': 'page.demandDetail',
      'demand-pipeline': 'page.demandPipeline',
      'ai-usecases-list': 'page.aiUsecases',
      'budget-dashboard': 'page.budgetDashboard',
      'risk-heatmap': 'page.riskHeatmap',
      'data-quality': 'page.dataQuality',
      'resource-overlap': 'page.resourceOverlap',
      'scenario-planner': 'page.scenarioPlanner',
      'maturity-gap': 'page.maturityGap',
      'roadmap-view': 'page.roadmap',
      'executive-summary': 'page.executiveSummary',
      'settings-view': 'page.settings',
      'global-search': 'page.globalSearch',
      'capability-investment': 'page.capabilityInvestment',
      'conformity-scorecard': 'page.conformityScorecard',
      'compliance-dashboard': 'page.complianceDashboard',
      'login-view': 'page.login',
      'admin-users': 'page.adminUsers',
      'admin-audit-log': 'page.adminAuditLog',
    }

    const currentComponent = computed(() => router.component || 'dashboard-view')
    const pageTitle = computed(() => {
      const key = componentToPageKey[currentComponent.value]
      return key ? t(key) : t('app.title')
    })

    // ── Breadcrumbs ──
    const breadcrumbs = computed(() => buildBreadcrumb(router.path, t))

    // ── Last saved ──
    const lastSaved = computed(() => {
      const d = store.data.meta.lastUpdated
      if (!d) return '—'
      try {
        const locale = i18n.locale === 'de' ? 'de-AT' : 'en-US'
        return new Date(d).toLocaleDateString(locale)
      } catch { return d }
    })

    // ── Sidebar state ──
    const sidebarCollapsed = ref(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true')
    const isMobile = ref(window.innerWidth < 1024)

    function toggleSidebarCollapse () {
      sidebarCollapsed.value = !sidebarCollapsed.value
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed.value)
    }

    function handleResize () { isMobile.value = window.innerWidth < 1024 }

    // ── Group expand/collapse ──
    const expandedGroups = ref(JSON.parse(localStorage.getItem(EXPANDED_KEY) || '["overview"]'))

    function toggleGroup (groupId) {
      if (sidebarCollapsed.value && !isMobile.value) {
        flyoutGroup.value = flyoutGroup.value === groupId ? null : groupId
        updateFlyoutStyle(groupId)
        return
      }
      const idx = expandedGroups.value.indexOf(groupId)
      if (idx !== -1) expandedGroups.value.splice(idx, 1)
      else expandedGroups.value.push(groupId)
      localStorage.setItem(EXPANDED_KEY, JSON.stringify(expandedGroups.value))
    }

    function isGroupExpanded (groupId) { return expandedGroups.value.includes(groupId) }

    function isGroupActive (group) {
      return group.items.some(item => {
        if (item.path === '/') return router.path === '/'
        return router.path === item.path || router.path.startsWith(item.path + '/')
      })
    }

    // ── Flyout (collapsed mode) ──
    const flyoutGroup = ref(null)
    const flyoutStyle = ref({})

    function updateFlyoutStyle (groupId) {
      nextTick(() => {
        const el = document.querySelector('[data-group="' + groupId + '"]')
        if (el) {
          const rect = el.getBoundingClientRect()
          flyoutStyle.value = { top: rect.top + 'px', left: '64px' }
        }
      })
    }

    // ── Group badge ──
    function groupBadge (group) {
      let total = 0
      for (const item of group.items) { if (item.badgeKey) total += getBadge(item.badgeKey) }
      return total
    }

    // ── Badge counts ──
    function getBadge (key) {
      switch (key) {
        case 'totalApps': return store.data.applications.length
        case 'totalProjects': return store.data.projects.length
        case 'totalVendors': return (store.data.vendors || []).length
        case 'totalEntities': return (store.data.legalEntities || []).length
        case 'openDemands': {
          const demands = store.data.demands || []
          return demands.filter(d => d.status && !['Done', 'Rejected', 'done', 'rejected', 'Closed', 'closed'].includes(d.status)).length
        }
        default: return 0
      }
    }

    // ── Favorites ──
    const favorites = ref(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'))

    function toggleFavorite (path) {
      const idx = favorites.value.indexOf(path)
      if (idx !== -1) favorites.value.splice(idx, 1)
      else favorites.value.push(path)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
    }

    function isFavorite (path) { return favorites.value.includes(path) }

    const favoriteItems = computed(() => {
      const items = []
      for (const g of navGroups.value) {
        for (const item of g.items) {
          if (favorites.value.includes(item.path)) items.push(item)
        }
      }
      return items
    })

    // ── Active state ──
    function isActive (path) {
      if (path === '/') return router.path === '/'
      return router.path === path || router.path.startsWith(path + '/')
    }

    function closeMobile () { if (window.innerWidth < 1024) store.sidebarOpen = false }

    // ── Auto-expand active group on navigation ──
    vWatch(() => router.path, (newPath) => {
      for (const group of navGroups.value) {
        if (group.items.some(item => {
          if (item.path === '/') return newPath === '/'
          return newPath === item.path || newPath.startsWith(item.path + '/')
        })) {
          if (!expandedGroups.value.includes(group.id)) {
            expandedGroups.value.push(group.id)
            localStorage.setItem(EXPANDED_KEY, JSON.stringify(expandedGroups.value))
          }
          break
        }
      }
    })

    // ── Search overlay (Cmd+K) ──
    const searchOverlayOpen = ref(false)
    const overlayQuery = ref('')
    const selectedQuickNav = ref(0)
    const overlaySearchInput = ref(null)

    function openSearch () {
      searchOverlayOpen.value = true
      overlayQuery.value = ''
      selectedQuickNav.value = 0
      nextTick(() => { if (overlaySearchInput.value) overlaySearchInput.value.focus() })
    }

    function closeSearchOverlay () {
      searchOverlayOpen.value = false
      overlayQuery.value = ''
    }

    function goToSearchPage () {
      if (quickNavResults.value.length > 0) {
        navigateTo(quickNavResults.value[selectedQuickNav.value].path)
      } else if (overlayQuery.value) {
        navigateTo('/search')
      }
      closeSearchOverlay()
    }

    const quickNavResults = computed(() => {
      if (!overlayQuery.value || overlayQuery.value.length < 1) return []
      const q = overlayQuery.value.toLowerCase()
      const results = []
      for (const group of navGroups.value) {
        for (const item of group.items) {
          const label = t(item.labelKey).toLowerCase()
          if (label.includes(q)) {
            results.push({ path: item.path, label: t(item.labelKey), icon: item.icon, group: t(group.labelKey) })
          }
        }
      }
      if (t('nav.settings').toLowerCase().includes(q)) {
        results.push({ path: '/settings', label: t('nav.settings'), icon: icons.settings, group: t('nav.system') })
      }
      return results.slice(0, 8)
    })

    // ── Keyboard shortcuts ──
    function handleKeydown (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchOverlayOpen.value ? closeSearchOverlay() : openSearch()
      }
      if (searchOverlayOpen.value) {
        if (e.key === 'ArrowDown') { e.preventDefault(); selectedQuickNav.value = Math.min(selectedQuickNav.value + 1, quickNavResults.value.length - 1) }
        else if (e.key === 'ArrowUp') { e.preventDefault(); selectedQuickNav.value = Math.max(selectedQuickNav.value - 1, 0) }
      }
    }

    function handleClickOutside (e) {
      if (sidebarCollapsed.value && !isMobile.value && flyoutGroup.value) {
        const sidebar = document.querySelector('aside')
        if (sidebar && !sidebar.contains(e.target)) flyoutGroup.value = null
      }
    }

    // ── Lifecycle ──
    onMounted(() => {
      window.addEventListener('keydown', handleKeydown)
      window.addEventListener('resize', handleResize)
      window.addEventListener('click', handleClickOutside)
      if (window.innerWidth < 1024) store.sidebarOpen = false
      document.documentElement.classList.toggle('dark', store.darkMode)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('click', handleClickOutside)
    })

    return {
      store, router, linkTo, navigateTo, i18n, icons,
      t, setLocale,
      navGroups,
      currentComponent, pageTitle, breadcrumbs, lastSaved,
      sidebarCollapsed, isMobile, toggleSidebarCollapse,
      expandedGroups, toggleGroup, isGroupExpanded, isGroupActive,
      flyoutGroup, flyoutStyle,
      getBadge, groupBadge,
      favorites, toggleFavorite, isFavorite, favoriteItems,
      isActive, closeMobile,
      searchOverlayOpen, overlayQuery, overlaySearchInput, selectedQuickNav,
      openSearch, closeSearchOverlay, goToSearchPage, quickNavResults,
    }
  }
}
