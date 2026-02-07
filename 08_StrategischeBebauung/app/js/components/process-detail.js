// process-detail.js — E2E Process detail view with KPIs and domain links
import { store } from '../store.js'
import { router, linkTo, navigateTo } from '../router.js'

export default {
  name: 'ProcessDetail',
  template: `
    <div v-if="proc" class="space-y-6">
      <div class="flex items-center gap-4">
        <a :href="linkTo('/processes')" class="text-sm text-gray-500 hover:text-primary-600">← Processes</a>
      </div>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <span class="text-xs font-mono bg-surface-100 px-2 py-0.5 rounded text-gray-500">{{ proc.id }}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full" :class="statusClass(proc.status)">{{ proc.status }}</span>
          </div>
          <h2 class="text-xl font-bold text-gray-900">{{ proc.name }}</h2>
          <p v-if="proc.description" class="text-sm text-gray-500 mt-1">{{ proc.description }}</p>
          <div v-if="proc.owner" class="mt-1">
            <span class="text-xs px-2 py-0.5 rounded-full bg-surface-100 text-gray-600">Owner: {{ proc.owner }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button @click="showForm = true" class="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700">Edit</button>
          <button @click="deleteProc" class="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50">Delete</button>
        </div>
      </div>

      <!-- Linked Domains -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Linked Domains</h3>
        </div>
        <div class="p-5 flex flex-wrap gap-3">
          <a v-for="d in linkedDomains" :key="d.id" :href="linkTo('/domains/' + d.id)"
             class="flex items-center gap-2 px-3 py-2 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors">
            <div class="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
                 :style="{ backgroundColor: d.color }">{{ d.id }}</div>
            <span class="text-sm text-gray-700">{{ d.name }}</span>
          </a>
          <div v-if="!linkedDomains.length" class="text-sm text-gray-400">No domains linked.</div>
        </div>
      </div>

      <!-- Involved Applications (derived via Domain → Capability → Mapping) -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Involvierte Applikationen ({{ involvedApps.length }})</h3>
          <p class="text-[10px] text-gray-400 mt-0.5">Automatisch abgeleitet über Domain → Capability → Mapping</p>
        </div>
        <div v-if="involvedApps.length" class="divide-y divide-surface-100">
          <a v-for="app in involvedApps" :key="app.id" :href="linkTo('/apps/' + app.id)"
             class="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono text-gray-400">{{ app.id }}</span>
              <span class="text-sm font-medium text-gray-800">{{ app.name }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full" :class="timeClass(app.timeQuadrant)">{{ app.timeQuadrant }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[10px] text-gray-400">{{ app.capCount }} Capabilities</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 text-gray-500">{{ app.roles }}</span>
            </div>
          </a>
        </div>
        <div v-else class="px-5 py-4 text-sm text-gray-400 italic">Keine Applikationen über Capability-Mappings verknüpft.</div>
      </div>

      <!-- Process KPIs -->
      <div v-if="proc.kpis && proc.kpis.length" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Process KPIs</h3>
        </div>
        <div class="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="kpi in proc.kpis" :key="kpi.id" class="border border-surface-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-gray-700">{{ kpi.name }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full"
                    :class="trendClass(kpi.trend)">
                {{ trendIcon(kpi.trend) }}
              </span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-bold" :style="{ color: kpiColor(kpi) }">{{ kpi.current }}</span>
              <span class="text-xs text-gray-400">/ {{ kpi.target }} {{ kpi.unit }}</span>
            </div>
            <div class="mt-2 w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all" :style="{ width: kpiProgress(kpi) + '%', backgroundColor: kpiColor(kpi) }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <process-form v-if="showForm" :edit-process="proc" @close="showForm = false" @saved="showForm = false" />
    </div>
    <div v-else class="text-center py-12 text-gray-500">Process not found.</div>
  `,
  setup () {
    const { ref, computed } = Vue
    const showForm = ref(false)

    const proc = computed(() => store.processById(router.params.id))

    const linkedDomains = computed(() => {
      if (!proc.value || !proc.value.domains) return []
      return proc.value.domains.map(id => store.domainById(id)).filter(Boolean)
    })

    const involvedApps = computed(() => {
      if (!proc.value) return []
      return store.appsForProcess(proc.value.id)
    })

    function statusClass (s) {
      return { active: 'bg-green-100 text-green-700', optimization: 'bg-blue-100 text-blue-700', transformation: 'bg-purple-100 text-purple-700' }[s] || 'bg-gray-100 text-gray-600'
    }
    function timeClass (t) {
      return { Invest: 'bg-green-100 text-green-700', Tolerate: 'bg-yellow-100 text-yellow-700', Migrate: 'bg-blue-100 text-blue-700', Eliminate: 'bg-red-100 text-red-700' }[t] || ''
    }
    function trendClass (t) {
      return { improving: 'bg-green-100 text-green-700', stable: 'bg-gray-100 text-gray-600', declining: 'bg-red-100 text-red-700' }[t] || 'bg-gray-100 text-gray-600'
    }
    function trendIcon (t) { return { improving: '↑', stable: '→', declining: '↓' }[t] || '→' }

    function kpiProgress (kpi) {
      const c = parseFloat(kpi.current) || 0; const t = parseFloat(kpi.target) || 1
      return Math.min(100, (c / t) * 100)
    }
    function kpiColor (kpi) {
      const pct = kpiProgress(kpi)
      if (pct >= 80) return '#10b981'; if (pct >= 50) return '#f59e0b'; return '#ef4444'
    }

    function deleteProc () {
      if (!proc.value) return
      if (confirm('Delete process "' + proc.value.name + '"?')) {
        store.deleteProcess(proc.value.id)
        navigateTo('/processes')
      }
    }

    return { store, router, linkTo, proc, linkedDomains, involvedApps, showForm, statusClass, timeClass, trendClass, trendIcon, kpiProgress, kpiColor, deleteProc }
  }
}
