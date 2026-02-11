// data-quality.js — Data Quality Dashboard: incomplete records, unmapped capabilities, orphaned entities
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'DataQuality',
  template: `
    <div class="space-y-6">

      <!-- Overall Score -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Quality Score</div>
          <div class="mt-1 text-2xl font-bold" :class="scoreColor(overallScore)">{{ overallScore }}%</div>
          <div class="text-xs text-gray-400 mt-1">Overall completeness</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Incomplete Apps</div>
          <div class="mt-1 text-2xl font-bold" :class="incompleteApps.length ? 'text-orange-600' : 'text-green-600'">{{ incompleteApps.length }}</div>
          <div class="text-xs text-gray-400 mt-1">Missing key fields</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Unmapped Caps</div>
          <div class="mt-1 text-2xl font-bold" :class="unmappedCapabilities.length ? 'text-orange-600' : 'text-green-600'">{{ unmappedCapabilities.length }}</div>
          <div class="text-xs text-gray-400 mt-1">Weiße Flecken</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Orphaned Vendors</div>
          <div class="mt-1 text-2xl font-bold" :class="orphanedVendors.length ? 'text-orange-600' : 'text-green-600'">{{ orphanedVendors.length }}</div>
          <div class="text-xs text-gray-400 mt-1">No linked apps</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Orphaned Mappings</div>
          <div class="mt-1 text-2xl font-bold" :class="orphanedMappings.length ? 'text-red-600' : 'text-green-600'">{{ orphanedMappings.length }}</div>
          <div class="text-xs text-gray-400 mt-1">Invalid references</div>
        </div>
      </div>

      <!-- Data Quality by Category -->
      <div class="bg-white rounded-xl border border-surface-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Datenqualität nach Kategorie</h2>
        <div class="space-y-3">
          <div v-for="cat in categories" :key="cat.label" class="flex items-center gap-4">
            <div class="w-40 text-sm font-medium text-gray-700 shrink-0">{{ cat.label }}</div>
            <div class="flex-1 bg-surface-100 rounded-full h-6 relative overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500"
                   :class="cat.pct >= 80 ? 'bg-green-500' : cat.pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'"
                   :style="{ width: cat.pct + '%' }"></div>
              <div class="absolute inset-0 flex items-center justify-center text-xs font-semibold"
                   :class="cat.pct > 40 ? 'text-white' : 'text-gray-700'">
                {{ cat.pct }}% ({{ cat.complete }}/{{ cat.total }})
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Incomplete Applications -->
      <div class="bg-white rounded-xl border border-surface-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Unvollständige Applikationen</h2>
        <p class="text-sm text-gray-500 mb-4">Apps ohne Kosten, ohne Vendor, ohne TIME-Quadrant oder ohne Criticality.</p>
        <div v-if="incompleteApps.length === 0" class="text-sm text-gray-500 italic">Alle Applikationen sind vollständig ✓</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-surface-200">
                <th class="py-2 pr-4">Application</th>
                <th class="py-2 pr-4">Missing Fields</th>
                <th class="py-2 pr-4 text-center">Completeness</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in incompleteApps" :key="item.app.id" class="border-b border-surface-100 hover:bg-surface-50">
                <td class="py-2 pr-4">
                  <a :href="linkTo('/apps/' + item.app.id)" class="text-primary-600 hover:underline font-medium">{{ item.app.name }}</a>
                </td>
                <td class="py-2 pr-4">
                  <span v-for="f in item.missing" :key="f"
                        class="inline-block text-xs px-2 py-0.5 mr-1 mb-1 rounded bg-orange-100 text-orange-700">
                    {{ f }}
                  </span>
                </td>
                <td class="py-2 pr-4 text-center">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                        :class="item.pct >= 80 ? 'bg-green-100 text-green-700' : item.pct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'">
                    {{ item.pct }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Unmapped Capabilities (White Spots) -->
      <div class="bg-white rounded-xl border border-surface-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Capabilities ohne App-Mapping — „Weiße Flecken"</h2>
        <p class="text-sm text-gray-500 mb-4">Capabilities, denen keine Applikation zugeordnet ist.</p>
        <div v-if="unmappedCapabilities.length === 0" class="text-sm text-gray-500 italic">Alle Capabilities sind zugeordnet ✓</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="cap in unmappedCapabilities" :key="cap.id"
               class="p-3 rounded-lg border border-yellow-200 bg-yellow-50">
            <div class="flex items-center gap-2 mb-1">
              <span class="domain-swatch" :style="{ backgroundColor: cap.domainColor }"></span>
              <span class="text-xs text-gray-500">{{ cap.domainName }}</span>
            </div>
            <div class="text-sm font-medium text-gray-900">{{ cap.name }}</div>
            <div class="text-xs text-gray-500 mt-1">Maturity: {{ cap.maturity }}/5 · Criticality: {{ cap.criticality || '–' }}</div>
          </div>
        </div>
      </div>

      <!-- Orphaned Vendors -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl border border-surface-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Vendors ohne verknüpfte Apps</h2>
          <div v-if="orphanedVendors.length === 0" class="text-sm text-gray-500 italic">Alle Vendors haben zugeordnete Apps ✓</div>
          <div v-else class="space-y-2">
            <a v-for="v in orphanedVendors" :key="v.id"
               :href="linkTo('/vendors/' + v.id)"
               class="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ v.name }}</div>
                <div class="text-xs text-gray-500">{{ v.category }} · {{ v.status }}</div>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-full bg-orange-200 text-orange-800">0 Apps</span>
            </a>
          </div>
        </div>

        <!-- Orphaned Mappings -->
        <div class="bg-white rounded-xl border border-surface-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Orphaned Mappings</h2>
          <p class="text-sm text-gray-500 mb-4">Referenzen auf nicht existierende Apps oder Capabilities.</p>
          <div v-if="orphanedMappings.length === 0" class="text-sm text-gray-500 italic">Keine verwaisten Mappings gefunden ✓</div>
          <div v-else class="space-y-2">
            <div v-for="(om, idx) in orphanedMappings" :key="idx"
                 class="p-3 rounded-lg border border-red-200 bg-red-50 text-sm">
              <span class="font-medium text-red-700">{{ om.type }}:</span>
              <span class="text-gray-700">{{ om.detail }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup () {
    const { computed } = Vue

    const apps = computed(() => store.data.applications || [])
    const vendors = computed(() => store.data.vendors || [])
    const mappings = computed(() => store.data.capabilityMappings || [])
    const projects = computed(() => store.data.projects || [])
    const domains = computed(() => store.data.domains || [])

    // All capabilities flat list
    const allCapabilities = computed(() => {
      const caps = []
      domains.value.forEach(d => {
        d.capabilities.forEach(c => {
          caps.push({ ...c, domainName: d.name, domainColor: d.color, domainId: d.id })
        })
      })
      return caps
    })

    // App completeness check
    const requiredAppFields = ['vendor', 'costPerYear', 'timeQuadrant', 'criticality', 'type', 'businessOwner']

    const appCompleteness = computed(() => {
      return apps.value.map(app => {
        const missing = requiredAppFields.filter(f => !app[f] && app[f] !== 0)
        const pct = Math.round(((requiredAppFields.length - missing.length) / requiredAppFields.length) * 100)
        return { app, missing, pct }
      })
    })

    const incompleteApps = computed(() =>
      appCompleteness.value.filter(a => a.missing.length > 0).sort((a, b) => a.pct - b.pct)
    )

    // Unmapped capabilities (white spots)
    const unmappedCapabilities = computed(() => {
      const mappedCapIds = new Set(mappings.value.map(m => m.capabilityId))
      return allCapabilities.value.filter(c => !mappedCapIds.has(c.id))
    })

    // Orphaned vendors (no linked apps)
    const orphanedVendors = computed(() => {
      const vendorNames = new Set(apps.value.map(a => a.vendor).filter(Boolean))
      const vendorIds = new Set(apps.value.map(a => a.vendorId).filter(Boolean))
      return vendors.value.filter(v => !vendorNames.has(v.name) && !vendorIds.has(v.id))
    })

    // Orphaned mappings (referencing non-existent apps or capabilities)
    const orphanedMappings = computed(() => {
      const appIds = new Set(apps.value.map(a => a.id))
      const capIds = new Set(allCapabilities.value.map(c => c.id))
      const orphans = []
      mappings.value.forEach(m => {
        if (!appIds.has(m.applicationId)) {
          orphans.push({ type: 'Missing App', detail: `Mapping referenziert App "${m.applicationId}" (Cap: ${m.capabilityId})` })
        }
        if (!capIds.has(m.capabilityId)) {
          orphans.push({ type: 'Missing Capability', detail: `Mapping referenziert Capability "${m.capabilityId}" (App: ${m.applicationId})` })
        }
      })
      return orphans
    })

    // Category-level quality scores
    const categories = computed(() => {
      const appComplete = appCompleteness.value.filter(a => a.pct === 100).length
      const capMapped = allCapabilities.value.length - unmappedCapabilities.value.length
      const vendorLinked = vendors.value.length - orphanedVendors.value.length
      const mappingValid = mappings.value.length - orphanedMappings.value.length

      // Projects completeness
      const projFields = ['name', 'primaryDomain', 'budget', 'start', 'end', 'status', 'projectLead']
      let projComplete = 0
      projects.value.forEach(p => {
        const missing = projFields.filter(f => !p[f] && p[f] !== 0)
        if (missing.length === 0) projComplete++
      })

      return [
        { label: 'Applications', complete: appComplete, total: apps.value.length, pct: apps.value.length ? Math.round((appComplete / apps.value.length) * 100) : 100 },
        { label: 'Capability Mapping', complete: capMapped, total: allCapabilities.value.length, pct: allCapabilities.value.length ? Math.round((capMapped / allCapabilities.value.length) * 100) : 100 },
        { label: 'Vendors', complete: vendorLinked, total: vendors.value.length, pct: vendors.value.length ? Math.round((vendorLinked / vendors.value.length) * 100) : 100 },
        { label: 'Mapping Integrity', complete: mappingValid, total: mappings.value.length, pct: mappings.value.length ? Math.round((mappingValid / mappings.value.length) * 100) : 100 },
        { label: 'Projects', complete: projComplete, total: projects.value.length, pct: projects.value.length ? Math.round((projComplete / projects.value.length) * 100) : 100 }
      ]
    })

    // Overall score
    const overallScore = computed(() => {
      const cats = categories.value
      if (cats.length === 0) return 100
      return Math.round(cats.reduce((s, c) => s + c.pct, 0) / cats.length)
    })

    function scoreColor (pct) {
      if (pct >= 80) return 'text-green-600'
      if (pct >= 50) return 'text-yellow-600'
      return 'text-red-600'
    }

    return {
      store, linkTo,
      incompleteApps, unmappedCapabilities, orphanedVendors, orphanedMappings,
      categories, overallScore, scoreColor
    }
  }
}
