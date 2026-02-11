// app.js — Main entry point: registers all components, creates Vue app
import { createApp } from 'vue'
import { store, loadData, startWatching } from './store.js'
import { router, initRouter } from './router.js'

// Components
import Layout from './components/layout.js'
import Dashboard from './components/dashboard.js'
import Settings from './components/settings.js'
import DomainList from './components/domain-list.js'
import DomainDetail from './components/domain-detail.js'
import AppList from './components/app-list.js'
import AppForm from './components/app-form.js'
import AppDetail from './components/app-detail.js'
import CapAppMatrix from './components/cap-app-matrix.js'
import TimeQuadrant from './components/time-quadrant.js'
import ProjectList from './components/project-list.js'
import ProjectForm from './components/project-form.js'
import ProjectDetail from './components/project-detail.js'
import ProjectHeatmap from './components/project-heatmap.js'
import DependencyGraph from './components/dependency-graph.js'
import DomainForm from './components/domain-form.js'
import CapabilityForm from './components/capability-form.js'
import ProcessList from './components/process-list.js'
import ProcessDetail from './components/process-detail.js'
import ProcessForm from './components/process-form.js'
import MaturityGap from './components/maturity-gap.js'
import VendorList from './components/vendor-list.js'
import VendorDetail from './components/vendor-detail.js'
import VendorForm from './components/vendor-form.js'
import VendorScorecard from './components/vendor-scorecard.js'
import EntityList from './components/entity-list.js'
import EntityDetail from './components/entity-detail.js'
import DemandList from './components/demand-list.js'
import DemandDetail from './components/demand-detail.js'
import DemandForm from './components/demand-form.js'
import DemandPipeline from './components/demand-pipeline.js'
import AIUsecasesList from './components/ai-usecases-list.js'
import BudgetDashboard from './components/budget-dashboard.js'
import RoadmapView from './components/roadmap.js'
import ExecutiveSummary from './components/executive-summary.js'
import IntegrationMap from './components/integration-map.js'
import RiskHeatmap from './components/risk-heatmap.js'
import DataQuality from './components/data-quality.js'
import GlobalSearch from './components/global-search.js'
import ResourceOverlap from './components/resource-overlap.js'
import ScenarioPlanner from './components/scenario-planner.js'
import CapabilityInvestment from './components/capability-investment.js'
import ConformityScorecard from './components/conformity-scorecard.js'
import TechRadar from './components/tech-radar.js'
import EaHealthScore from './components/ea-health-score.js'

// Create app
const app = createApp(Layout)

// Register all components globally
app.component('app-layout', Layout)
app.component('dashboard-view', Dashboard)
app.component('settings-view', Settings)
app.component('domain-list', DomainList)
app.component('domain-detail', DomainDetail)
app.component('app-list', AppList)
app.component('app-form', AppForm)
app.component('app-detail', AppDetail)
app.component('cap-app-matrix', CapAppMatrix)
app.component('time-quadrant', TimeQuadrant)
app.component('project-list', ProjectList)
app.component('project-form', ProjectForm)
app.component('project-detail', ProjectDetail)
app.component('project-heatmap', ProjectHeatmap)
app.component('dependency-graph', DependencyGraph)
app.component('domain-form', DomainForm)
app.component('capability-form', CapabilityForm)
app.component('process-list', ProcessList)
app.component('process-detail', ProcessDetail)
app.component('process-form', ProcessForm)
app.component('maturity-gap', MaturityGap)
app.component('vendor-list', VendorList)
app.component('vendor-detail', VendorDetail)
app.component('vendor-form', VendorForm)
app.component('vendor-scorecard', VendorScorecard)
app.component('entity-list', EntityList)
app.component('entity-detail', EntityDetail)
app.component('demand-list', DemandList)
app.component('demand-detail', DemandDetail)
app.component('demand-form', DemandForm)
app.component('demand-pipeline', DemandPipeline)
app.component('ai-usecases-list', AIUsecasesList)
app.component('budget-dashboard', BudgetDashboard)
app.component('roadmap-view', RoadmapView)
app.component('executive-summary', ExecutiveSummary)
app.component('integration-map', IntegrationMap)
app.component('risk-heatmap', RiskHeatmap)
app.component('data-quality', DataQuality)
app.component('global-search', GlobalSearch)
app.component('resource-overlap', ResourceOverlap)
app.component('scenario-planner', ScenarioPlanner)
app.component('capability-investment', CapabilityInvestment)
app.component('conformity-scorecard', ConformityScorecard)
app.component('tech-radar', TechRadar)
app.component('ea-health-score', EaHealthScore)

// Make Vue available globally for components that use `const { ref, computed, ... } = Vue`
window.Vue = await import('vue')

// Initialize
initRouter()
await loadData()
startWatching()

app.mount('#app')

console.log('[EA Dashboard] App mounted ✓ — ' + store.data.meta.company)
