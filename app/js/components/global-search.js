// global-search.js — Global full-text search across all entities
import { store } from '../store.js'
import { router, navigateTo } from '../router.js'

export default {
  name: 'GlobalSearch',
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Search Input -->
      <div class="mb-6">
        <div class="relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input ref="searchInput" v-model="query" type="text"
                 placeholder="Search across all entities…"
                 class="w-full pl-12 pr-4 py-3 text-lg border border-surface-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                 @input="onSearch" />
          <button v-if="query" @click="clearSearch"
                  class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-surface-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Initial hint (no query) -->
      <div v-if="!query" class="text-center py-12 text-gray-400">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <p class="text-lg">Search across Applications, Domains, Projects, Vendors, Processes and Demands</p>
        <p class="text-sm mt-1">e.g. "SAP", "Cloud", "Migration"</p>
      </div>

      <!-- Results summary -->
      <div v-else-if="results.length > 0" class="mb-4 text-sm text-gray-500">
        {{ results.length }} result{{ results.length === 1 ? '' : 's' }} for "<span class="font-medium text-gray-700">{{ query }}</span>"
      </div>

      <!-- No results -->
      <div v-else-if="query.length > 0" class="text-center py-12 text-gray-400">
        <p class="text-lg">No results found for "{{ query }}"</p>
        <p class="text-sm mt-1">Try a different search term</p>
      </div>

      <!-- Grouped Results -->
      <div v-if="results.length > 0" class="space-y-2">
        <template v-for="group in groupedResults" :key="group.type">
          <div class="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1 pt-3 pb-1">
            {{ group.type }} ({{ group.items.length }})
          </div>
          <a v-for="item in group.items" :key="item.type + '-' + item.id"
             :href="'#' + item.route"
             class="flex items-center gap-4 px-4 py-3 bg-white rounded-lg border border-surface-200 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group">
            <span class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  :class="typeColor(item.type)">
              {{ typeIcon(item.type) }}
            </span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 group-hover:text-primary-600 truncate">{{ item.name }}</div>
              <div class="text-xs text-gray-500 truncate">{{ item.detail }}</div>
            </div>
            <span class="text-xs text-gray-400 shrink-0">{{ item.id }}</span>
            <svg class="w-4 h-4 text-gray-300 group-hover:text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </template>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed } = Vue

    const query = ref(router.query.q || '')
    const results = ref([])

    function onSearch () {
      results.value = store.globalSearch(query.value)
    }

    function clearSearch () {
      query.value = ''
      results.value = []
    }

    const groupedResults = computed(() => {
      const groups = {}
      results.value.forEach(r => {
        if (!groups[r.type]) groups[r.type] = { type: r.type, items: [] }
        groups[r.type].items.push(r)
      })
      return Object.values(groups)
    })

    function typeColor (type) {
      const map = {
        Application: 'bg-blue-100 text-blue-700',
        Domain: 'bg-purple-100 text-purple-700',
        Capability: 'bg-indigo-100 text-indigo-700',
        Project: 'bg-green-100 text-green-700',
        Vendor: 'bg-orange-100 text-orange-700',
        Process: 'bg-yellow-100 text-yellow-700',
        Demand: 'bg-pink-100 text-pink-700'
      }
      return map[type] || 'bg-gray-100 text-gray-700'
    }

    function typeIcon (type) {
      const map = {
        Application: 'A',
        Domain: 'D',
        Capability: 'C',
        Project: 'P',
        Vendor: 'V',
        Process: 'E',
        Demand: 'R'
      }
      return map[type] || '?'
    }

    // Run search if query param was present
    if (query.value) onSearch()

    return { query, results, groupedResults, onSearch, clearSearch, typeColor, typeIcon }
  }
}
