// demand-list.js — Demand backlog with filters and status overview
import { store } from '../store.js'
import { linkTo, navigateTo } from '../router.js'

export default {
  name: 'DemandList',
  template: `
    <div class="space-y-4">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="search" type="text" placeholder="Demands durchsuchen…"
               class="flex-1 min-w-[200px] px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none" />
        <select v-model="filterStatus" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">Alle Status</option>
          <option v-for="s in store.data.enums.demandStatus" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="filterCategory" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">Alle Kategorien</option>
          <option v-for="c in store.data.enums.demandCategory" :key="c" :value="c">{{ c }}</option>
        </select>
        <select v-model="filterPriority" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">Alle Prioritäten</option>
          <option v-for="p in store.data.enums.demandPriority" :key="p" :value="p">{{ p }}</option>
        </select>
        <button @click="showForm = true"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors whitespace-nowrap">
          + Neuer Demand
        </button>
      </div>

      <!-- Status summary cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div v-for="s in statusSummary" :key="s.status"
             class="bg-white rounded-xl border border-surface-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
             :class="filterStatus === s.status ? 'ring-2 ring-primary-400' : ''"
             @click="filterStatus = filterStatus === s.status ? '' : s.status">
          <div class="text-xs font-medium text-gray-500">{{ s.status }}</div>
          <div class="text-xl font-bold mt-1" :class="s.colorClass">{{ s.count }}</div>
        </div>
      </div>

      <!-- Count -->
      <div class="text-xs text-gray-500">{{ filtered.length }} von {{ store.totalDemands }} Demands</div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-200 bg-surface-50">
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" @click="toggleSort('title')">Demand {{ sortIcon('title') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 hidden md:table-cell" @click="toggleSort('category')">Kategorie {{ sortIcon('category') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" @click="toggleSort('status')">Status {{ sortIcon('status') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" @click="toggleSort('priority')">Priorität {{ sortIcon('priority') }}</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 hidden md:table-cell" @click="toggleSort('estimatedBudget')">Budget {{ sortIcon('estimatedBudget') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Eingereicht</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Freigabe</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="d in filtered" :key="d.id"
                class="hover:bg-surface-50 cursor-pointer transition-colors"
                @click="navigateTo('/demands/' + d.id)">
              <td class="px-4 py-3">
                <div class="font-medium text-gray-900">{{ d.title }}</div>
                <div class="text-xs text-gray-400">{{ d.id }} · {{ d.requestedBy }}</div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="catClass(d.category)">{{ d.category }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="statusClass(d.status)">{{ d.status }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="prioClass(d.priority)">{{ d.priority }}</span>
              </td>
              <td class="px-4 py-3 text-right text-gray-700 font-mono hidden md:table-cell">{{ d.estimatedBudget > 0 ? '€' + d.estimatedBudget.toLocaleString() : '—' }}</td>
              <td class="px-4 py-3 text-gray-600 hidden lg:table-cell">{{ d.requestDate || '—' }}</td>
              <td class="px-4 py-3 hidden lg:table-cell">
                <div class="flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full" :class="checklistDot(d.checklistSecurity)"></span>
                  <span class="w-2 h-2 rounded-full" :class="checklistDot(d.checklistLegal)"></span>
                  <span class="w-2 h-2 rounded-full" :class="checklistDot(d.checklistArchitecture)"></span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Total budget -->
      <div class="flex justify-end text-sm text-gray-500">
        Geschätztes Gesamtbudget: <strong class="ml-1 text-gray-800">€{{ totalBudget.toLocaleString() }}</strong>
      </div>

      <!-- Demand Form Modal -->
      <demand-form v-if="showForm" @close="showForm = false" @saved="onSaved"></demand-form>
    </div>
  `,
  setup () {
    const { ref, computed } = Vue
    const search = ref('')
    const filterStatus = ref('')
    const filterCategory = ref('')
    const filterPriority = ref('')
    const sortBy = ref('requestDate')
    const sortDir = ref(-1)
    const showForm = ref(false)

    function toggleSort (field) {
      if (sortBy.value === field) sortDir.value *= -1
      else { sortBy.value = field; sortDir.value = 1 }
    }
    function sortIcon (field) {
      if (sortBy.value !== field) return ''
      return sortDir.value === 1 ? '↑' : '↓'
    }

    const filtered = computed(() => {
      let list = [...(store.data.demands || [])]
      const q = search.value.toLowerCase()
      if (q) list = list.filter(d => d.title.toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q) || (d.requestedBy || '').toLowerCase().includes(q))
      if (filterStatus.value) list = list.filter(d => d.status === filterStatus.value)
      if (filterCategory.value) list = list.filter(d => d.category === filterCategory.value)
      if (filterPriority.value) list = list.filter(d => d.priority === filterPriority.value)
      list.sort((a, b) => {
        const av = a[sortBy.value], bv = b[sortBy.value]
        if (typeof av === 'number') return (av - bv) * sortDir.value
        return String(av || '').localeCompare(String(bv || '')) * sortDir.value
      })
      return list
    })

    const totalBudget = computed(() => filtered.value.reduce((s, d) => s + (d.estimatedBudget || 0), 0))

    const statusSummary = computed(() => {
      const statuses = store.data.enums.demandStatus || []
      const colors = {
        'Eingereicht': 'text-blue-600',
        'In Bewertung': 'text-yellow-600',
        'Genehmigt': 'text-green-600',
        'Abgelehnt': 'text-red-600',
        'In Umsetzung': 'text-purple-600',
        'Abgeschlossen': 'text-gray-600'
      }
      return statuses.map(s => ({
        status: s,
        count: (store.data.demands || []).filter(d => d.status === s).length,
        colorClass: colors[s] || 'text-gray-600'
      }))
    })

    function catClass (c) {
      return {
        'Idee': 'bg-purple-100 text-purple-700',
        'Bereichsvorhaben (< 50k)': 'bg-blue-100 text-blue-700',
        'Projekt (> 50k)': 'bg-orange-100 text-orange-700'
      }[c] || 'bg-gray-100 text-gray-600'
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

    function checklistDot (checklist) {
      if (!checklist) return 'bg-gray-300'
      const items = Object.entries(checklist).filter(([k]) => k !== 'notes')
      const done = items.filter(([, v]) => v === true).length
      if (done === items.length) return 'bg-green-500'
      if (done > 0) return 'bg-yellow-500'
      return 'bg-gray-300'
    }

    function onSaved () { showForm.value = false }

    return { store, linkTo, navigateTo, search, filterStatus, filterCategory, filterPriority, sortBy, sortDir, filtered, totalBudget, statusSummary, toggleSort, sortIcon, catClass, statusClass, prioClass, checklistDot, showForm, onSaved }
  }
}
