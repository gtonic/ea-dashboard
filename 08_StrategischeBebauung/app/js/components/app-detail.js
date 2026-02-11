// app-detail.js — Application detail view with capabilities, projects, edit/delete
import { store } from '../store.js'
import { router, linkTo, navigateTo } from '../router.js'

export default {
  name: 'AppDetail',
  template: `
    <div v-if="app" class="space-y-6">
      <!-- Back link -->
      <a :href="linkTo('/apps')" class="text-sm text-gray-500 hover:text-primary-600">← Applications</a>

      <!-- Header -->
      <div class="bg-white rounded-xl border border-surface-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h2 class="text-xl font-bold text-gray-900">{{ app.name }}</h2>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="timeClass(app.timeQuadrant)">{{ app.timeQuadrant }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="critClass(app.criticality)">{{ app.criticality }}</span>
            </div>
            <div class="text-sm text-gray-500">{{ primaryVendorName }} · {{ app.category }} · {{ app.type }}</div>
            <p class="text-sm text-gray-600 mt-3 max-w-2xl">{{ app.description }}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button @click="showEdit = true" class="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-surface-100">Edit</button>
            <button @click="confirmDelete" class="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs hover:bg-red-50">Delete</button>
          </div>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-4 border-t border-surface-100">
          <div>
            <div class="text-xs text-gray-500">Cost / Year</div>
            <div class="text-lg font-bold text-gray-800">{{ app.costPerYear > 0 ? '€' + app.costPerYear.toLocaleString() : '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Users</div>
            <div class="text-lg font-bold text-gray-800">{{ app.userCount }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Go-Live</div>
            <div class="text-lg font-bold text-gray-800">{{ app.goLiveDate || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Business Value</div>
            <div class="text-lg font-bold" :class="app.scores?.businessValue >= 7 ? 'text-green-600' : 'text-gray-800'">{{ app.scores?.businessValue || '—' }}/10</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Technical Health</div>
            <div class="text-lg font-bold" :class="app.scores?.technicalHealth >= 7 ? 'text-green-600' : app.scores?.technicalHealth <= 3 ? 'text-red-600' : 'text-gray-800'">{{ app.scores?.technicalHealth || '—' }}/10</div>
          </div>
        </div>

        <!-- Owners -->
        <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-surface-100">
          <div>
            <div class="text-xs text-gray-500">Business Owner</div>
            <div class="text-sm text-gray-800">{{ app.businessOwner || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">IT Owner</div>
            <div class="text-sm text-gray-800">{{ app.itOwner || '—' }}</div>
          </div>
        </div>
      </div>

      <!-- Vendors -->
      <div v-if="appVendors.length" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Vendors ({{ appVendors.length }})</h3>
        </div>
        <div class="divide-y divide-surface-100">
          <a v-for="v in appVendors" :key="v.vendorId || v.vendorName"
             :href="v.vendorRecord ? linkTo('/vendors/' + v.vendorRecord.id) : '#'"
             class="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono text-gray-400">{{ v.vendorId }}</span>
              <span class="text-sm text-gray-800 font-medium">{{ v.vendorName }}</span>
              <span v-if="v.vendorRecord && v.vendorRecord.vendorType" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{{ vendorTypeLabel(v.vendorRecord.vendorType) }}</span>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full" :class="vendorRoleClass(v.role)">{{ v.role }}</span>
          </a>
        </div>
      </div>

      <!-- Entities -->
      <div v-if="appEntities.length" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Entitäten / Firmen ({{ appEntities.length }})</h3>
        </div>
        <div class="divide-y divide-surface-100">
          <a v-for="ent in appEntities" :key="ent.id" :href="linkTo('/entities/' + ent.id)"
             class="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
            <div class="flex items-center gap-3">
              <span class="text-lg">{{ entityFlag(ent.country) }}</span>
              <span class="text-sm text-gray-800 font-medium">{{ ent.shortName }}</span>
              <span class="text-xs text-gray-400">{{ ent.city }}, {{ ent.country }}</span>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full" :class="entityRegionClass(ent.region)">{{ ent.region }}</span>
          </a>
        </div>
      </div>

      <!-- Capability Mappings -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Mapped Capabilities ({{ mappedCaps.length }})</h3>
        </div>
        <div v-if="mappedCaps.length === 0" class="px-5 py-4 text-sm text-gray-400 italic">No capability mappings yet.</div>
        <div v-else class="divide-y divide-surface-100">
          <div v-for="cap in mappedCaps" :key="cap.id" class="flex items-center justify-between px-5 py-3">
            <div class="flex items-center gap-3">
              <span class="domain-swatch" :style="{ backgroundColor: cap.domain?.color || '#94a3b8' }"></span>
              <span class="text-xs font-mono text-gray-500">{{ cap.id }}</span>
              <span class="text-sm text-gray-800">{{ cap.name }}</span>
              <span class="text-[10px] text-gray-400">({{ cap.domain?.name }})</span>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full"
                  :class="cap.role === 'Primary' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'">
              {{ cap.role }}
            </span>
          </div>
        </div>
      </div>

      <!-- Related Projects -->
      <div v-if="relatedProjects.length" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Related Projects</h3>
        </div>
        <div class="divide-y divide-surface-100">
          <a v-for="p in relatedProjects" :key="p.id" :href="linkTo('/projects/' + p.id)"
             class="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
            <div class="flex items-center gap-3">
              <span class="w-2 h-2 rounded-full" :class="statusDot(p.status)"></span>
              <span class="text-sm text-gray-800">{{ p.name }}</span>
              <span class="text-xs text-gray-400">({{ p.action }})</span>
            </div>
            <span class="text-xs text-gray-400">€{{ (p.budget / 1000).toFixed(0) }}k</span>
          </a>
        </div>
      </div>

      <!-- E2E Processes -->
      <div v-if="relatedProcesses.length" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">E2E Prozesse ({{ relatedProcesses.length }})</h3>
        </div>
        <div class="divide-y divide-surface-100">
          <a v-for="proc in relatedProcesses" :key="proc.id" :href="linkTo('/processes/' + proc.id)"
             class="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono text-gray-400">{{ proc.id }}</span>
              <span class="text-sm text-gray-800">{{ proc.name }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full" :class="procStatusClass(proc.status)">{{ proc.status }}</span>
            </div>
            <div class="flex gap-1">
              <span v-for="did in proc.domains" :key="did"
                    class="w-4 h-4 rounded text-[8px] text-white font-bold flex items-center justify-center"
                    :style="{ backgroundColor: domainColor(did) }">{{ did }}</span>
            </div>
          </a>
        </div>
      </div>

      <!-- Edit Modal -->
      <app-form v-if="showEdit" :edit-app="app" @close="showEdit = false" @saved="showEdit = false"></app-form>
    </div>
    <div v-else class="text-center py-12 text-gray-500">Application not found.</div>
  `,
  setup () {
    const { ref, computed } = Vue
    const showEdit = ref(false)

    const app = computed(() => store.appById(router.params.id))

    const mappedCaps = computed(() => {
      if (!app.value) return []
      return store.capabilitiesForApp(app.value.id)
    })

    const relatedProjects = computed(() => {
      if (!app.value) return []
      return store.data.projects
        .filter(p => p.affectedApps && p.affectedApps.some(a => a.appId === app.value.id))
        .map(p => {
          const affected = p.affectedApps.find(a => a.appId === app.value.id)
          return { ...p, action: affected?.action || '' }
        })
    })

    const relatedProcesses = computed(() => {
      if (!app.value) return []
      return store.processesForApp(app.value.id)
    })

    const appVendors = computed(() => {
      if (!app.value) return []
      return store.vendorsForApp(app.value.id)
    })

    const appEntities = computed(() => {
      if (!app.value) return []
      return store.entitiesForApp(app.value.id)
    })

    const flagMap = { AT: '🇦🇹', CH: '🇨🇭', DE: '🇩🇪', US: '🇺🇸', CA: '🇨🇦', IT: '🇮🇹', FR: '🇫🇷', GB: '🇬🇧' }
    function entityFlag (code) { return flagMap[code] || '🏳️' }
    function entityRegionClass (region) {
      return { 'Headquarters': 'bg-purple-100 text-purple-700', 'DACH': 'bg-blue-100 text-blue-700', 'Americas': 'bg-green-100 text-green-700', 'EMEA': 'bg-amber-100 text-amber-700' }[region] || 'bg-gray-100 text-gray-600'
    }

    const primaryVendorName = computed(() => {
      if (!app.value) return ''
      const primary = appVendors.value.find(v => v.role === 'Hersteller') || appVendors.value[0]
      return primary?.vendorName || app.value.vendor || '—'
    })

    function vendorRoleClass (role) {
      return {
        'Hersteller': 'bg-blue-100 text-blue-700',
        'Entwicklungspartner': 'bg-purple-100 text-purple-700',
        'Implementierungspartner': 'bg-cyan-100 text-cyan-700',
        'Betriebspartner': 'bg-amber-100 text-amber-700',
        'Berater': 'bg-indigo-100 text-indigo-700'
      }[role] || 'bg-gray-100 text-gray-600'
    }

    function vendorTypeLabel (val) {
      const types = (store.data.enums && store.data.enums.vendorType) || []
      const t = types.find(e => e.value === val)
      return t ? t.label : val
    }

    function timeClass (t) {
      return { Invest: 'bg-green-100 text-green-700', Tolerate: 'bg-yellow-100 text-yellow-700', Migrate: 'bg-blue-100 text-blue-700', Eliminate: 'bg-red-100 text-red-700' }[t] || ''
    }
    function critClass (c) {
      return { 'Mission-Critical': 'bg-red-100 text-red-700', 'Business-Critical': 'bg-orange-100 text-orange-700', 'Business-Operational': 'bg-yellow-100 text-yellow-700', 'Administrative': 'bg-gray-100 text-gray-600' }[c] || ''
    }
    function statusDot (s) {
      return { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500' }[s] || 'bg-gray-400'
    }
    function procStatusClass (s) {
      return { active: 'bg-green-100 text-green-700', optimization: 'bg-blue-100 text-blue-700', transformation: 'bg-purple-100 text-purple-700' }[s] || 'bg-gray-100 text-gray-600'
    }
    function domainColor (id) {
      const d = store.domainById(id)
      return d ? d.color : '#94a3b8'
    }

    function confirmDelete () {
      if (app.value && confirm('Delete "' + app.value.name + '"? This cannot be undone.')) {
        store.deleteApp(app.value.id)
        navigateTo('/apps')
      }
    }

    return { store, router, linkTo, navigateTo, app, mappedCaps, relatedProjects, relatedProcesses, appVendors, appEntities, primaryVendorName, showEdit, timeClass, critClass, statusDot, procStatusClass, domainColor, confirmDelete, vendorRoleClass, vendorTypeLabel, entityFlag, entityRegionClass }
  }
}
