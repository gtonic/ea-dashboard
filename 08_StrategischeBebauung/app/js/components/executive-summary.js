// executive-summary.js — Executive Summary / Management Report (print/PDF-ready)
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'ExecutiveSummary',
  template: `
    <div class="space-y-6">
      <!-- Toolbar (no-print) -->
      <div class="flex flex-wrap items-center gap-3 no-print">
        <h2 class="text-sm font-semibold text-gray-700">Executive Summary — {{ reportDate }}</h2>
        <div class="flex-1"></div>
        <button @click="printReport()" class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Export PDF / Print
        </button>
      </div>

      <!-- Print-optimized Report -->
      <div class="print-report space-y-5">
        <!-- Report Header -->
        <div class="bg-white rounded-xl border border-surface-200 p-6">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-xl font-bold text-gray-900">{{ store.data.meta.company }}</h1>
              <h2 class="text-lg font-semibold text-primary-600 mt-1">IT Strategy — Executive Summary</h2>
              <p class="text-sm text-gray-500 mt-1">Report Date: {{ reportDate }} · Version {{ store.data.meta.version }}</p>
            </div>
            <div class="text-right text-xs text-gray-400">
              <div>Owner: {{ store.data.meta.owner }}</div>
              <div>Generated: {{ generatedAt }}</div>
            </div>
          </div>
        </div>

        <!-- KPI Overview Cards -->
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide flex items-center gap-2">
            <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            Key Performance Indicators
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div v-for="kpi in summaryKpis" :key="kpi.label" class="border border-surface-200 rounded-lg p-3 text-center">
              <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{{ kpi.label }}</div>
              <div class="text-2xl font-bold mt-1" :style="{ color: kpi.color }">{{ kpi.value }}</div>
              <div v-if="kpi.sub" class="text-[10px] text-gray-400 mt-0.5">{{ kpi.sub }}</div>
            </div>
          </div>
        </div>

        <!-- Ampelstatus (Traffic Light) Overview -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- Project Status Ampel -->
          <div class="bg-white rounded-xl border border-surface-200 p-5">
            <h3 class="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide flex items-center gap-2">
              <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Project Status Overview
            </h3>
            <div class="flex items-center gap-6 mb-4">
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">{{ statusCounts.green }}</span>
                <span class="text-sm text-gray-600">On Track</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">{{ statusCounts.yellow }}</span>
                <span class="text-sm text-gray-600">At Risk</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">{{ statusCounts.red }}</span>
                <span class="text-sm text-gray-600">Critical</span>
              </div>
            </div>
            <!-- Status bar -->
            <div class="w-full h-3 rounded-full flex overflow-hidden bg-surface-100">
              <div class="bg-green-500 h-full" :style="{ width: statusPct('green') + '%' }"></div>
              <div class="bg-yellow-500 h-full" :style="{ width: statusPct('yellow') + '%' }"></div>
              <div class="bg-red-500 h-full" :style="{ width: statusPct('red') + '%' }"></div>
            </div>
          </div>

          <!-- Budget Overview -->
          <div class="bg-white rounded-xl border border-surface-200 p-5">
            <h3 class="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide flex items-center gap-2">
              <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Budget Overview
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between items-baseline">
                <span class="text-sm text-gray-600">Total Portfolio Budget</span>
                <span class="text-xl font-bold text-gray-900">€{{ (store.totalBudget / 1000).toFixed(0) }}k</span>
              </div>
              <div v-for="cat in budgetByCategory" :key="cat.name" class="flex items-center gap-3">
                <span class="text-xs text-gray-600 w-36 truncate">{{ cat.name }}</span>
                <div class="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full" :style="{ width: cat.pct + '%', backgroundColor: cat.color }"></div>
                </div>
                <span class="text-xs font-mono text-gray-700 w-16 text-right">€{{ (cat.amount / 1000).toFixed(0) }}k</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Management KPIs -->
        <div v-if="mgmtKpis.length" class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide flex items-center gap-2">
            <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            Management KPIs — Target vs Actual
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div v-for="kpi in mgmtKpis" :key="kpi.id" class="border rounded-lg p-3"
                 :class="kpiStatusBorder(kpi)">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-semibold text-gray-700 truncate">{{ kpi.name }}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full" :class="trendClass(kpi.trend)">
                  {{ trendIcon(kpi.trend) }} {{ kpi.trend }}
                </span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-lg font-bold" :style="{ color: kpiColor(kpi) }">{{ kpi.current }}</span>
                <span class="text-xs text-gray-400">/ {{ kpi.target }} {{ kpi.unit }}</span>
              </div>
              <div class="mt-1.5 w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full" :style="{ width: kpiPct(kpi) + '%', backgroundColor: kpiColor(kpi) }"></div>
              </div>
              <div class="text-[10px] text-gray-400 mt-1">{{ kpiDeltaText(kpi) }}</div>
            </div>
          </div>
        </div>

        <!-- Two columns: Top 5 Projects + Top 5 Risks -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- Top 5 Projects -->
          <div class="bg-white rounded-xl border border-surface-200 p-5">
            <h3 class="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide flex items-center gap-2">
              <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
              Top 5 Projects (by Budget)
            </h3>
            <div class="space-y-2">
              <div v-for="(p, i) in topProjects" :key="p.id"
                   class="flex items-center gap-3 py-1.5 border-b border-surface-100 last:border-0">
                <span class="text-xs font-bold text-gray-400 w-5">{{ i + 1 }}.</span>
                <span class="w-2 h-2 rounded-full shrink-0" :class="statusDot(p.status)"></span>
                <div class="flex-1 min-w-0">
                  <a :href="linkTo('/projects/' + p.id)" class="text-sm text-primary-600 hover:underline truncate block">{{ p.name }}</a>
                  <div class="text-[10px] text-gray-400">{{ p.category }} · {{ p.start }}→{{ p.end }}</div>
                </div>
                <span class="text-xs font-mono text-gray-700">€{{ (p.budget / 1000).toFixed(0) }}k</span>
                <span class="text-xs px-1.5 py-0.5 rounded-full" :class="conformityClass(p.conformity)">{{ p.conformity || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Top 5 Risk Items -->
          <div class="bg-white rounded-xl border border-surface-200 p-5">
            <h3 class="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide flex items-center gap-2">
              <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
              Top 5 Risks / Action Items
            </h3>
            <div class="space-y-2">
              <div v-for="(risk, i) in topRisks" :key="i"
                   class="flex items-start gap-3 py-1.5 border-b border-surface-100 last:border-0">
                <span class="text-xs font-bold w-5 shrink-0" :class="risk.severityColor">{{ i + 1 }}.</span>
                <div class="flex-1 min-w-0">
                  <div class="text-sm text-gray-900">{{ risk.title }}</div>
                  <div class="text-[10px] text-gray-400">{{ risk.detail }}</div>
                </div>
                <span class="text-[10px] px-1.5 py-0.5 rounded-full shrink-0" :class="risk.badgeClass">{{ risk.type }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Handlungsbedarf (Action Required) -->
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide flex items-center gap-2">
            <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Handlungsbedarf / Required Actions
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="action in actionItems" :key="action.title"
                 class="border rounded-lg p-3" :class="action.borderClass">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full" :class="action.dotClass"></span>
                <span class="text-xs font-semibold text-gray-800">{{ action.title }}</span>
              </div>
              <p class="text-[11px] text-gray-600">{{ action.description }}</p>
            </div>
          </div>
        </div>

        <!-- Landscape Summary -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- TIME Distribution -->
          <div class="bg-white rounded-xl border border-surface-200 p-5">
            <h3 class="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Application Landscape (TIME)</h3>
            <div class="space-y-2">
              <div v-for="(count, quadrant) in store.timeDistribution" :key="quadrant" class="flex items-center gap-3">
                <span class="text-xs w-20 text-gray-600">{{ quadrant }}</span>
                <div class="flex-1 h-3 bg-surface-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full" :style="{ width: timePct(count) + '%', backgroundColor: timeColor(quadrant) }"></div>
                </div>
                <span class="text-xs font-mono text-gray-700 w-8 text-right">{{ count }}</span>
              </div>
            </div>
          </div>

          <!-- Maturity Overview -->
          <div class="bg-white rounded-xl border border-surface-200 p-5">
            <h3 class="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Maturity Overview</h3>
            <div class="space-y-2">
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600">Average Maturity</span>
                <span class="font-bold" :style="{ color: store.avgMaturity >= 3 ? '#10b981' : '#f59e0b' }">{{ store.avgMaturity }} / 5</span>
              </div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600">Target Maturity</span>
                <span class="font-bold text-blue-600">{{ store.avgTargetMaturity }} / 5</span>
              </div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600">Capabilities with Gap</span>
                <span class="font-bold text-orange-600">{{ store.maturityGaps.length }}</span>
              </div>
              <div v-for="gap in topGaps" :key="gap.capId" class="flex items-center gap-2 text-xs py-0.5">
                <span class="domain-swatch" :style="{ backgroundColor: gap.domainColor }"></span>
                <span class="text-gray-700 flex-1 truncate">{{ gap.capName }}</span>
                <span class="text-orange-600 font-mono">{{ gap.current }}→{{ gap.target }} (Δ{{ gap.gap.toFixed(1) }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-[10px] text-gray-400 py-4 border-t border-surface-200">
          {{ store.data.meta.company }} · EA Bebauungsplan · {{ reportDate }} · Confidential
        </div>
      </div>
    </div>
  `,
  setup () {
    const { computed } = Vue

    const reportDate = computed(() => {
      return new Date().toLocaleDateString('de-AT', { year: 'numeric', month: 'long', day: 'numeric' })
    })

    const generatedAt = computed(() => {
      return new Date().toLocaleString('de-AT')
    })

    // ── Summary KPIs ──
    const summaryKpis = computed(() => [
      { label: 'Applications', value: store.totalApps, color: '#3b82f6' },
      { label: 'Projects', value: store.totalProjects, color: '#6366f1', sub: statusCounts.value.green + ' green · ' + statusCounts.value.yellow + ' yellow · ' + statusCounts.value.red + ' red' },
      { label: 'Total Budget', value: '€' + (store.totalBudget / 1000).toFixed(0) + 'k', color: '#8b5cf6' },
      { label: 'Avg Maturity', value: store.avgMaturity + '/5', color: store.avgMaturity >= 3 ? '#10b981' : '#f59e0b', sub: 'Target: ' + store.avgTargetMaturity + '/5' },
      { label: 'Domains', value: store.data.domains.length, color: '#3b82f6' },
      { label: 'Capabilities', value: store.totalCapabilities, color: '#64748b', sub: store.totalSubCapabilities + ' sub-capabilities' },
      { label: 'Vendors', value: store.totalVendors, color: '#f97316' },
      { label: 'Demands', value: store.totalDemands, color: '#8b5cf6' }
    ])

    // ── Status ──
    const statusCounts = computed(() => store.projectStatusCounts)

    function statusPct (status) {
      const total = store.totalProjects
      if (!total) return 0
      return (statusCounts.value[status] / total) * 100
    }

    function statusDot (s) {
      return { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500' }[s] || 'bg-gray-400'
    }

    // ── Budget by Category ──
    const budgetByCategory = computed(() => {
      const cats = {}
      store.data.projects.forEach(p => {
        const key = p.category || 'Other'
        cats[key] = (cats[key] || 0) + (p.budget || 0)
      })
      const total = store.totalBudget || 1
      const colors = {
        'Run / Pflicht': '#64748b',
        'Modernisierung': '#3b82f6',
        'Optimierung': '#10b981',
        'Innovation / Grow': '#8b5cf6',
        'Infrastruktur': '#f97316'
      }
      return Object.entries(cats).map(([name, amount]) => ({
        name,
        amount,
        pct: (amount / total) * 100,
        color: colors[name] || '#94a3b8'
      })).sort((a, b) => b.amount - a.amount)
    })

    // ── Management KPIs ──
    const mgmtKpis = computed(() => store.data.managementKPIs || [])

    function kpiPct (kpi) {
      const c = parseFloat(kpi.current) || 0
      const t = parseFloat(kpi.target) || 1
      return Math.min(100, (c / t) * 100)
    }

    function kpiColor (kpi) {
      const p = kpiPct(kpi)
      if (p >= 80) return '#10b981'
      if (p >= 50) return '#f59e0b'
      return '#ef4444'
    }

    function kpiStatusBorder (kpi) {
      const p = kpiPct(kpi)
      if (p >= 80) return 'border-green-200'
      if (p >= 50) return 'border-yellow-200'
      return 'border-red-200'
    }

    function kpiDeltaText (kpi) {
      const c = parseFloat(kpi.current) || 0
      const t = parseFloat(kpi.target) || 0
      const delta = c - t
      if (delta >= 0) return '✓ Target reached'
      return 'Δ ' + delta.toFixed(0) + ' ' + (kpi.unit || '') + ' to target'
    }

    function trendClass (t) {
      return {
        improving: 'bg-green-100 text-green-700',
        stable: 'bg-gray-100 text-gray-600',
        declining: 'bg-red-100 text-red-700'
      }[t] || 'bg-gray-100 text-gray-600'
    }

    function trendIcon (t) {
      return { improving: '↑', stable: '→', declining: '↓' }[t] || '→'
    }

    // ── Top Projects ──
    const topProjects = computed(() => {
      return [...store.data.projects]
        .sort((a, b) => (b.budget || 0) - (a.budget || 0))
        .slice(0, 5)
    })

    function conformityClass (c) {
      return {
        'Konform': 'bg-blue-100 text-blue-700',
        'Teilkonform': 'bg-orange-100 text-orange-700',
        'Widerspricht': 'bg-red-100 text-red-700'
      }[c] || 'bg-gray-100 text-gray-600'
    }

    // ── Top Risks (auto-generated from data) ──
    const topRisks = computed(() => {
      const risks = []

      // Red projects = risks
      store.data.projects
        .filter(p => p.status === 'red')
        .forEach(p => {
          risks.push({
            title: p.name + ' — Critical Status',
            detail: p.statusText || 'Project is in red status',
            type: 'Project',
            severityColor: 'text-red-600',
            badgeClass: 'bg-red-100 text-red-700',
            priority: 1
          })
        })

      // Yellow projects = risks
      store.data.projects
        .filter(p => p.status === 'yellow')
        .forEach(p => {
          risks.push({
            title: p.name + ' — At Risk',
            detail: p.statusText || 'Project needs attention',
            type: 'Project',
            severityColor: 'text-yellow-600',
            badgeClass: 'bg-yellow-100 text-yellow-700',
            priority: 2
          })
        })

      // Non-conform projects
      store.data.projects
        .filter(p => p.conformity === 'Widerspricht')
        .forEach(p => {
          risks.push({
            title: p.name + ' — Non-Conformant',
            detail: 'Project contradicts architecture principles',
            type: 'Conformity',
            severityColor: 'text-red-600',
            badgeClass: 'bg-red-100 text-red-700',
            priority: 1
          })
        })

      // Apps to eliminate
      const eliminateApps = store.data.applications.filter(a => a.timeQuadrant === 'Eliminate')
      if (eliminateApps.length > 0) {
        risks.push({
          title: eliminateApps.length + ' Applications marked for Elimination',
          detail: eliminateApps.map(a => a.name).join(', '),
          type: 'Landscape',
          severityColor: 'text-orange-600',
          badgeClass: 'bg-orange-100 text-orange-700',
          priority: 2
        })
      }

      // Maturity gaps
      const bigGaps = store.maturityGaps.filter(g => g.gap >= 2)
      if (bigGaps.length > 0) {
        risks.push({
          title: bigGaps.length + ' Capabilities with critical maturity gap (≥2)',
          detail: bigGaps.slice(0, 3).map(g => g.capName + ' (Δ' + g.gap.toFixed(1) + ')').join(', '),
          type: 'Maturity',
          severityColor: 'text-orange-600',
          badgeClass: 'bg-orange-100 text-orange-700',
          priority: 2
        })
      }

      return risks.sort((a, b) => a.priority - b.priority).slice(0, 5)
    })

    // ── Action Items (auto-derived) ──
    const actionItems = computed(() => {
      const items = []

      const redProjects = store.data.projects.filter(p => p.status === 'red')
      if (redProjects.length > 0) {
        items.push({
          title: 'Critical Projects',
          description: redProjects.length + ' project(s) in red status require immediate management attention: ' + redProjects.map(p => p.name).join(', '),
          dotClass: 'bg-red-500',
          borderClass: 'border-red-200'
        })
      }

      const yellowProjects = store.data.projects.filter(p => p.status === 'yellow')
      if (yellowProjects.length > 0) {
        items.push({
          title: 'Projects at Risk',
          description: yellowProjects.length + ' project(s) need attention: ' + yellowProjects.map(p => p.name).join(', '),
          dotClass: 'bg-yellow-500',
          borderClass: 'border-yellow-200'
        })
      }

      const eliminateApps = store.data.applications.filter(a => a.timeQuadrant === 'Eliminate')
      if (eliminateApps.length > 0) {
        items.push({
          title: 'App Decommissioning',
          description: eliminateApps.length + ' application(s) planned for elimination: ' + eliminateApps.map(a => a.name).join(', '),
          dotClass: 'bg-orange-500',
          borderClass: 'border-orange-200'
        })
      }

      const bigGaps = store.maturityGaps.filter(g => g.gap >= 2)
      if (bigGaps.length > 0) {
        items.push({
          title: 'Maturity Investment',
          description: bigGaps.length + ' capability gap(s) ≥2 require targeted investment',
          dotClass: 'bg-blue-500',
          borderClass: 'border-blue-200'
        })
      }

      const nonConform = store.data.projects.filter(p => p.conformity === 'Widerspricht')
      if (nonConform.length > 0) {
        items.push({
          title: 'Architecture Compliance',
          description: nonConform.length + ' project(s) contradict architecture principles and need review',
          dotClass: 'bg-red-500',
          borderClass: 'border-red-200'
        })
      }

      return items
    })

    // ── TIME Distribution ──
    function timePct (count) {
      const total = store.totalApps
      return total ? (count / total) * 100 : 0
    }

    function timeColor (quadrant) {
      return { Invest: '#f59e0b', Tolerate: '#10b981', Migrate: '#3b82f6', Eliminate: '#ef4444' }[quadrant] || '#94a3b8'
    }

    // ── Top maturity gaps ──
    const topGaps = computed(() => store.maturityGaps.slice(0, 5))

    // ── Print / PDF ──
    function printReport () {
      window.print()
    }

    return {
      store, linkTo, reportDate, generatedAt,
      summaryKpis, statusCounts, statusPct, statusDot,
      budgetByCategory,
      mgmtKpis, kpiPct, kpiColor, kpiStatusBorder, kpiDeltaText, trendClass, trendIcon,
      topProjects, conformityClass,
      topRisks, actionItems,
      timePct, timeColor, topGaps,
      printReport
    }
  }
}
