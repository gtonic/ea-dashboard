// cap-app-matrix.js — Capability × Application heatmap matrix
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'CapAppMatrix',
  template: `
    <div class="space-y-4">
      <p class="text-sm text-gray-500">Rows = L1 Capabilities · Columns = Applications · Cell color indicates mapping role.</p>

      <!-- Filter -->
      <div class="flex flex-wrap items-center gap-3">
        <select v-model="filterDomain" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option :value="0">All Domains</option>
          <option v-for="d in store.data.domains" :key="d.id" :value="d.id">{{ d.id }}. {{ d.name }}</option>
        </select>
        <label class="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" v-model="hideUnmapped" class="rounded" />
          Hide unmapped apps
        </label>
      </div>

      <!-- Matrix -->
      <div class="relative">
        <p class="text-xs text-gray-400 mb-1 md:hidden">← Horizontal scrollen →</p>
        <div class="bg-white rounded-xl border border-surface-200 overflow-auto max-h-[75vh] -webkit-overflow-scrolling-touch">
        <table class="text-xs border-collapse min-w-max">
          <thead class="sticky top-0 z-20 bg-white">
            <tr>
              <th class="sticky left-0 z-30 bg-surface-50 px-3 py-2 text-left font-medium text-gray-600 border-b border-r border-surface-200 min-w-[200px]">Capability</th>
              <th v-for="app in visibleApps" :key="app.id"
                  class="px-1 py-2 border-b border-surface-200 text-center font-medium text-gray-600 min-w-[60px]"
                  :title="app.name + ' — ' + app.vendor">
                <div class="writing-mode-vertical" style="writing-mode: vertical-lr; transform: rotate(180deg); max-height: 100px; overflow: hidden;">
                  {{ app.name }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="domain in filteredDomains" :key="domain.id">
              <!-- Domain separator row -->
              <tr>
                <td :colspan="visibleApps.length + 1" class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider sticky left-0 z-10"
                    :style="{ backgroundColor: domain.color + '15', color: domain.color }">
                  {{ domain.id }}. {{ domain.name }}
                </td>
              </tr>
              <!-- Capability rows -->
              <tr v-for="cap in domain.capabilities" :key="cap.id" class="hover:bg-surface-50">
                <td class="sticky left-0 z-10 bg-white px-3 py-1.5 border-b border-r border-surface-100 whitespace-nowrap">
                  <span class="text-gray-400 mr-1">{{ cap.id }}</span>
                  <span class="text-gray-700">{{ cap.name }}</span>
                </td>
                <td v-for="app in visibleApps" :key="app.id"
                    class="border-b border-surface-100 text-center p-0">
                  <div v-if="getMapping(cap.id, app.id)"
                       class="matrix-cell w-full h-full flex items-center justify-center py-1.5 cursor-pointer"
                       :class="getMapping(cap.id, app.id) === 'Primary' ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-700'"
                       :title="app.name + ' → ' + cap.name + ' (' + getMapping(cap.id, app.id) + ')'"
                       @click="toggleMapping(cap.id, app.id)">
                    {{ getMapping(cap.id, app.id) === 'Primary' ? '●' : '○' }}
                  </div>
                  <div v-else class="w-full h-full py-1.5 cursor-pointer hover:bg-surface-100 text-surface-300"
                       @click="toggleMapping(cap.id, app.id)"
                       :title="'Click to map ' + app.name + ' → ' + cap.name">
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-500">
        <span class="flex items-center gap-1"><span class="w-4 h-4 rounded bg-primary-500 text-white text-center text-[10px] leading-4">●</span> Primary</span>
        <span class="flex items-center gap-1"><span class="w-4 h-4 rounded bg-primary-100 text-primary-700 text-center text-[10px] leading-4">○</span> Secondary</span>
        <span class="flex items-center gap-1"><span class="w-4 h-4 rounded bg-surface-50 border border-surface-200"></span> No mapping (click to add)</span>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed } = Vue
    const filterDomain = ref(0)
    const hideUnmapped = ref(false)

    const filteredDomains = computed(() => {
      if (filterDomain.value === 0) return store.data.domains
      return store.data.domains.filter(d => d.id === filterDomain.value)
    })

    // All app IDs that have at least one mapping
    const mappedAppIds = computed(() => new Set(store.data.capabilityMappings.map(m => m.applicationId)))

    const visibleApps = computed(() => {
      let apps = [...store.data.applications]
      if (hideUnmapped.value) apps = apps.filter(a => mappedAppIds.value.has(a.id))
      return apps
    })

    function getMapping (capId, appId) {
      const m = store.data.capabilityMappings.find(m => m.capabilityId === capId && m.applicationId === appId)
      return m ? m.role : null
    }

    function toggleMapping (capId, appId) {
      const existing = getMapping(capId, appId)
      if (!existing) {
        store.addMapping(capId, appId, 'Primary')
      } else if (existing === 'Primary') {
        store.removeMapping(capId, appId)
        store.addMapping(capId, appId, 'Secondary')
      } else {
        store.removeMapping(capId, appId)
      }
    }

    return { store, linkTo, filterDomain, hideUnmapped, filteredDomains, visibleApps, getMapping, toggleMapping }
  }
}
