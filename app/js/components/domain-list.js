// domain-list.js — Grid of all capability domains with strategy info
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'DomainList',
  template: `
    <div class="space-y-6">
      <!-- Header with Add button -->
      <div class="flex items-center justify-between">
        <div></div>
        <button @click="showDomainForm = true" class="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">+ Add Domain</button>
      </div>

      <!-- Domain Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <a v-for="domain in store.data.domains" :key="domain.id"
           :href="linkTo('/domains/' + domain.id)"
           class="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-lg transition-all group">
          <!-- Domain Header -->
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                 :style="{ backgroundColor: domain.color }">
              {{ domain.id }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600">{{ domain.name }}</div>
              <div class="text-xs text-gray-400">{{ domain.capabilities.length }} capabilities</div>
            </div>
          </div>

          <!-- Owner badge -->
          <div v-if="domain.domainOwner" class="mb-2">
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-gray-500">{{ domain.domainOwner }}</span>
          </div>

          <!-- Maturity Overview -->
          <div class="space-y-1.5 mb-3">
            <div v-for="cap in domain.capabilities" :key="cap.id" class="flex items-center gap-2">
              <span class="text-[10px] text-gray-500 w-7 shrink-0">{{ cap.id }}</span>
              <span class="text-xs text-gray-600 flex-1 truncate">{{ cap.name }}</span>
              <div class="w-16 h-1.5 bg-surface-100 rounded-full shrink-0 overflow-hidden relative">
                <div class="maturity-bar" :style="{ width: (cap.maturity / 5 * 100) + '%', backgroundColor: maturityColor(cap.maturity) }"></div>
              </div>
              <span class="text-[10px] text-gray-400 w-3 text-right">{{ cap.maturity }}</span>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-surface-100">
            <span>Ist: {{ avgMaturity(domain) }}/5</span>
            <span v-if="avgGap(domain) > 0" class="text-indigo-500 font-medium">Gap: {{ avgGap(domain) }}</span>
            <span>{{ appCount(domain) }} apps</span>
          </div>
        </a>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-500">
        <span class="font-medium">Maturity:</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-red-400"></span> 1 Initial</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-orange-400"></span> 2 Managed</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-yellow-400"></span> 3 Defined</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-lime-500"></span> 4 Measured</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-emerald-500"></span> 5 Optimized</span>
      </div>

      <!-- Add Domain Modal -->
      <domain-form v-if="showDomainForm" @close="showDomainForm = false" @saved="showDomainForm = false" />
    </div>
  `,
  setup () {
    const { ref } = Vue
    const showDomainForm = ref(false)

    function maturityColor (m) {
      const colors = { 1: '#f87171', 2: '#fb923c', 3: '#facc15', 4: '#a3e635', 5: '#34d399' }
      return colors[m] || '#94a3b8'
    }

    function avgMaturity (domain) {
      const caps = domain.capabilities
      if (!caps.length) return 0
      return (caps.reduce((s, c) => s + c.maturity, 0) / caps.length).toFixed(1)
    }

    function avgGap (domain) {
      const caps = domain.capabilities
      if (!caps.length) return 0
      const gapSum = caps.reduce((s, c) => s + ((c.targetMaturity || c.maturity) - c.maturity), 0)
      return (gapSum / caps.length).toFixed(1)
    }

    function appCount (domain) {
      const capIds = domain.capabilities.map(c => c.id)
      const appIds = new Set(
        store.data.capabilityMappings
          .filter(m => capIds.includes(m.capabilityId))
          .map(m => m.applicationId)
      )
      return appIds.size
    }

    return { store, linkTo, showDomainForm, maturityColor, avgMaturity, avgGap, appCount }
  }
}
