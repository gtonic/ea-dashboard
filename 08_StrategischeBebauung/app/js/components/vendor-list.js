// vendor-list.js — Vendor table with sort/filter
import { store } from '../store.js'
import { linkTo, navigateTo } from '../router.js'

export default {
  name: 'VendorList',
  template: `
    <div class="space-y-4">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="search" type="text" placeholder="Search vendors…"
               class="flex-1 min-w-[200px] px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none" />
        <select v-model="filterStatus" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">All Status</option>
          <option v-for="s in store.data.enums.vendorStatus" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="filterCrit" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">All Criticality</option>
          <option v-for="c in store.data.enums.vendorCriticality" :key="c" :value="c">{{ c }}</option>
        </select>
        <button @click="showForm = true"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors whitespace-nowrap">
          + Add Vendor
        </button>
      </div>

      <!-- Count -->
      <div class="text-xs text-gray-500">{{ filtered.length }} of {{ store.totalVendors }} vendors</div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-200 bg-surface-50">
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" @click="toggleSort('name')">Vendor {{ sortIcon('name') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Category</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" @click="toggleSort('criticality')">Criticality {{ sortIcon('criticality') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" @click="toggleSort('status')">Status {{ sortIcon('status') }}</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 hidden md:table-cell" @click="toggleSort('contractValue')">Contract Value {{ sortIcon('contractValue') }}</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Contract End</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Apps</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="v in filtered" :key="v.id"
                class="hover:bg-surface-50 cursor-pointer transition-colors"
                @click="navigateTo('/vendors/' + v.id)">
              <td class="px-4 py-3">
                <div class="font-medium text-gray-900">{{ v.name }}</div>
                <div class="text-xs text-gray-400">{{ v.id }}</div>
              </td>
              <td class="px-4 py-3 text-gray-600 hidden md:table-cell">{{ v.category }}</td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="critClass(v.criticality)">{{ v.criticality }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="statusClass(v.status)">{{ v.status }}</span>
              </td>
              <td class="px-4 py-3 text-right text-gray-700 font-mono hidden md:table-cell">{{ v.contractValue > 0 ? '€' + v.contractValue.toLocaleString() : '—' }}</td>
              <td class="px-4 py-3 text-gray-600 hidden lg:table-cell">{{ v.contractEnd || '—' }}</td>
              <td class="px-4 py-3 text-right text-gray-600 hidden lg:table-cell">{{ vendorAppCount(v.id) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Total -->
      <div class="flex justify-end text-sm text-gray-500">
        Total contract value: <strong class="ml-1 text-gray-800">€{{ totalContractValue.toLocaleString() }}</strong>
      </div>

      <!-- Vendor Form Modal -->
      <vendor-form v-if="showForm" @close="showForm = false" @saved="onSaved"></vendor-form>
    </div>
  `,
  setup () {
    const { ref, computed } = Vue
    const search = ref('')
    const filterStatus = ref('')
    const filterCrit = ref('')
    const sortBy = ref('name')
    const sortDir = ref(1)
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
      let list = [...(store.data.vendors || [])]
      const q = search.value.toLowerCase()
      if (q) list = list.filter(v => v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q) || (v.contactPerson || '').toLowerCase().includes(q))
      if (filterStatus.value) list = list.filter(v => v.status === filterStatus.value)
      if (filterCrit.value) list = list.filter(v => v.criticality === filterCrit.value)
      list.sort((a, b) => {
        const av = a[sortBy.value], bv = b[sortBy.value]
        if (typeof av === 'number') return (av - bv) * sortDir.value
        return String(av || '').localeCompare(String(bv || '')) * sortDir.value
      })
      return list
    })

    const totalContractValue = computed(() => filtered.value.reduce((s, v) => s + (v.contractValue || 0), 0))

    function vendorAppCount (vendorId) {
      return store.appsForVendor(vendorId).length
    }

    function critClass (c) {
      return { Strategic: 'bg-red-100 text-red-700', Important: 'bg-orange-100 text-orange-700', Standard: 'bg-yellow-100 text-yellow-700', Commodity: 'bg-gray-100 text-gray-600' }[c] || 'bg-gray-100 text-gray-600'
    }
    function statusClass (s) {
      return { Active: 'bg-green-100 text-green-700', 'Under Review': 'bg-yellow-100 text-yellow-700', 'Phase-Out': 'bg-red-100 text-red-700', New: 'bg-blue-100 text-blue-700' }[s] || 'bg-gray-100 text-gray-600'
    }

    function onSaved () { showForm.value = false }

    return { store, linkTo, navigateTo, search, filterStatus, filterCrit, sortBy, sortDir, filtered, totalContractValue, vendorAppCount, toggleSort, sortIcon, critClass, statusClass, showForm, onSaved }
  }
}
