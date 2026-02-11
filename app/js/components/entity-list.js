// entity-list.js — Legal entity overview with app counts
import { store } from '../store.js'
import { linkTo, navigateTo } from '../router.js'

export default {
  name: 'EntityList',
  template: `
    <div class="space-y-4">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="search" type="text" placeholder="Entität suchen…"
               class="flex-1 min-w-[200px] px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none" />
        <select v-model="filterRegion" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">Alle Regionen</option>
          <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
        </select>
        <button @click="showForm = true"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors whitespace-nowrap">
          + Neue Entität
        </button>
      </div>

      <!-- Count -->
      <div class="text-xs text-gray-500">{{ filtered.length }} von {{ store.totalEntities }} Entitäten</div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a v-for="ent in filtered" :key="ent.id"
           :href="linkTo('/entities/' + ent.id)"
           class="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md transition-shadow cursor-pointer group">
          <div class="flex items-start justify-between mb-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-lg">{{ countryFlag(ent.country) }}</span>
                <h3 class="text-sm font-semibold text-gray-900 group-hover:text-primary-600">{{ ent.shortName }}</h3>
              </div>
              <div class="text-xs text-gray-500">{{ ent.name }}</div>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full" :class="regionClass(ent.region)">{{ ent.region }}</span>
          </div>
          <p class="text-xs text-gray-500 mb-3 line-clamp-2">{{ ent.description }}</p>
          <div class="flex items-center justify-between pt-3 border-t border-surface-100">
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <span class="text-sm font-bold text-gray-700">{{ appCount(ent.id) }}</span>
              <span class="text-xs text-gray-400">Apps</span>
            </div>
            <div class="flex items-center gap-1 text-xs text-gray-400">
              <span>{{ ent.city }}, {{ ent.country }}</span>
            </div>
          </div>
        </a>
      </div>

      <!-- Summary Table -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-x-auto">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Entity-Applikations-Matrix</h3>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-200 bg-surface-50">
              <th class="text-left px-4 py-2 font-medium text-gray-600">Entität</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">Land</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">Region</th>
              <th class="text-right px-4 py-2 font-medium text-gray-600">Apps</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600 hidden lg:table-cell">Parent</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="ent in filtered" :key="ent.id" class="hover:bg-surface-50 cursor-pointer" @click="navigateTo('/entities/' + ent.id)">
              <td class="px-4 py-2">
                <div class="flex items-center gap-2">
                  <span>{{ countryFlag(ent.country) }}</span>
                  <span class="font-medium text-gray-900">{{ ent.shortName }}</span>
                </div>
              </td>
              <td class="px-4 py-2 text-gray-600">{{ ent.country }}</td>
              <td class="px-4 py-2">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="regionClass(ent.region)">{{ ent.region }}</span>
              </td>
              <td class="px-4 py-2 text-right font-mono font-bold text-gray-700">{{ appCount(ent.id) }}</td>
              <td class="px-4 py-2 text-xs text-gray-400 hidden lg:table-cell">{{ parentName(ent.parentEntity) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create Modal -->
      <entity-form v-if="showForm" @close="showForm = false" @saved="onSaved"></entity-form>
    </div>
  `,
  setup () {
    const { ref, computed } = Vue
    const search = ref('')
    const filterRegion = ref('')
    const showForm = ref(false)

    const entities = computed(() => store.data.legalEntities || [])

    const regions = computed(() => {
      const set = new Set(entities.value.map(e => e.region).filter(Boolean))
      return [...set].sort()
    })

    const filtered = computed(() => {
      let list = [...entities.value]
      const q = search.value.toLowerCase()
      if (q) list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.shortName.toLowerCase().includes(q) ||
        e.country.toLowerCase().includes(q) ||
        (e.city || '').toLowerCase().includes(q)
      )
      if (filterRegion.value) list = list.filter(e => e.region === filterRegion.value)
      return list.sort((a, b) => appCount(b.id) - appCount(a.id))
    })

    function appCount (entityId) {
      return store.appsForEntity(entityId).length
    }

    function parentName (parentId) {
      if (!parentId) return '—'
      const p = store.entityById(parentId)
      return p ? p.shortName : parentId
    }

    const flagMap = { AT: '🇦🇹', CH: '🇨🇭', DE: '🇩🇪', US: '🇺🇸', CA: '🇨🇦', IT: '🇮🇹', FR: '🇫🇷', GB: '🇬🇧', CN: '🇨🇳', JP: '🇯🇵', AU: '🇦🇺', IN: '🇮🇳', BR: '🇧🇷' }
    function countryFlag (code) {
      return flagMap[code] || '🏳️'
    }

    function regionClass (region) {
      return {
        'Headquarters': 'bg-purple-100 text-purple-700',
        'DACH': 'bg-blue-100 text-blue-700',
        'Americas': 'bg-green-100 text-green-700',
        'EMEA': 'bg-amber-100 text-amber-700',
        'APAC': 'bg-cyan-100 text-cyan-700'
      }[region] || 'bg-gray-100 text-gray-600'
    }

    function onSaved () {
      showForm.value = false
    }

    return { store, linkTo, navigateTo, search, filterRegion, regions, filtered, appCount, parentName, countryFlag, regionClass, showForm, onSaved }
  }
}
