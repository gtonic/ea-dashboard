// budget-dashboard.js — Budget & Kosten-Dashboard (Feature #3)
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'BudgetDashboard',
  template: `
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div v-for="kpi in kpis" :key="kpi.label"
             class="bg-white rounded-xl border border-surface-200 p-4 hover:shadow-md transition-shadow">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ kpi.label }}</div>
          <div class="mt-1 text-2xl font-bold" :style="{ color: kpi.color || '#1e293b' }">{{ kpi.value }}</div>
          <div v-if="kpi.sub" class="text-xs text-gray-400 mt-0.5">{{ kpi.sub }}</div>
        </div>
      </div>

      <!-- Run vs Change + Costs by Domain -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Run vs. Change Budget</h3>
          <div class="h-64 flex items-center justify-center">
            <canvas ref="runChangeCanvas"></canvas>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Kosten nach Domäne</h3>
          <div class="h-64">
            <canvas ref="domainCostCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Costs by Vendor + Costs by App Type -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Kosten nach Anbieter</h3>
          <div class="h-64">
            <canvas ref="vendorCostCanvas"></canvas>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Kosten nach Anwendungstyp</h3>
          <div class="h-64 flex items-center justify-center">
            <canvas ref="appTypeCostCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed, onMounted, nextTick } = Vue

    const runChangeCanvas = ref(null)
    const domainCostCanvas = ref(null)
    const vendorCostCanvas = ref(null)
    const appTypeCostCanvas = ref(null)

    // ── Computed data ──

    const runBudget = computed(() =>
      store.data.projects
        .filter(p => p.category === 'Run / Pflicht')
        .reduce((s, p) => s + (p.budget || 0), 0)
    )

    const changeBudget = computed(() =>
      store.data.projects
        .filter(p => p.category !== 'Run / Pflicht')
        .reduce((s, p) => s + (p.budget || 0), 0)
    )

    const totalBudget = computed(() => store.totalBudget)

    const projectCount = computed(() => store.data.projects.length)

    const avgBudget = computed(() =>
      projectCount.value ? Math.round(totalBudget.value / projectCount.value) : 0
    )

    const runRatio = computed(() =>
      totalBudget.value ? Math.round((runBudget.value / totalBudget.value) * 100) : 0
    )

    function fmtEuro (v) {
      if (v >= 1_000_000) return '€' + (v / 1_000_000).toFixed(1) + 'M'
      if (v >= 1_000) return '€' + (v / 1_000).toFixed(0) + 'k'
      return '€' + v
    }

    const kpis = computed(() => [
      { label: 'Gesamtbudget', value: fmtEuro(totalBudget.value), color: '#6366f1' },
      { label: 'Run Budget', value: fmtEuro(runBudget.value), color: '#64748b' },
      { label: 'Change Budget', value: fmtEuro(changeBudget.value), color: '#3b82f6' },
      { label: 'Run / Change', value: runRatio.value + '%', sub: 'Run-Anteil', color: runRatio.value > 70 ? '#ef4444' : '#10b981' },
      { label: 'Projekte', value: projectCount.value },
      { label: 'Ø Budget', value: fmtEuro(avgBudget.value), sub: 'pro Projekt' }
    ])

    // ── Chart rendering ──

    function renderCharts () {
      renderRunChangeChart()
      renderDomainCostChart()
      renderVendorCostChart()
      renderAppTypeCostChart()
    }

    function renderRunChangeChart () {
      if (!runChangeCanvas.value) return
      new Chart(runChangeCanvas.value, {
        type: 'doughnut',
        data: {
          labels: ['Run / Pflicht', 'Change / Grow'],
          datasets: [{
            data: [runBudget.value / 1000, changeBudget.value / 1000],
            backgroundColor: ['#64748b', '#3b82f6']
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: window.innerWidth < 640 ? 'bottom' : 'right', labels: { usePointStyle: true, padding: 16 } },
            tooltip: { callbacks: { label: ctx => ctx.label + ': ' + fmtEuro(ctx.raw * 1000) } }
          }
        }
      })
    }

    function renderDomainCostChart () {
      if (!domainCostCanvas.value) return
      const domainBudgets = {}
      store.data.projects.forEach(p => {
        if (p.primaryDomain) {
          const key = p.primaryDomain
          domainBudgets[key] = (domainBudgets[key] || 0) + (p.budget || 0)
        }
      })
      const entries = Object.entries(domainBudgets)
        .map(([id, budget]) => {
          const d = store.domainById(id)
          return { name: d ? d.name : 'Unbekannt', color: d ? d.color : '#94a3b8', budget }
        })
        .sort((a, b) => b.budget - a.budget)

      new Chart(domainCostCanvas.value, {
        type: 'bar',
        data: {
          labels: entries.map(e => e.name.length > 20 ? e.name.slice(0, 20) + '…' : e.name),
          datasets: [{
            data: entries.map(e => e.budget / 1000),
            backgroundColor: entries.map(e => e.color + 'CC'),
            borderColor: entries.map(e => e.color),
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y',
          scales: { x: { beginAtZero: true, ticks: { callback: v => '€' + v + 'k' } } },
          plugins: { legend: { display: false } }
        }
      })
    }

    function renderVendorCostChart () {
      if (!vendorCostCanvas.value) return
      const vendorBudgets = {}
      store.data.projects.forEach(p => {
        const apps = p.affectedApps || []
        apps.forEach(ref => {
          const app = store.appById(ref.appId)
          if (!app) return
          const vendor = store.vendorForApp(app.id)
          const vendorName = vendor ? vendor.name : (app.vendor || 'Unbekannt')
          const share = apps.length ? (p.budget || 0) / apps.length : 0
          vendorBudgets[vendorName] = (vendorBudgets[vendorName] || 0) + share
        })
      })
      const entries = Object.entries(vendorBudgets)
        .map(([name, budget]) => ({ name, budget: Math.round(budget) }))
        .sort((a, b) => b.budget - a.budget)
        .slice(0, 10)

      const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b']
      new Chart(vendorCostCanvas.value, {
        type: 'bar',
        data: {
          labels: entries.map(e => e.name.length > 18 ? e.name.slice(0, 18) + '…' : e.name),
          datasets: [{
            data: entries.map(e => e.budget / 1000),
            backgroundColor: entries.map((_, i) => colors[i % colors.length] + 'CC'),
            borderColor: entries.map((_, i) => colors[i % colors.length]),
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y',
          scales: { x: { beginAtZero: true, ticks: { callback: v => '€' + v + 'k' } } },
          plugins: { legend: { display: false } }
        }
      })
    }

    function renderAppTypeCostChart () {
      if (!appTypeCostCanvas.value) return
      const typeBudgets = {}
      store.data.projects.forEach(p => {
        const apps = p.affectedApps || []
        apps.forEach(ref => {
          const app = store.appById(ref.appId)
          if (!app) return
          const appType = app.appType || 'Unbekannt'
          const share = apps.length ? (p.budget || 0) / apps.length : 0
          typeBudgets[appType] = (typeBudgets[appType] || 0) + share
        })
      })
      const typeColors = { 'SaaS': '#3b82f6', 'On-Prem': '#64748b', 'Custom': '#8b5cf6', 'PaaS': '#10b981', 'Unbekannt': '#d1d5db' }
      const entries = Object.entries(typeBudgets).sort((a, b) => b[1] - a[1])

      new Chart(appTypeCostCanvas.value, {
        type: 'doughnut',
        data: {
          labels: entries.map(([t]) => t),
          datasets: [{
            data: entries.map(([, v]) => Math.round(v / 1000)),
            backgroundColor: entries.map(([t]) => typeColors[t] || '#94a3b8')
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: window.innerWidth < 640 ? 'bottom' : 'right', labels: { usePointStyle: true, padding: 16 } },
            tooltip: { callbacks: { label: ctx => ctx.label + ': ' + fmtEuro(ctx.raw * 1000) } }
          }
        }
      })
    }

    onMounted(() => { nextTick(renderCharts) })

    return {
      store, linkTo, kpis,
      runChangeCanvas, domainCostCanvas, vendorCostCanvas, appTypeCostCanvas
    }
  }
}
