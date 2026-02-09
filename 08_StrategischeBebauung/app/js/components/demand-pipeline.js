// demand-pipeline.js — Demand-to-Project Pipeline: Kanban board, funnel, conversion, throughput analysis
import { store } from '../store.js'
import { linkTo, navigateTo } from '../router.js'

export default {
  name: 'DemandPipeline',
  template: `
    <div class="space-y-6">
      <h2 class="text-lg font-bold text-gray-800">Demand Pipeline</h2>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div class="bg-white rounded-xl border border-surface-200 p-4 hover:shadow-md transition-shadow">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Demands Gesamt</div>
          <div class="mt-1 text-2xl font-bold text-gray-800">{{ totalDemands }}</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4 hover:shadow-md transition-shadow">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Pipeline-Wert</div>
          <div class="mt-1 text-2xl font-bold text-blue-600">€{{ pipelineValue.toLocaleString() }}</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4 hover:shadow-md transition-shadow">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Genehmigter Wert</div>
          <div class="mt-1 text-2xl font-bold text-green-600">€{{ approvedValue.toLocaleString() }}</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4 hover:shadow-md transition-shadow">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Konversionsrate</div>
          <div class="mt-1 text-2xl font-bold text-purple-600">{{ conversionRate }}%</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4 hover:shadow-md transition-shadow">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">KI Use Cases</div>
          <div class="mt-1 text-2xl font-bold text-amber-600">{{ aiUseCaseCount }}</div>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="bg-white rounded-xl border border-surface-200 p-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Kanban Board</h3>
        <div class="flex gap-4 overflow-x-auto pb-2">
          <div v-for="col in kanbanColumns" :key="col.status"
               class="flex-shrink-0 w-64 rounded-lg border" :class="col.borderClass">
            <!-- Column Header -->
            <div class="px-3 py-2 rounded-t-lg text-sm font-semibold flex items-center justify-between"
                 :class="col.headerClass">
              <span>{{ col.status }}</span>
              <span class="text-xs font-normal px-1.5 py-0.5 rounded-full bg-white/30">{{ col.demands.length }}</span>
            </div>
            <!-- Cards -->
            <div class="p-2 space-y-2 max-h-[500px] overflow-y-auto bg-surface-50/50">
              <div v-if="col.demands.length === 0"
                   class="text-xs text-gray-400 text-center py-6 italic">Keine Demands</div>
              <div v-for="d in col.demands" :key="d.id"
                   class="bg-white rounded-lg border border-surface-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
                   @click="navigateTo('/demands/' + d.id)">
                <div class="flex items-start justify-between gap-1">
                  <div class="font-medium text-sm text-gray-900 line-clamp-2">{{ d.title }}</div>
                  <span class="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full" :class="prioClass(d.priority)">{{ d.priority }}</span>
                </div>
                <div class="mt-1.5 text-xs text-gray-500">{{ d.category }}</div>
                <div class="mt-1 flex items-center justify-between text-xs">
                  <span class="text-gray-400">{{ d.requestedBy }}</span>
                  <span v-if="d.estimatedBudget" class="font-mono text-gray-600">€{{ d.estimatedBudget.toLocaleString() }}</span>
                </div>
                <div v-if="d.isAIUseCase" class="mt-1.5">
                  <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">🤖 KI</span>
                </div>
                <!-- Convert to Project button for Genehmigt -->
                <button v-if="col.status === 'Genehmigt'"
                        class="mt-2 w-full text-xs px-2 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                        @click.stop="convertToProject(d)">
                  → Projekt erstellen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pipeline Funnel & Throughput side by side -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Pipeline Funnel -->
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Pipeline Funnel</h3>
          <div class="space-y-2">
            <div v-for="(stage, idx) in funnelStages" :key="stage.label" class="flex items-center gap-3">
              <div class="w-28 text-xs text-gray-600 text-right flex-shrink-0">{{ stage.label }}</div>
              <div class="flex-1 relative">
                <div class="h-8 rounded-md flex items-center px-3 text-xs font-medium text-white transition-all"
                     :class="stage.bgClass"
                     :style="{ width: stage.widthPct + '%', minWidth: '48px' }">
                  {{ stage.count }}
                </div>
              </div>
              <div class="w-16 text-xs text-gray-400 flex-shrink-0">
                <span v-if="idx > 0 && funnelStages[idx - 1].count > 0">
                  {{ Math.round(stage.count / funnelStages[idx - 1].count * 100) }}%
                </span>
              </div>
            </div>
          </div>
          <div class="mt-4 text-xs text-gray-400">Konversionsraten zwischen den Phasen</div>
        </div>

        <!-- Throughput Time Analysis -->
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-4">Durchlaufzeit-Analyse</h3>
          <div class="space-y-4">
            <!-- Aging per status -->
            <div>
              <div class="text-xs font-medium text-gray-600 mb-2">Alter nach Status (Tage seit Einreichung)</div>
              <div class="space-y-2">
                <div v-for="ag in agingByStatus" :key="ag.status" class="flex items-center gap-2">
                  <div class="w-24 text-xs text-gray-600 text-right flex-shrink-0">{{ ag.status }}</div>
                  <div class="flex-1 h-5 bg-surface-100 rounded overflow-hidden">
                    <div class="h-full rounded transition-all"
                         :class="ag.barClass"
                         :style="{ width: ag.widthPct + '%', minWidth: ag.count > 0 ? '24px' : '0' }">
                    </div>
                  </div>
                  <div class="w-20 text-xs text-gray-500 flex-shrink-0">
                    ⌀ {{ ag.avgDays }} Tage
                  </div>
                  <div class="w-8 text-xs text-gray-400">({{ ag.count }})</div>
                </div>
              </div>
            </div>
            <!-- Summary stats -->
            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-surface-100">
              <div>
                <div class="text-xs text-gray-500">Ø bis Genehmigung</div>
                <div class="text-lg font-bold text-gray-800">{{ avgToApproval }} Tage</div>
              </div>
              <div>
                <div class="text-xs text-gray-500">Ø Gesamtdurchlauf</div>
                <div class="text-lg font-bold text-gray-800">{{ avgTotalThroughput }} Tage</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed } = Vue

    const demands = computed(() => store.data.demands || [])

    // ── KPI Summary ──

    const totalDemands = computed(() => demands.value.length)

    const pipelineValue = computed(() =>
      demands.value.reduce((s, d) => s + (d.estimatedBudget || 0), 0)
    )

    const approvedValue = computed(() =>
      demands.value
        .filter(d => d.status === 'Genehmigt')
        .reduce((s, d) => s + (d.estimatedBudget || 0), 0)
    )

    const conversionRate = computed(() => {
      if (demands.value.length === 0) return 0
      const converted = demands.value.filter(d =>
        ['Genehmigt', 'In Umsetzung', 'Abgeschlossen'].includes(d.status)
      ).length
      return Math.round(converted / demands.value.length * 100)
    })

    const aiUseCaseCount = computed(() =>
      demands.value.filter(d => d.isAIUseCase === true).length
    )

    // ── Kanban Board ──

    const statusColors = {
      'Eingereicht':    { headerClass: 'bg-blue-500 text-white',   borderClass: 'border-blue-200' },
      'In Bewertung':   { headerClass: 'bg-yellow-500 text-white', borderClass: 'border-yellow-200' },
      'Genehmigt':      { headerClass: 'bg-green-500 text-white',  borderClass: 'border-green-200' },
      'Abgelehnt':      { headerClass: 'bg-red-500 text-white',    borderClass: 'border-red-200' },
      'In Umsetzung':   { headerClass: 'bg-purple-500 text-white', borderClass: 'border-purple-200' },
      'Abgeschlossen':  { headerClass: 'bg-gray-500 text-white',   borderClass: 'border-gray-200' }
    }

    const kanbanColumns = computed(() => {
      const statuses = store.data.enums.demandStatus || [
        'Eingereicht', 'In Bewertung', 'Genehmigt', 'Abgelehnt', 'In Umsetzung', 'Abgeschlossen'
      ]
      return statuses.map(status => ({
        status,
        demands: demands.value.filter(d => d.status === status),
        headerClass: (statusColors[status] || statusColors['Eingereicht']).headerClass,
        borderClass: (statusColors[status] || statusColors['Eingereicht']).borderClass
      }))
    })

    function prioClass (p) {
      return {
        'Hoch': 'bg-red-100 text-red-700',
        'Mittel': 'bg-yellow-100 text-yellow-700',
        'Niedrig': 'bg-green-100 text-green-700'
      }[p] || 'bg-gray-100 text-gray-600'
    }

    // ── Demand → Project Conversion ──

    function currentQuarter () {
      const now = new Date()
      const q = Math.ceil((now.getMonth() + 1) / 3)
      return 'Q' + q + '/' + now.getFullYear()
    }

    function nextQuarter () {
      const now = new Date()
      let q = Math.ceil((now.getMonth() + 1) / 3) + 1
      let y = now.getFullYear()
      if (q > 4) { q = 1; y++ }
      return 'Q' + q + '/' + y
    }

    function convertToProject (demand) {
      const categoryMap = {
        'Projekt (> 50k)': 'Modernisierung',
        'Bereichsvorhaben (< 50k)': 'Modernisierung',
        'Idee': 'Innovation'
      }

      const proj = {
        name: demand.title,
        primaryDomain: demand.primaryDomain,
        secondaryDomains: demand.relatedDomains || [],
        budget: demand.estimatedBudget || 0,
        category: categoryMap[demand.category] || 'Modernisierung',
        status: 'green',
        start: currentQuarter(),
        end: nextQuarter(),
        sponsor: demand.requestedBy,
        affectedApps: (demand.relatedApps || []).map(appId => ({ appId, action: 'verändern' })),
        capabilities: [],
        conformity: 'Teilkonform'
      }

      store.addProject(proj)
      store.updateDemand(demand.id, { status: 'In Umsetzung' })
      navigateTo('/projects/' + proj.id)
    }

    // ── Pipeline Funnel ──

    const funnelLabels = ['Eingereicht', 'In Bewertung', 'Genehmigt', 'In Umsetzung', 'Abgeschlossen']
    const funnelBgClasses = ['bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-gray-500']

    const funnelStages = computed(() => {
      const counts = funnelLabels.map(label =>
        demands.value.filter(d => d.status === label).length
      )
      const maxCount = Math.max(...counts, 1)
      return funnelLabels.map((label, idx) => ({
        label,
        count: counts[idx],
        widthPct: Math.max(Math.round(counts[idx] / maxCount * 100), counts[idx] > 0 ? 8 : 0),
        bgClass: funnelBgClasses[idx]
      }))
    })

    // ── Throughput Time Analysis ──

    function daysSince (dateStr) {
      if (!dateStr) return 0
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return 0
      const now = new Date()
      return Math.max(0, Math.round((now - d) / (1000 * 60 * 60 * 24)))
    }

    const agingBarClasses = {
      'Eingereicht':   'bg-blue-400',
      'In Bewertung':  'bg-yellow-400',
      'Genehmigt':     'bg-green-400',
      'Abgelehnt':     'bg-red-400',
      'In Umsetzung':  'bg-purple-400',
      'Abgeschlossen': 'bg-gray-400'
    }

    const agingByStatus = computed(() => {
      const statuses = store.data.enums.demandStatus || Object.keys(agingBarClasses)
      const results = statuses.map(status => {
        const items = demands.value.filter(d => d.status === status)
        const ages = items.map(d => daysSince(d.requestDate))
        const avg = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0
        return { status, count: items.length, avgDays: avg, barClass: agingBarClasses[status] || 'bg-gray-400' }
      })
      const maxAvg = Math.max(...results.map(r => r.avgDays), 1)
      return results.map(r => ({ ...r, widthPct: Math.round(r.avgDays / maxAvg * 100) }))
    })

    const avgToApproval = computed(() => {
      const approved = demands.value.filter(d =>
        ['Genehmigt', 'In Umsetzung', 'Abgeschlossen'].includes(d.status)
      )
      if (approved.length === 0) return '—'
      const ages = approved.map(d => daysSince(d.requestDate))
      return Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
    })

    const avgTotalThroughput = computed(() => {
      const done = demands.value.filter(d => d.status === 'Abgeschlossen')
      if (done.length === 0) return '—'
      const ages = done.map(d => daysSince(d.requestDate))
      return Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
    })

    return {
      store, linkTo, navigateTo,
      totalDemands, pipelineValue, approvedValue, conversionRate, aiUseCaseCount,
      kanbanColumns, prioClass, convertToProject,
      funnelStages, agingByStatus, avgToApproval, avgTotalThroughput
    }
  }
}
