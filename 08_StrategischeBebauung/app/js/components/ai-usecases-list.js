// ai-usecases-list.js — AI Use Cases overview with risk categorization
import { store } from '../store.js'
import { linkTo, navigateTo } from '../router.js'

export default {
  name: 'AIUsecasesList',
  template: `
    <div class="space-y-4">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="search" type="text" placeholder="AI Use Cases durchsuchen…"
               class="flex-1 min-w-[200px] px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none" />
        <select v-model="filterRisk" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">Alle Risikokategorien</option>
          <option v-for="r in riskCategories" :key="r" :value="r">{{ r }}</option>
        </select>
        <select v-model="filterStatus" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">Alle Status</option>
          <option v-for="s in store.data.enums.demandStatus" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <!-- Risk category summary cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div v-for="r in riskSummary" :key="r.category"
             class="bg-white rounded-xl border border-surface-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
             :class="filterRisk === r.category ? 'ring-2 ring-primary-400' : ''"
             @click="filterRisk = filterRisk === r.category ? '' : r.category">
          <div class="text-xs font-medium text-gray-500">{{ r.category }}</div>
          <div class="text-xl font-bold mt-1" :class="r.colorClass">{{ r.count }}</div>
        </div>
      </div>

      <!-- Count -->
      <div class="text-xs text-gray-500">{{ filtered.length }} AI Use Cases</div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-200 bg-surface-50">
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" @click="toggleSort('title')">Use Case {{ sortIcon('title') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" @click="toggleSort('aiRiskCategory')">Risikokategorie {{ sortIcon('aiRiskCategory') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" @click="toggleSort('status')">Status {{ sortIcon('status') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 hidden md:table-cell" @click="toggleSort('priority')">Priorität {{ sortIcon('priority') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">AI Beschreibung</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Eingereicht</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="d in filtered" :key="d.id"
                class="hover:bg-surface-50 cursor-pointer transition-colors"
                @click="navigateTo('/demands/' + d.id)">
              <td class="px-4 py-3">
                <div class="font-medium text-gray-900 flex items-center gap-1.5">
                  <span class="text-xs" title="AI Use Case">🤖</span>
                  {{ d.title }}
                </div>
                <div class="text-xs text-gray-400">{{ d.id }} · {{ d.requestedBy }}</div>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="riskClass(d.aiRiskCategory)">{{ d.aiRiskCategory || '—' }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="statusClass(d.status)">{{ d.status }}</span>
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="prioClass(d.priority)">{{ d.priority }}</span>
              </td>
              <td class="px-4 py-3 hidden lg:table-cell">
                <div class="text-xs text-gray-600 max-w-xs truncate" :title="d.aiDescription">{{ d.aiDescription || '—' }}</div>
              </td>
              <td class="px-4 py-3 text-gray-600 hidden lg:table-cell">{{ d.requestDate || '—' }}</td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-gray-400">Keine AI Use Cases gefunden</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed } = Vue
    const search = ref('')
    const filterRisk = ref('')
    const filterStatus = ref('')
    const sortBy = ref('title')
    const sortDir = ref(1)

    function toggleSort (field) {
      if (sortBy.value === field) sortDir.value *= -1
      else { sortBy.value = field; sortDir.value = 1 }
    }
    function sortIcon (field) {
      if (sortBy.value !== field) return ''
      return sortDir.value === 1 ? '↑' : '↓'
    }

    const riskCategories = computed(() => {
      return (store.data.enums.aiRiskCategory || []).filter(c => c !== 'Kein AI-Usecase')
    })

    const aiUseCases = computed(() => {
      return (store.data.demands || []).filter(d => d.isAIUseCase === true)
    })

    const filtered = computed(() => {
      let list = [...aiUseCases.value]
      const q = search.value.toLowerCase()
      if (q) list = list.filter(d => d.title.toLowerCase().includes(q) || (d.aiDescription || '').toLowerCase().includes(q) || (d.requestedBy || '').toLowerCase().includes(q))
      if (filterRisk.value) list = list.filter(d => d.aiRiskCategory === filterRisk.value)
      if (filterStatus.value) list = list.filter(d => d.status === filterStatus.value)
      list.sort((a, b) => {
        const av = a[sortBy.value], bv = b[sortBy.value]
        if (typeof av === 'number') return (av - bv) * sortDir.value
        return String(av || '').localeCompare(String(bv || '')) * sortDir.value
      })
      return list
    })

    const riskSummary = computed(() => {
      const categories = riskCategories.value
      const colors = {
        'Minimales Risiko': 'text-green-600',
        'Begrenztes Risiko': 'text-yellow-600',
        'Hohes Risiko': 'text-orange-600',
        'Unannehmbares Risiko': 'text-red-600'
      }
      return categories.map(c => ({
        category: c,
        count: aiUseCases.value.filter(d => d.aiRiskCategory === c).length,
        colorClass: colors[c] || 'text-gray-600'
      }))
    })

    function riskClass (r) {
      return {
        'Minimales Risiko': 'bg-green-100 text-green-700',
        'Begrenztes Risiko': 'bg-yellow-100 text-yellow-700',
        'Hohes Risiko': 'bg-orange-100 text-orange-700',
        'Unannehmbares Risiko': 'bg-red-100 text-red-700'
      }[r] || 'bg-gray-100 text-gray-600'
    }
    function statusClass (s) {
      return {
        'Eingereicht': 'bg-blue-100 text-blue-700',
        'In Bewertung': 'bg-yellow-100 text-yellow-700',
        'Genehmigt': 'bg-green-100 text-green-700',
        'Abgelehnt': 'bg-red-100 text-red-700',
        'In Umsetzung': 'bg-purple-100 text-purple-700',
        'Abgeschlossen': 'bg-gray-100 text-gray-600'
      }[s] || 'bg-gray-100 text-gray-600'
    }
    function prioClass (p) {
      return {
        'Hoch': 'bg-red-100 text-red-700',
        'Mittel': 'bg-yellow-100 text-yellow-700',
        'Niedrig': 'bg-green-100 text-green-700'
      }[p] || 'bg-gray-100 text-gray-600'
    }

    return { store, linkTo, navigateTo, search, filterRisk, filterStatus, sortBy, sortDir, filtered, riskSummary, riskCategories, toggleSort, sortIcon, riskClass, statusClass, prioClass }
  }
}
