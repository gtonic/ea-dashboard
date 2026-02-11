// entity-detail.js — Legal entity detail view with assigned applications
import { store } from '../store.js'
import { router, linkTo, navigateTo } from '../router.js'

export default {
  name: 'EntityDetail',
  template: `
    <div v-if="entity" class="space-y-6">
      <!-- Back link -->
      <a :href="linkTo('/entities')" class="text-sm text-gray-500 hover:text-primary-600">← Entitäten</a>

      <!-- Header -->
      <div class="bg-white rounded-xl border border-surface-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <span class="text-2xl">{{ countryFlag(entity.country) }}</span>
              <h2 class="text-xl font-bold text-gray-900">{{ entity.name }}</h2>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="regionClass(entity.region)">{{ entity.region }}</span>
            </div>
            <div class="text-sm text-gray-500">{{ entity.id }} · {{ entity.city }}, {{ entity.country }}</div>
            <p class="text-sm text-gray-600 mt-3 max-w-2xl">{{ entity.description }}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button @click="showEdit = true" class="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-surface-100">Bearbeiten</button>
            <button @click="confirmDelete" class="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs hover:bg-red-50">Löschen</button>
          </div>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-surface-100">
          <div>
            <div class="text-xs text-gray-500">Applikationen</div>
            <div class="text-lg font-bold text-gray-800">{{ apps.length }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Mission-Critical</div>
            <div class="text-lg font-bold text-red-600">{{ critCount('Mission-Critical') }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Business-Critical</div>
            <div class="text-lg font-bold text-orange-600">{{ critCount('Business-Critical') }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Parent Entität</div>
            <div class="text-sm font-medium text-gray-800">
              <a v-if="entity.parentEntity" :href="linkTo('/entities/' + entity.parentEntity)" class="text-primary-600 hover:text-primary-700">{{ parentName }}</a>
              <span v-else class="text-gray-400">— (Konzernmutter)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TIME Distribution -->
      <div class="bg-white rounded-xl border border-surface-200 p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">TIME-Verteilung</h3>
        <div class="flex gap-2">
          <div v-for="(count, quad) in timeDistribution" :key="quad"
               class="flex-1 rounded-lg p-3 text-center"
               :class="timeClass(quad)">
            <div class="text-lg font-bold">{{ count }}</div>
            <div class="text-xs">{{ quad }}</div>
          </div>
        </div>
      </div>

      <!-- Child entities -->
      <div v-if="childEntities.length" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Tochtergesellschaften ({{ childEntities.length }})</h3>
        </div>
        <div class="divide-y divide-surface-100">
          <a v-for="child in childEntities" :key="child.id" :href="linkTo('/entities/' + child.id)"
             class="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
            <div class="flex items-center gap-3">
              <span>{{ countryFlag(child.country) }}</span>
              <span class="text-sm text-gray-800 font-medium">{{ child.shortName }}</span>
              <span class="text-xs text-gray-400">{{ child.city }}, {{ child.country }}</span>
            </div>
            <span class="text-sm font-mono text-gray-600">{{ store.appsForEntity(child.id).length }} Apps</span>
          </a>
        </div>
      </div>

      <!-- Assigned Applications -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-700">Applikationen ({{ apps.length }})</h3>
          <input v-model="appSearch" type="text" placeholder="App filtern…"
                 class="px-2 py-1 border border-surface-200 rounded text-xs w-48 focus:ring-1 focus:ring-primary-300 outline-none" />
        </div>
        <div v-if="filteredApps.length === 0" class="px-5 py-4 text-sm text-gray-400 italic">Keine Applikationen zugeordnet.</div>
        <div v-else class="divide-y divide-surface-100">
          <a v-for="app in filteredApps" :key="app.id" :href="linkTo('/apps/' + app.id)"
             class="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono text-gray-400">{{ app.id }}</span>
              <span class="text-sm text-gray-800 font-medium">{{ app.name }}</span>
              <span class="text-[10px] text-gray-400">{{ app.category }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-0.5 rounded-full" :class="critAppClass(app.criticality)">{{ app.criticality }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="timeAppClass(app.timeQuadrant)">{{ app.timeQuadrant }}</span>
            </div>
          </a>
        </div>
      </div>

      <!-- Edit Modal -->
      <entity-form v-if="showEdit" :edit-entity="entity" @close="showEdit = false" @saved="showEdit = false"></entity-form>
    </div>
    <div v-else class="text-center py-12 text-gray-500">Entität nicht gefunden.</div>
  `,
  setup () {
    const { ref, computed } = Vue
    const appSearch = ref('')
    const showEdit = ref(false)

    const entity = computed(() => store.entityById(router.params.id))

    const apps = computed(() => {
      if (!entity.value) return []
      return store.appsForEntity(entity.value.id)
    })

    const filteredApps = computed(() => {
      const q = appSearch.value.toLowerCase()
      if (!q) return apps.value
      return apps.value.filter(a => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
    })

    const parentName = computed(() => {
      if (!entity.value || !entity.value.parentEntity) return ''
      const p = store.entityById(entity.value.parentEntity)
      return p ? p.shortName : entity.value.parentEntity
    })

    const childEntities = computed(() => {
      if (!entity.value) return []
      return (store.data.legalEntities || []).filter(e => e.parentEntity === entity.value.id)
    })

    const timeDistribution = computed(() => {
      const dist = { Invest: 0, Tolerate: 0, Migrate: 0, Eliminate: 0 }
      apps.value.forEach(a => { if (dist[a.timeQuadrant] !== undefined) dist[a.timeQuadrant]++ })
      return dist
    })

    function critCount (crit) {
      return apps.value.filter(a => a.criticality === crit).length
    }

    const flagMap = { AT: '🇦🇹', CH: '🇨🇭', DE: '🇩🇪', US: '🇺🇸', CA: '🇨🇦', IT: '🇮🇹', FR: '🇫🇷', GB: '🇬🇧' }
    function countryFlag (code) { return flagMap[code] || '🏳️' }

    function regionClass (region) {
      return { 'Headquarters': 'bg-purple-100 text-purple-700', 'DACH': 'bg-blue-100 text-blue-700', 'Americas': 'bg-green-100 text-green-700', 'EMEA': 'bg-amber-100 text-amber-700' }[region] || 'bg-gray-100 text-gray-600'
    }

    function timeClass (quad) {
      return { Invest: 'bg-green-50 text-green-700', Tolerate: 'bg-yellow-50 text-yellow-700', Migrate: 'bg-blue-50 text-blue-700', Eliminate: 'bg-red-50 text-red-700' }[quad] || ''
    }
    function timeAppClass (t) {
      return { Invest: 'bg-green-100 text-green-700', Tolerate: 'bg-yellow-100 text-yellow-700', Migrate: 'bg-blue-100 text-blue-700', Eliminate: 'bg-red-100 text-red-700' }[t] || ''
    }
    function critAppClass (c) {
      return { 'Mission-Critical': 'bg-red-100 text-red-700', 'Business-Critical': 'bg-orange-100 text-orange-700', 'Business-Operational': 'bg-yellow-100 text-yellow-700', 'Administrative': 'bg-gray-100 text-gray-600' }[c] || 'bg-gray-100 text-gray-600'
    }

    function confirmDelete () {
      if (entity.value && confirm('„' + entity.value.name + '" löschen? Dies kann nicht rückgängig gemacht werden.')) {
        store.deleteEntity(entity.value.id)
        navigateTo('/entities')
      }
    }

    return { store, linkTo, navigateTo, entity, apps, filteredApps, appSearch, parentName, childEntities, timeDistribution, critCount, countryFlag, regionClass, timeClass, timeAppClass, critAppClass, showEdit, confirmDelete }
  }
}
