// app-list.js — Application table with sort/filter
import { store } from '../store.js'
import { linkTo, navigateTo } from '../router.js'

export default {
  name: 'AppList',
  template: `
    <div class="space-y-4">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="search" type="text" placeholder="Search applications…"
               class="flex-1 min-w-[200px] px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none" />
        <select v-model="filterTime" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">All TIME</option>
          <option v-for="t in ['Invest','Tolerate','Migrate','Eliminate']" :key="t" :value="t">{{ t }}</option>
        </select>
        <select v-model="filterCrit" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">All Criticality</option>
          <option v-for="c in ['Mission-Critical','Business-Critical','Business-Operational','Administrative']" :key="c" :value="c">{{ c }}</option>
        </select>
        <select v-model="filterEntity" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">Alle Entitäten</option>
          <option v-for="ent in allEntities" :key="ent.id" :value="ent.id">{{ ent.shortName }}</option>
        </select>
        <button @click="exportCsv"
                class="px-4 py-2 bg-surface-100 text-gray-700 rounded-lg text-sm hover:bg-surface-200 transition-colors whitespace-nowrap border border-surface-200"
                title="Export filtered list as CSV">
          ↓ CSV
        </button>
        <button @click="showForm = true"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors whitespace-nowrap">
          + Add Application
        </button>
      </div>

      <!-- Count -->
      <div class="text-xs text-gray-500">{{ filtered.length }} of {{ store.totalApps }} applications</div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-200 bg-surface-50">
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" @click="toggleSort('name')">Name {{ sortIcon('name') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Category</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" @click="toggleSort('criticality')">Criticality {{ sortIcon('criticality') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" @click="toggleSort('timeQuadrant')">TIME {{ sortIcon('timeQuadrant') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Type</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 hidden md:table-cell" @click="toggleSort('costPerYear')">Cost/yr {{ sortIcon('costPerYear') }}</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Users</th>
              <th class="text-center px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Entitäten</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="app in filtered" :key="app.id"
                class="hover:bg-surface-50 cursor-pointer transition-colors"
                @click="navigateTo('/apps/' + app.id)">
              <td class="px-4 py-3">
                <div class="font-medium text-gray-900">{{ app.name }}</div>
                <div class="text-xs text-gray-400">{{ vendorNames(app) }}</div>
              </td>
              <td class="px-4 py-3 text-gray-600 hidden md:table-cell">{{ app.category }}</td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="critClass(app.criticality)">{{ app.criticality }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="timeClass(app.timeQuadrant)">{{ app.timeQuadrant }}</span>
              </td>
              <td class="px-4 py-3 text-gray-600 hidden md:table-cell">{{ app.type }}</td>
              <td class="px-4 py-3 text-right text-gray-700 font-mono hidden md:table-cell">{{ app.costPerYear > 0 ? '€' + app.costPerYear.toLocaleString() : '—' }}</td>
              <td class="px-4 py-3 text-right text-gray-600 hidden lg:table-cell">{{ app.userCount }}</td>
              <td class="px-4 py-3 text-center text-gray-600 hidden lg:table-cell">
                <span class="text-xs font-mono">{{ (app.entities || []).length }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Total -->
      <div class="flex justify-end text-sm text-gray-500">
        Total annual cost: <strong class="ml-1 text-gray-800">€{{ totalCost.toLocaleString() }}</strong>
      </div>

      <!-- App Form Modal -->
      <app-form v-if="showForm" @close="showForm = false" @saved="onSaved"></app-form>
    </div>
  `,
  setup () {
    const { ref, computed } = Vue
    const search = ref('')
    const filterTime = ref('')
    const filterCrit = ref('')
    const filterEntity = ref('')
    const sortBy = ref('name')
    const sortDir = ref(1)
    const showForm = ref(false)

    const allEntities = Vue.computed(() => {
      return [...(store.data.legalEntities || [])].sort((a, b) => a.shortName.localeCompare(b.shortName))
    })

    function toggleSort (field) {
      if (sortBy.value === field) sortDir.value *= -1
      else { sortBy.value = field; sortDir.value = 1 }
    }
    function sortIcon (field) {
      if (sortBy.value !== field) return ''
      return sortDir.value === 1 ? '↑' : '↓'
    }

    const filtered = computed(() => {
      let list = [...store.data.applications]
      const q = search.value.toLowerCase()
      if (q) list = list.filter(a => a.name.toLowerCase().includes(q) || (a.vendor || '').toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || (a.vendors || []).some(v => (v.vendorName || '').toLowerCase().includes(q)))
      if (filterTime.value) list = list.filter(a => a.timeQuadrant === filterTime.value)
      if (filterCrit.value) list = list.filter(a => a.criticality === filterCrit.value)
      if (filterEntity.value) list = list.filter(a => a.entities && a.entities.includes(filterEntity.value))
      list.sort((a, b) => {
        const av = a[sortBy.value], bv = b[sortBy.value]
        if (typeof av === 'number') return (av - bv) * sortDir.value
        return String(av).localeCompare(String(bv)) * sortDir.value
      })
      return list
    })

    const totalCost = computed(() => filtered.value.reduce((s, a) => s + (a.costPerYear || 0), 0))

    function critClass (c) {
      return { 'Mission-Critical': 'bg-red-100 text-red-700', 'Business-Critical': 'bg-orange-100 text-orange-700', 'Business-Operational': 'bg-yellow-100 text-yellow-700', 'Administrative': 'bg-gray-100 text-gray-600' }[c] || 'bg-gray-100 text-gray-600'
    }
    function timeClass (t) {
      return { Invest: 'bg-green-100 text-green-700', Tolerate: 'bg-yellow-100 text-yellow-700', Migrate: 'bg-blue-100 text-blue-700', Eliminate: 'bg-red-100 text-red-700' }[t] || 'bg-gray-100 text-gray-600'
    }

    function onSaved () { showForm.value = false }

    function vendorNames (app) {
      if (app.vendors && Array.isArray(app.vendors) && app.vendors.length > 0) {
        return app.vendors.map(v => v.vendorName).filter(Boolean).join(', ')
      }
      return app.vendor || '—'
    }

    function escapeCsvField (val) {
      const str = String(val == null ? '' : val)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"'
      }
      return str
    }

    function exportCsv () {
      const headers = ['ID', 'Name', 'Category', 'Criticality', 'TIME', 'Type', 'Cost/Year', 'Users', 'Vendor']
      const rows = filtered.value.map(app => [
        app.id,
        app.name,
        app.category,
        app.criticality,
        app.timeQuadrant,
        app.type,
        app.costPerYear || 0,
        app.userCount || 0,
        vendorNames(app)
      ])
      const csv = [headers, ...rows].map(row => row.map(escapeCsvField).join(',')).join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'applications-export.csv'
      link.click()
      URL.revokeObjectURL(url)
    }

    return { store, linkTo, navigateTo, search, filterTime, filterCrit, filterEntity, allEntities, sortBy, sortDir, filtered, totalCost, toggleSort, sortIcon, critClass, timeClass, showForm, onSaved, vendorNames, exportCsv }
  }
}
