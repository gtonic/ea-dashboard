// domain-detail.js — Domain drill-down: strategy, KPIs, capabilities with Ist/Soll, mapped apps, projects
import { store } from '../store.js'
import { router, linkTo, navigateTo } from '../router.js'

export default {
  name: 'DomainDetail',
  template: `
    <div v-if="domain" class="space-y-6">
      <!-- Back link -->
      <div class="flex items-center gap-4">
        <a :href="linkTo('/domains')" class="text-sm text-gray-500 hover:text-primary-600">← Domains</a>
      </div>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold"
               :style="{ backgroundColor: domain.color }">
            {{ domain.id }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ domain.name }}</h2>
            <p class="text-sm text-gray-500">{{ domain.description }}</p>
            <div v-if="domain.domainOwner" class="mt-1 flex items-center gap-2">
              <span class="text-xs px-2 py-0.5 rounded-full bg-surface-100 text-gray-600">Owner: {{ domain.domainOwner }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button @click="showDomainForm = true" class="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700">Edit Domain</button>
          <button @click="deleteDomain" class="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50">Delete</button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-xl border border-surface-200 p-4 text-center">
          <div class="text-2xl font-bold" :style="{ color: domain.color }">{{ domain.capabilities.length }}</div>
          <div class="text-xs text-gray-500">Capabilities</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4 text-center">
          <div class="text-2xl font-bold text-gray-700">{{ subCapCount }}</div>
          <div class="text-xs text-gray-500">Sub-Capabilities</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4 text-center">
          <div class="text-2xl font-bold" :style="{ color: avgMat >= 3 ? '#10b981' : '#f59e0b' }">{{ avgMat }}/5</div>
          <div class="text-xs text-gray-500">Avg Maturity (Ist)</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4 text-center">
          <div class="text-2xl font-bold text-indigo-600">{{ avgTarget }}/5</div>
          <div class="text-xs text-gray-500">Avg Target (Soll)</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4 text-center">
          <div class="text-2xl font-bold text-primary-600">{{ mappedAppIds.size }}</div>
          <div class="text-xs text-gray-500">Mapped Apps</div>
        </div>
      </div>

      <!-- Strategy & Vision -->
      <div v-if="domain.strategicFocus || domain.vision" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Strategy & Vision</h3>
        </div>
        <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="domain.strategicFocus">
            <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Strategic Focus</div>
            <p class="text-sm text-gray-800">{{ domain.strategicFocus }}</p>
          </div>
          <div v-if="domain.vision">
            <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Vision</div>
            <p class="text-sm text-gray-800">{{ domain.vision }}</p>
          </div>
        </div>
      </div>

      <!-- Domain KPIs -->
      <div v-if="domain.kpis && domain.kpis.length" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Domain KPIs</h3>
        </div>
        <div class="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="kpi in domain.kpis" :key="kpi.id" class="border border-surface-200 rounded-lg p-4">
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

      <!-- Capabilities Table with Ist/Soll -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-700">Capabilities</h3>
          <button @click="showCapForm = true; editCap = null" class="text-xs text-primary-600 hover:text-primary-800 font-medium">+ Add Capability</button>
        </div>
        <div class="divide-y divide-surface-100">
          <div v-for="cap in domain.capabilities" :key="cap.id" class="p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <span class="text-xs font-mono text-gray-500 bg-surface-100 px-2 py-0.5 rounded">{{ cap.id }}</span>
                <span class="text-sm font-medium text-gray-800">{{ cap.name }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full"
                      :class="criticalityClass(cap.criticality)">{{ cap.criticality }}</span>
              </div>
              <div class="flex items-center gap-2">
                <button @click="editCap = cap; showCapForm = true" class="text-xs text-gray-400 hover:text-primary-600">Edit</button>
                <button @click="deleteCap(cap)" class="text-xs text-gray-400 hover:text-red-500">Delete</button>
              </div>
            </div>

            <!-- Ist/Soll double bar -->
            <div class="flex items-center gap-3 mb-2 ml-12">
              <div class="flex-1 relative">
                <div class="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div class="maturity-bar h-full rounded-full" :style="{ width: (cap.maturity / 5 * 100) + '%', backgroundColor: maturityColor(cap.maturity) }"></div>
                </div>
                <div v-if="cap.targetMaturity && cap.targetMaturity !== cap.maturity"
                     class="absolute top-0 h-2 border-r-2 border-dashed border-indigo-500"
                     :style="{ left: (cap.targetMaturity / 5 * 100) + '%' }"></div>
              </div>
              <span class="text-xs text-gray-500 w-14 text-right">{{ cap.maturity }}/{{ cap.targetMaturity || cap.maturity }}</span>
              <button @click="adjustMaturity(cap, -1)" class="w-8 h-8 sm:w-5 sm:h-5 rounded text-xs bg-surface-100 hover:bg-surface-200 text-gray-500 flex items-center justify-center" :disabled="cap.maturity <= 1">−</button>
              <button @click="adjustMaturity(cap, 1)" class="w-8 h-8 sm:w-5 sm:h-5 rounded text-xs bg-surface-100 hover:bg-surface-200 text-gray-500 flex items-center justify-center" :disabled="cap.maturity >= 5">+</button>
            </div>

            <!-- Sub-capabilities -->
            <div v-if="cap.subCapabilities && cap.subCapabilities.length" class="ml-12 mt-1 flex flex-wrap gap-1.5">
              <span v-for="sub in cap.subCapabilities" :key="sub.id"
                    class="text-[10px] px-2 py-0.5 bg-surface-100 text-gray-600 rounded">
                {{ sub.id }} {{ sub.name }}
              </span>
            </div>

            <!-- Capability KPIs -->
            <div v-if="cap.kpis && cap.kpis.length" class="ml-12 mt-2 flex flex-wrap gap-3">
              <div v-for="kpi in cap.kpis" :key="kpi.id" class="text-[10px] px-2 py-1 border border-surface-200 rounded bg-white">
                <span class="font-medium">{{ kpi.name }}:</span>
                <span :style="{ color: kpiColor(kpi) }"> {{ kpi.current }}</span> / {{ kpi.target }} {{ kpi.unit }}
              </div>
            </div>

            <!-- Mapped Applications -->
            <div v-if="appsForCap(cap.id).length" class="ml-12 mt-2 flex flex-wrap gap-1.5">
              <a v-for="app in appsForCap(cap.id)" :key="app.id"
                 :href="linkTo('/apps/' + app.id)"
                 class="text-[10px] px-2 py-0.5 rounded border hover:bg-primary-50 transition-colors"
                 :class="app.role === 'Primary' ? 'border-primary-300 text-primary-700 bg-primary-50' : 'border-gray-300 text-gray-600'">
                {{ app.name }} ({{ app.role }})
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- E2E Processes for this domain -->
      <div v-if="relatedProcesses.length" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Related E2E Processes</h3>
        </div>
        <div class="divide-y divide-surface-100">
          <a v-for="proc in relatedProcesses" :key="proc.id" :href="linkTo('/processes/' + proc.id)"
             class="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono text-gray-500 bg-surface-100 px-2 py-0.5 rounded">{{ proc.id }}</span>
              <span class="text-sm text-gray-800">{{ proc.name }}</span>
            </div>
            <div class="flex items-center gap-3 text-xs text-gray-400">
              <span class="px-2 py-0.5 rounded-full"
                    :class="procStatusClass(proc.status)">{{ proc.status }}</span>
              <span>{{ proc.kpis ? proc.kpis.length : 0 }} KPIs</span>
            </div>
          </a>
        </div>
      </div>

      <!-- Related Projects -->
      <div v-if="relatedProjects.length" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Related Projects</h3>
        </div>
        <div class="divide-y divide-surface-100">
          <a v-for="p in relatedProjects" :key="p.id" :href="linkTo('/projects/' + p.id)"
             class="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full" :class="statusDot(p.status)"></span>
              <span class="text-sm text-gray-800">{{ p.name }}</span>
            </div>
            <div class="flex items-center gap-4 text-xs text-gray-400">
              <span>{{ p.category }}</span>
              <span>€{{ (p.budget / 1000).toFixed(0) }}k</span>
            </div>
          </a>
        </div>
      </div>

      <!-- Modals -->
      <domain-form v-if="showDomainForm" :edit-domain="domain" @close="showDomainForm = false" @saved="showDomainForm = false" />
      <capability-form v-if="showCapForm" :edit-capability="editCap" :domain-id="domain.id" @close="showCapForm = false; editCap = null" @saved="showCapForm = false; editCap = null" />
    </div>
    <div v-else class="text-center py-12 text-gray-500">Domain not found.</div>
  `,
  setup () {
    const { ref, computed } = Vue

    const showDomainForm = ref(false)
    const showCapForm = ref(false)
    const editCap = ref(null)

    const domain = computed(() => store.domainById(router.params.id))

    const subCapCount = computed(() => {
      if (!domain.value) return 0
      return domain.value.capabilities.reduce((n, c) => n + (c.subCapabilities ? c.subCapabilities.length : 0), 0)
    })

    const avgMat = computed(() => {
      if (!domain.value) return 0
      const caps = domain.value.capabilities
      return caps.length ? (caps.reduce((s, c) => s + c.maturity, 0) / caps.length).toFixed(1) : 0
    })

    const avgTarget = computed(() => {
      if (!domain.value) return 0
      const caps = domain.value.capabilities
      return caps.length ? (caps.reduce((s, c) => s + (c.targetMaturity || c.maturity), 0) / caps.length).toFixed(1) : 0
    })

    const mappedAppIds = computed(() => {
      if (!domain.value) return new Set()
      const capIds = domain.value.capabilities.map(c => c.id)
      return new Set(store.data.capabilityMappings.filter(m => capIds.includes(m.capabilityId)).map(m => m.applicationId))
    })

    function appsForCap (capId) { return store.appsForCapability(capId) }

    const relatedProjects = computed(() => {
      if (!domain.value) return []
      return store.projectsForDomain(domain.value.id)
    })

    const relatedProcesses = computed(() => {
      if (!domain.value) return []
      return store.processesForDomain(domain.value.id)
    })

    function maturityColor (m) {
      return { 1: '#f87171', 2: '#fb923c', 3: '#facc15', 4: '#a3e635', 5: '#34d399' }[m] || '#94a3b8'
    }

    function criticalityClass (c) {
      return { 'High': 'bg-red-100 text-red-700', 'Medium': 'bg-yellow-100 text-yellow-700', 'Low': 'bg-green-100 text-green-700' }[c] || 'bg-gray-100 text-gray-600'
    }

    function statusDot (s) {
      return { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500' }[s] || 'bg-gray-400'
    }

    function procStatusClass (s) {
      return { active: 'bg-green-100 text-green-700', optimization: 'bg-blue-100 text-blue-700', transformation: 'bg-purple-100 text-purple-700' }[s] || 'bg-gray-100 text-gray-600'
    }

    function trendClass (t) {
      return { improving: 'bg-green-100 text-green-700', stable: 'bg-gray-100 text-gray-600', declining: 'bg-red-100 text-red-700' }[t] || 'bg-gray-100 text-gray-600'
    }
    function trendIcon (t) {
      return { improving: '↑', stable: '→', declining: '↓' }[t] || '→'
    }

    function kpiProgress (kpi) {
      const c = parseFloat(kpi.current) || 0
      const t = parseFloat(kpi.target) || 1
      return Math.min(100, (c / t) * 100)
    }
    function kpiColor (kpi) {
      const pct = kpiProgress(kpi)
      if (pct >= 80) return '#10b981'
      if (pct >= 50) return '#f59e0b'
      return '#ef4444'
    }

    function adjustMaturity (cap, delta) {
      const newVal = cap.maturity + delta
      if (newVal >= 1 && newVal <= 5) cap.maturity = newVal
    }

    function deleteCap (cap) {
      if (confirm('Delete capability "' + cap.name + '"? Removes all mappings.')) {
        store.deleteCapability(cap.id)
      }
    }

    function deleteDomain () {
      if (!domain.value) return
      if (confirm('Delete domain "' + domain.value.name + '"? Removes all capabilities, mappings, and references.')) {
        store.deleteDomain(domain.value.id)
        navigateTo('/domains')
      }
    }

    return {
      store, domain, router, linkTo, showDomainForm, showCapForm, editCap,
      subCapCount, avgMat, avgTarget, mappedAppIds, appsForCap,
      relatedProjects, relatedProcesses,
      maturityColor, criticalityClass, statusDot, procStatusClass,
      trendClass, trendIcon, kpiProgress, kpiColor,
      adjustMaturity, deleteCap, deleteDomain
    }
  }
}
