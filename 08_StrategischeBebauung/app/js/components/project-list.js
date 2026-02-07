// project-list.js — Project Portfolio table with filter/sort
import { store } from '../store.js'
import { linkTo, navigateTo } from '../router.js'

export default {
  name: 'ProjectList',
  template: `
    <div class="space-y-4">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="search" type="text" placeholder="Search projects…"
               class="flex-1 min-w-[200px] px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
        <select v-model="filterCat" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">All Categories</option>
          <option v-for="c in store.data.enums.projectCategory" :key="c" :value="c">{{ c }}</option>
        </select>
        <select v-model="filterStatus" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">All Status</option>
          <option value="green">Green</option>
          <option value="yellow">Yellow</option>
          <option value="red">Red</option>
        </select>
        <button @click="showForm = true"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 whitespace-nowrap">
          + Add Project
        </button>
      </div>

      <div class="text-xs text-gray-500">{{ filtered.length }} of {{ store.totalProjects }} projects · Total Budget: €{{ (totalBudget / 1000).toFixed(0) }}k</div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-200 bg-surface-50">
              <th class="text-left px-4 py-3 font-medium text-gray-600 w-8"></th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" @click="toggleSort('name')">Name {{ sortIcon('name') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Category</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Domain</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 hidden sm:table-cell" @click="toggleSort('budget')">Budget {{ sortIcon('budget') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Timeline</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Sponsor</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Dependencies</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="p in filtered" :key="p.id"
                class="hover:bg-surface-50 cursor-pointer transition-colors"
                @click="navigateTo('/projects/' + p.id)">
              <td class="px-4 py-3">
                <span class="w-2.5 h-2.5 rounded-full inline-block" :class="statusDot(p.status)"></span>
              </td>
              <td class="px-4 py-3">
                <div class="font-medium text-gray-900">{{ p.name }}</div>
                <div class="text-xs text-gray-400">{{ p.id }}</div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="catClass(p.category)">{{ p.category }}</span>
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <div class="flex items-center gap-1.5">
                  <span class="domain-swatch" :style="{ backgroundColor: domainColor(p.primaryDomain) }"></span>
                  <span class="text-xs text-gray-600">{{ domainName(p.primaryDomain) }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right font-mono text-gray-700 hidden sm:table-cell">€{{ (p.budget / 1000).toFixed(0) }}k</td>
              <td class="px-4 py-3 text-xs text-gray-600 hidden lg:table-cell">{{ p.start }} → {{ p.end }}</td>
              <td class="px-4 py-3 text-xs text-gray-600 hidden lg:table-cell">{{ p.sponsor }}</td>
              <td class="px-4 py-3 text-center hidden md:table-cell">
                <span v-if="depCount(p.id) > 0" class="text-xs px-2 py-0.5 rounded-full bg-surface-100 text-gray-600">{{ depCount(p.id) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Project Form Modal -->
      <project-form v-if="showForm" @close="showForm = false" @saved="showForm = false"></project-form>
    </div>
  `,
  setup () {
    const { ref, computed } = Vue
    const search = ref('')
    const filterCat = ref('')
    const filterStatus = ref('')
    const sortBy = ref('name')
    const sortDir = ref(1)
    const showForm = ref(false)

    function toggleSort (f) {
      if (sortBy.value === f) sortDir.value *= -1
      else { sortBy.value = f; sortDir.value = 1 }
    }
    function sortIcon (f) { return sortBy.value === f ? (sortDir.value === 1 ? '↑' : '↓') : '' }

    const filtered = computed(() => {
      let list = [...store.data.projects]
      const q = search.value.toLowerCase()
      if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
      if (filterCat.value) list = list.filter(p => p.category === filterCat.value)
      if (filterStatus.value) list = list.filter(p => p.status === filterStatus.value)
      list.sort((a, b) => {
        const av = a[sortBy.value], bv = b[sortBy.value]
        if (typeof av === 'number') return (av - bv) * sortDir.value
        return String(av).localeCompare(String(bv)) * sortDir.value
      })
      return list
    })

    const totalBudget = computed(() => filtered.value.reduce((s, p) => s + (p.budget || 0), 0))

    function statusDot (s) { return { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500' }[s] || 'bg-gray-400' }
    function catClass (c) {
      return { 'Run / Pflicht': 'bg-gray-100 text-gray-700', 'Modernisierung': 'bg-blue-100 text-blue-700', 'Optimierung': 'bg-green-100 text-green-700', 'Innovation / Grow': 'bg-purple-100 text-purple-700', 'Infrastruktur': 'bg-orange-100 text-orange-700' }[c] || 'bg-gray-100 text-gray-600'
    }
    function domainColor (id) { const d = store.domainById(id); return d ? d.color : '#94a3b8' }
    function domainName (id) { const d = store.domainById(id); return d ? d.name : '—' }
    function depCount (id) { return store.depsForProject(id).length }

    return { store, linkTo, navigateTo, search, filterCat, filterStatus, filtered, totalBudget, toggleSort, sortIcon, statusDot, catClass, domainColor, domainName, depCount, showForm }
  }
}
