// risk-heatmap.js — Risk & Compliance View: Heatmap, Shadow-IT, Vendor Risk, Lifecycle
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'RiskHeatmap',
  template: `
    <div class="space-y-6">

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">High-Risk Apps</div>
          <div class="mt-1 text-2xl font-bold text-red-600">{{ highRiskApps.length }}</div>
          <div class="text-xs text-gray-400 mt-1">Hoch/Sehr hoch</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Shadow-IT Candidates</div>
          <div class="mt-1 text-2xl font-bold text-orange-600">{{ shadowITApps.length }}</div>
          <div class="text-xs text-gray-400 mt-1">No Capability Mapping</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendor Risk</div>
          <div class="mt-1 text-2xl font-bold text-yellow-600">{{ vendorRisks.length }}</div>
          <div class="text-xs text-gray-400 mt-1">Expiring &le; 6 months</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">End-of-Life</div>
          <div class="mt-1 text-2xl font-bold text-red-700">{{ eolApps.length }}</div>
          <div class="text-xs text-gray-400 mt-1">EoL / EoS Apps</div>
        </div>
      </div>

      <!-- Risk Heatmap Matrix -->
      <div class="bg-white rounded-xl border border-surface-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Risiko-Heatmap – Wahrscheinlichkeit × Auswirkung</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="p-2 text-xs text-gray-500 text-left w-32">Wahrsch. ↓ / Auswirkung →</th>
                <th v-for="impact in impactLevels" :key="impact" class="p-2 text-xs font-semibold text-center min-w-[120px]">{{ impact }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(prob, pi) in probLevelsReversed" :key="prob">
                <td class="p-2 text-xs font-semibold text-gray-700 border-t border-surface-200">{{ prob }}</td>
                <td v-for="(impact, ii) in impactLevels" :key="impact"
                    class="p-2 border-t border-surface-200 align-top"
                    :class="cellBg(prob, impact)">
                  <div class="space-y-1">
                    <a v-for="app in appsInCell(prob, impact)" :key="app.id"
                       :href="linkTo('/apps/' + app.id)"
                       class="block text-xs px-2 py-1 rounded bg-white/70 hover:bg-white shadow-sm truncate font-medium"
                       :title="app.name + ' (' + app.criticality + ')'">
                      {{ app.name }}
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          <span class="flex items-center gap-1"><span class="w-4 h-3 rounded bg-green-100 border border-green-300"></span> Niedrig</span>
          <span class="flex items-center gap-1"><span class="w-4 h-3 rounded bg-yellow-100 border border-yellow-300"></span> Mittel</span>
          <span class="flex items-center gap-1"><span class="w-4 h-3 rounded bg-orange-100 border border-orange-300"></span> Hoch</span>
          <span class="flex items-center gap-1"><span class="w-4 h-3 rounded bg-red-100 border border-red-300"></span> Kritisch</span>
        </div>
      </div>

      <!-- Shadow-IT Indicators -->
      <div class="bg-white rounded-xl border border-surface-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Schatten-IT Indikatoren – Apps ohne Capability-Mapping</h2>
        <div v-if="shadowITApps.length === 0" class="text-sm text-gray-500 italic">Alle Applikationen sind einer Capability zugeordnet ✓</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <a v-for="app in shadowITApps" :key="app.id"
             :href="linkTo('/apps/' + app.id)"
             class="flex items-center gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors">
            <div class="w-8 h-8 rounded-lg bg-orange-200 flex items-center justify-center text-orange-700 text-xs font-bold shrink-0">!</div>
            <div class="min-w-0">
              <div class="text-sm font-medium text-gray-900 truncate">{{ app.name }}</div>
              <div class="text-xs text-gray-500">{{ app.vendor }} · {{ app.type }} · {{ app.criticality }}</div>
            </div>
          </a>
        </div>
      </div>

      <!-- Vendor Risk: Expiring Contracts & Single-Vendor Dependencies -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Expiring Contracts -->
        <div class="bg-white rounded-xl border border-surface-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Vendor-Risiko – Auslaufende Verträge</h2>
          <div v-if="vendorRisks.length === 0" class="text-sm text-gray-500 italic">Keine auslaufenden Verträge in den nächsten 6 Monaten ✓</div>
          <div v-else class="space-y-3">
            <a v-for="vr in vendorRisks" :key="vr.vendor.id"
               :href="linkTo('/vendors/' + vr.vendor.id)"
               class="flex items-center justify-between p-3 rounded-lg border hover:bg-surface-50 transition-colors"
               :class="vr.expired ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ vr.vendor.name }}</div>
                <div class="text-xs text-gray-500">{{ vr.appCount }} App(s) · {{ vr.vendor.criticality }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold" :class="vr.expired ? 'text-red-600' : 'text-yellow-700'">
                  {{ vr.expired ? 'Abgelaufen' : vr.daysLeft + ' Tage' }}
                </div>
                <div class="text-xs text-gray-400">{{ vr.vendor.contractEnd }}</div>
              </div>
            </a>
          </div>
        </div>

        <!-- Single-Vendor Dependencies -->
        <div class="bg-white rounded-xl border border-surface-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Single-Vendor-Dependencies</h2>
          <div class="space-y-3">
            <div v-for="vd in vendorDependencies" :key="vd.vendor"
                 class="p-3 rounded-lg border border-surface-200"
                 :class="vd.count >= 4 ? 'bg-red-50 border-red-200' : vd.count >= 2 ? 'bg-yellow-50 border-yellow-200' : 'bg-surface-50'">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-900">{{ vd.vendor }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                      :class="vd.count >= 4 ? 'bg-red-100 text-red-700' : vd.count >= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-surface-200 text-gray-600'">
                  {{ vd.count }} Apps
                </span>
              </div>
              <div class="flex flex-wrap gap-1">
                <a v-for="app in vd.apps" :key="app.id"
                   :href="linkTo('/apps/' + app.id)"
                   class="text-xs px-2 py-0.5 bg-white rounded border border-surface-200 hover:border-primary-300 truncate max-w-[140px]">
                  {{ app.name }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Compliance Risk Indicators (Phase C2) -->
      <div v-if="complianceEnabled && complianceRiskApps.length > 0" class="bg-white rounded-xl border border-surface-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Compliance-Risiken — Nicht-konforme Applikationen</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <a v-for="item in complianceRiskApps" :key="item.app.id"
             :href="linkTo('/apps/' + item.app.id)"
             class="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                 :class="item.nonCompliant > 0 ? 'bg-red-200 text-red-700' : 'bg-yellow-200 text-yellow-700'">
              {{ item.nonCompliant + item.partial }}
            </div>
            <div class="min-w-0">
              <div class="text-sm font-medium text-gray-900 truncate">{{ item.app.name }}</div>
              <div class="text-xs text-gray-500">{{ item.nonCompliant }} nicht-konform · {{ item.partial }} teilweise · {{ item.regulations.join(', ') }}</div>
            </div>
          </a>
        </div>
      </div>

      <!-- Lifecycle Status Overview -->
      <div class="bg-white rounded-xl border border-surface-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Lifecycle-Status pro Applikation</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-surface-200">
                <th class="py-2 pr-4">Application</th>
                <th class="py-2 pr-4">Vendor</th>
                <th class="py-2 pr-4">Criticality</th>
                <th class="py-2 pr-4">TIME</th>
                <th class="py-2 pr-4">Lifecycle</th>
                <th class="py-2 pr-4">Risk</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in sortedApps" :key="app.id" class="border-b border-surface-100 hover:bg-surface-50">
                <td class="py-2 pr-4">
                  <a :href="linkTo('/apps/' + app.id)" class="text-primary-600 hover:underline font-medium">{{ app.name }}</a>
                </td>
                <td class="py-2 pr-4 text-gray-600">{{ app.vendor }}</td>
                <td class="py-2 pr-4">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="critBadge(app.criticality)">{{ app.criticality }}</span>
                </td>
                <td class="py-2 pr-4">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="timeBadge(app.timeQuadrant)">{{ app.timeQuadrant }}</span>
                </td>
                <td class="py-2 pr-4">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="lifecycleBadge(app.lifecycleStatus)">{{ app.lifecycleStatus || 'Active' }}</span>
                </td>
                <td class="py-2 pr-4">
                  <span class="inline-block w-3 h-3 rounded-full" :class="riskDot(app)"></span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  setup () {
    const { computed } = Vue

    const probLevels = ['Sehr niedrig', 'Niedrig', 'Mittel', 'Hoch', 'Sehr hoch']
    const impactLevels = ['Sehr niedrig', 'Niedrig', 'Mittel', 'Hoch', 'Sehr hoch']
    const probLevelsReversed = computed(() => [...probLevels].reverse())

    const apps = computed(() => store.data.applications || [])
    const vendors = computed(() => store.data.vendors || [])
    const mappings = computed(() => store.data.capabilityMappings || [])

    // Risk score: 0-4 index for prob/impact, product gives severity
    function riskScore (app) {
      const pi = probLevels.indexOf(app.riskProbability || 'Niedrig')
      const ii = impactLevels.indexOf(app.riskImpact || 'Mittel')
      return (pi >= 0 ? pi : 1) * (ii >= 0 ? ii : 2)
    }

    function appsInCell (prob, impact) {
      return apps.value.filter(a =>
        (a.riskProbability || 'Niedrig') === prob &&
        (a.riskImpact || 'Mittel') === impact
      )
    }

    function cellBg (prob, impact) {
      const pi = probLevels.indexOf(prob)
      const ii = impactLevels.indexOf(impact)
      const score = pi * ii
      if (score >= 12) return 'bg-red-100'
      if (score >= 6) return 'bg-orange-100'
      if (score >= 3) return 'bg-yellow-100'
      return 'bg-green-50'
    }

    // High-risk apps
    const highRiskApps = computed(() => apps.value.filter(a => {
      const pi = probLevels.indexOf(a.riskProbability || 'Niedrig')
      const ii = impactLevels.indexOf(a.riskImpact || 'Mittel')
      return pi >= 3 || ii >= 3
    }))

    // Shadow IT: apps without any capability mapping
    const shadowITApps = computed(() => {
      const mappedIds = new Set(mappings.value.map(m => m.applicationId))
      return apps.value.filter(a => !mappedIds.has(a.id))
    })

    // Vendor risk: contracts expiring within 6 months or already expired
    const vendorRisks = computed(() => {
      const now = new Date()
      const sixMonths = new Date()
      sixMonths.setMonth(sixMonths.getMonth() + 6)

      return vendors.value
        .filter(v => v.contractEnd)
        .map(v => {
          const end = new Date(v.contractEnd)
          const expired = end < now
          const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
          const appCount = apps.value.filter(a => a.vendor === v.name).length
          return { vendor: v, expired, daysLeft, appCount }
        })
        .filter(vr => vr.expired || vr.daysLeft <= 180)
        .sort((a, b) => a.daysLeft - b.daysLeft)
    })

    // Single-vendor dependencies
    const vendorDependencies = computed(() => {
      const groups = {}
      apps.value.forEach(a => {
        const v = a.vendor || 'Unknown'
        if (!groups[v]) groups[v] = []
        groups[v].push(a)
      })
      return Object.entries(groups)
        .map(([vendor, vendorApps]) => ({ vendor, apps: vendorApps, count: vendorApps.length }))
        .filter(g => g.count >= 2)
        .sort((a, b) => b.count - a.count)
    })

    // EoL/EoS apps
    const eolApps = computed(() => apps.value.filter(a =>
      a.lifecycleStatus === 'End-of-Life' || a.lifecycleStatus === 'End-of-Support'
    ))

    // Sorted apps for lifecycle table
    const sortedApps = computed(() => {
      return [...apps.value].sort((a, b) => {
        const order = { 'End-of-Life': 0, 'End-of-Support': 1, 'Active': 2, 'Planned': 3 }
        const ao = order[a.lifecycleStatus] ?? 2
        const bo = order[b.lifecycleStatus] ?? 2
        if (ao !== bo) return ao - bo
        return riskScore(b) - riskScore(a)
      })
    })

    function critBadge (crit) {
      const map = {
        'Mission-Critical': 'bg-red-100 text-red-700',
        'Business-Critical': 'bg-orange-100 text-orange-700',
        'Business-Operational': 'bg-yellow-100 text-yellow-700',
        'Administrative': 'bg-surface-200 text-gray-600'
      }
      return map[crit] || 'bg-surface-200 text-gray-600'
    }

    function timeBadge (tq) {
      const map = {
        'Invest': 'bg-green-100 text-green-700',
        'Tolerate': 'bg-yellow-100 text-yellow-700',
        'Migrate': 'bg-orange-100 text-orange-700',
        'Eliminate': 'bg-red-100 text-red-700'
      }
      return map[tq] || 'bg-surface-200 text-gray-600'
    }

    function lifecycleBadge (status) {
      const map = {
        'Active': 'bg-green-100 text-green-700',
        'Planned': 'bg-blue-100 text-blue-700',
        'End-of-Support': 'bg-orange-100 text-orange-700',
        'End-of-Life': 'bg-red-100 text-red-700'
      }
      return map[status] || 'bg-green-100 text-green-700'
    }

    function riskDot (app) {
      const s = riskScore(app)
      if (s >= 12) return 'bg-red-500'
      if (s >= 6) return 'bg-orange-500'
      if (s >= 3) return 'bg-yellow-500'
      return 'bg-green-500'
    }

    // Compliance risk indicators (Phase C2)
    const complianceEnabled = computed(() => store.featureToggles.complianceEnabled)
    const complianceRiskApps = computed(() => {
      if (!complianceEnabled.value) return []
      const assessments = store.data.complianceAssessments || []
      const result = []
      ;(store.data.applications || []).forEach(app => {
        if (!app.regulations || app.regulations.length === 0) return
        const appAssessments = assessments.filter(a => a.appId === app.id)
        const nonCompliant = appAssessments.filter(a => a.status === 'nonCompliant').length
        const partial = appAssessments.filter(a => a.status === 'partial').length
        if (nonCompliant > 0 || partial > 0) {
          const regulations = appAssessments
            .filter(a => a.status === 'nonCompliant' || a.status === 'partial')
            .map(a => a.regulation)
          result.push({ app, nonCompliant, partial, regulations })
        }
      })
      return result.sort((a, b) => b.nonCompliant - a.nonCompliant)
    })

    return {
      store, linkTo,
      probLevels, impactLevels, probLevelsReversed,
      highRiskApps, shadowITApps, vendorRisks, eolApps,
      vendorDependencies, sortedApps,
      complianceEnabled, complianceRiskApps,
      appsInCell, cellBg, critBadge, timeBadge, lifecycleBadge, riskDot
    }
  }
}
