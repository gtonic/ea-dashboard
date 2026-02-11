// dashboard.js — KPI cards, charts, quick stats
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'DashboardView',
  template: `
    <div class="space-y-6">
      <!-- KPI Cards Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div v-for="kpi in kpis" :key="kpi.label"
             class="bg-white rounded-xl border border-surface-200 p-4 hover:shadow-md transition-shadow">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ kpi.label }}</div>
          <div class="mt-1 text-2xl font-bold" :style="{ color: kpi.color || '#1e293b' }">{{ kpi.value }}</div>
          <div v-if="kpi.sub" class="text-xs text-gray-400 mt-0.5">{{ kpi.sub }}</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Management KPIs -->
        <div v-if="mgmtKpis.length" class="bg-white rounded-xl border border-surface-200 p-5 lg:col-span-2">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Management KPIs</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div v-for="kpi in mgmtKpis" :key="kpi.id" class="border border-surface-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-gray-700 line-clamp-1">{{ kpi.name }}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full"
                      :class="mgmtTrendClass(kpi.trend)">{{ mgmtTrendIcon(kpi.trend) }}</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-bold" :style="{ color: mgmtKpiColor(kpi) }">{{ kpi.current }}</span>
                <span class="text-xs text-gray-400">/ {{ kpi.target }} {{ kpi.unit }}</span>
              </div>
              <div class="mt-2 w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full" :style="{ width: mgmtKpiPct(kpi) + '%', backgroundColor: mgmtKpiColor(kpi) }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- TIME Distribution Pie -->
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">TIME Distribution</h3>
          <div class="h-64 flex items-center justify-center">
            <canvas ref="timeChartCanvas"></canvas>
          </div>
        </div>

        <!-- Maturity by Domain Bar -->
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Avg Maturity by Domain</h3>
          <div class="h-64">
            <canvas ref="maturityChartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Second Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Project Status -->
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Project Status Overview</h3>
          <div class="h-48">
            <canvas ref="projectStatusCanvas"></canvas>
          </div>
        </div>

        <!-- Project Budget by Category -->
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Budget by Category</h3>
          <div class="h-48">
            <canvas ref="budgetChartCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Quick Lists -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Eliminate Apps -->
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></span>
            Applications to Eliminate
          </h3>
          <div v-if="eliminateApps.length === 0" class="text-sm text-gray-400 italic">None</div>
          <div v-for="app in eliminateApps" :key="app.id" class="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
            <a :href="linkTo('/apps/' + app.id)" class="text-sm text-primary-600 hover:underline">{{ app.name }}</a>
            <span class="text-xs text-gray-400">{{ app.category }}</span>
          </div>
        </div>

        <!-- Yellow/Red Projects -->
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500 mr-2"></span>
            Projects Needing Attention
          </h3>
          <div v-if="attentionProjects.length === 0" class="text-sm text-gray-400 italic">All green</div>
          <div v-for="p in attentionProjects" :key="p.id" class="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
            <a :href="linkTo('/projects/' + p.id)" class="text-sm text-primary-600 hover:underline">{{ p.name }}</a>
            <span class="text-xs px-2 py-0.5 rounded-full"
                  :class="p.status === 'red' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'">
              {{ p.statusText }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed, onMounted, nextTick } = Vue

    const timeChartCanvas = ref(null)
    const maturityChartCanvas = ref(null)
    const projectStatusCanvas = ref(null)
    const budgetChartCanvas = ref(null)

    const kpis = computed(() => [
      { label: 'Domains', value: store.data.domains.length, color: '#3b82f6' },
      { label: 'Capabilities', value: store.totalCapabilities, sub: store.totalSubCapabilities + ' L2' },
      { label: 'Applications', value: store.totalApps },
      { label: 'Vendors', value: store.totalVendors },
      { label: 'Projects', value: store.totalProjects },
      { label: 'Demands', value: store.totalDemands, color: '#8b5cf6' },
      { label: 'Avg Maturity', value: store.avgMaturity + '/5', color: store.avgMaturity >= 3 ? '#10b981' : '#f59e0b' },
      { label: 'Total Budget', value: '€' + (store.totalBudget / 1000).toFixed(0) + 'k', color: '#6366f1' }
    ])

    const eliminateApps = computed(() =>
      store.data.applications.filter(a => a.timeQuadrant === 'Eliminate')
    )

    const mgmtKpis = computed(() => store.data.managementKPIs || [])

    function mgmtTrendClass (t) {
      return { improving: 'bg-green-100 text-green-700', stable: 'bg-gray-100 text-gray-600', declining: 'bg-red-100 text-red-700' }[t] || 'bg-gray-100 text-gray-600'
    }
    function mgmtTrendIcon (t) { return { improving: '↑', stable: '→', declining: '↓' }[t] || '→' }
    function mgmtKpiPct (kpi) { const c = parseFloat(kpi.current) || 0; const t = parseFloat(kpi.target) || 1; return Math.min(100, (c / t) * 100) }
    function mgmtKpiColor (kpi) { const p = mgmtKpiPct(kpi); if (p >= 80) return '#10b981'; if (p >= 50) return '#f59e0b'; return '#ef4444' }

    const attentionProjects = computed(() =>
      store.data.projects.filter(p => p.status === 'yellow' || p.status === 'red')
    )

    function renderCharts () {
      // TIME Pie
      if (timeChartCanvas.value) {
        const dist = store.timeDistribution
        new Chart(timeChartCanvas.value, {
          type: 'doughnut',
          data: {
            labels: Object.keys(dist),
            datasets: [{
              data: Object.values(dist),
              backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444']
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: window.innerWidth < 640 ? 'bottom' : 'right', labels: { usePointStyle: true, padding: 16 } } }
          }
        })
      }

      // Maturity Bar
      if (maturityChartCanvas.value) {
        const domains = store.data.domains
        const labels = domains.map(d => d.name.length > 18 ? d.name.slice(0, 18) + '…' : d.name)
        const data = domains.map(d => {
          const caps = d.capabilities
          return caps.length ? +(caps.reduce((s, c) => s + c.maturity, 0) / caps.length).toFixed(1) : 0
        })
        new Chart(maturityChartCanvas.value, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              data,
              backgroundColor: domains.map(d => d.color + 'CC'),
              borderColor: domains.map(d => d.color),
              borderWidth: 1,
              borderRadius: 4
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false, indexAxis: 'y',
            scales: { x: { min: 0, max: 5, ticks: { stepSize: 1 } } },
            plugins: { legend: { display: false } }
          }
        })
      }

      // Project Status Doughnut
      if (projectStatusCanvas.value) {
        const sc = store.projectStatusCounts
        new Chart(projectStatusCanvas.value, {
          type: 'doughnut',
          data: {
            labels: ['Green', 'Yellow', 'Red'],
            datasets: [{
              data: [sc.green, sc.yellow, sc.red],
              backgroundColor: ['#22c55e', '#eab308', '#ef4444']
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: window.innerWidth < 640 ? 'bottom' : 'right', labels: { usePointStyle: true, padding: 16 } } }
          }
        })
      }

      // Budget by Category Bar
      if (budgetChartCanvas.value) {
        const cats = {}
        store.data.projects.forEach(p => {
          cats[p.category] = (cats[p.category] || 0) + (p.budget || 0)
        })
        const colors = { 'Run / Pflicht': '#64748b', 'Modernisierung': '#3b82f6', 'Optimierung': '#10b981', 'Innovation / Grow': '#8b5cf6', 'Infrastruktur': '#f97316' }
        new Chart(budgetChartCanvas.value, {
          type: 'bar',
          data: {
            labels: Object.keys(cats),
            datasets: [{
              data: Object.values(cats).map(v => v / 1000),
              backgroundColor: Object.keys(cats).map(k => colors[k] || '#94a3b8'),
              borderRadius: 4
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { callback: v => '€' + v + 'k' } } },
            plugins: { legend: { display: false } }
          }
        })
      }
    }

    onMounted(() => { nextTick(renderCharts) })

    return { store, linkTo, kpis, eliminateApps, attentionProjects, mgmtKpis, mgmtTrendClass, mgmtTrendIcon, mgmtKpiPct, mgmtKpiColor, timeChartCanvas, maturityChartCanvas, projectStatusCanvas, budgetChartCanvas }
  }
}
