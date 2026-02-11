// vendor-detail.js — Vendor detail view with related applications, contracts, edit/delete
import { store } from '../store.js'
import { router, linkTo, navigateTo } from '../router.js'

export default {
  name: 'VendorDetail',
  template: `
    <div v-if="vendor" class="space-y-6">
      <!-- Back link -->
      <a :href="linkTo('/vendors')" class="text-sm text-gray-500 hover:text-primary-600">← Vendors</a>

      <!-- Header -->
      <div class="bg-white rounded-xl border border-surface-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h2 class="text-xl font-bold text-gray-900">{{ vendor.name }}</h2>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="statusClass(vendor.status)">{{ vendor.status }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="critClass(vendor.criticality)">{{ vendor.criticality }}</span>
            </div>
            <div class="text-sm text-gray-500">{{ vendor.id }} · {{ vendor.category }}</div>
            <div v-if="vendor.vendorType" class="mt-1">
              <span class="text-xs px-2 py-0.5 rounded-full" :class="vendorTypeClass(vendor.vendorType)">{{ vendorTypeLabel(vendor.vendorType) }}</span>
            </div>
            <p class="text-sm text-gray-600 mt-3 max-w-2xl">{{ vendor.description }}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button @click="showEdit = true" class="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-surface-100">Edit</button>
            <button @click="confirmDelete" class="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs hover:bg-red-50">Delete</button>
          </div>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-surface-100">
          <div>
            <div class="text-xs text-gray-500">Contract Value / Year</div>
            <div class="text-lg font-bold text-gray-800">{{ vendor.contractValue > 0 ? '€' + vendor.contractValue.toLocaleString() : '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Contract End</div>
            <div class="text-lg font-bold text-gray-800">{{ vendor.contractEnd || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Service Level</div>
            <div class="text-lg font-bold text-gray-800">{{ vendor.serviceLevel || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Applications</div>
            <div class="text-lg font-bold text-primary-600">{{ relatedApps.length }}</div>
          </div>
        </div>

        <!-- Contact & Manager -->
        <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-surface-100">
          <div>
            <div class="text-xs text-gray-500">Contact Person</div>
            <div class="text-sm text-gray-800">{{ vendor.contactPerson || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Vendor Manager</div>
            <div class="text-sm text-gray-800">{{ vendor.vendorManager || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Website</div>
            <div class="text-sm text-gray-800">{{ vendor.website || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Rating</div>
            <div class="text-lg font-bold" :class="vendor.rating >= 7 ? 'text-green-600' : vendor.rating <= 3 ? 'text-red-600' : 'text-gray-800'">{{ vendor.rating || '—' }}/10</div>
          </div>
        </div>
      </div>

      <!-- Related Applications -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Applications from this Vendor ({{ relatedApps.length }})</h3>
        </div>
        <div v-if="relatedApps.length === 0" class="px-5 py-4 text-sm text-gray-400 italic">No applications linked to this vendor.</div>
        <div v-else class="divide-y divide-surface-100">
          <a v-for="app in relatedApps" :key="app.id" :href="linkTo('/apps/' + app.id)"
             class="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono text-gray-400">{{ app.id }}</span>
              <span class="text-sm text-gray-800">{{ app.name }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="timeClass(app.timeQuadrant)">{{ app.timeQuadrant }}</span>
              <span v-if="vendorRole(app)" class="text-xs px-2 py-0.5 rounded-full" :class="vendorRoleClass(vendorRole(app))">{{ vendorRole(app) }}</span>
            </div>
            <span class="text-xs text-gray-400">€{{ (app.costPerYear || 0).toLocaleString() }}/yr</span>
          </a>
        </div>
      </div>

      <!-- Edit Modal -->
      <vendor-form v-if="showEdit" :edit-vendor="vendor" @close="showEdit = false" @saved="showEdit = false"></vendor-form>
    </div>
    <div v-else class="text-center py-12 text-gray-500">Vendor not found.</div>
  `,
  setup () {
    const { ref, computed } = Vue
    const showEdit = ref(false)

    const vendor = computed(() => store.vendorById(router.params.id))

    const relatedApps = computed(() => {
      if (!vendor.value) return []
      return store.appsForVendor(vendor.value.id)
    })

    function statusClass (s) {
      return { Active: 'bg-green-100 text-green-700', 'Under Review': 'bg-yellow-100 text-yellow-700', 'Phase-Out': 'bg-red-100 text-red-700', New: 'bg-blue-100 text-blue-700' }[s] || 'bg-gray-100 text-gray-600'
    }
    function critClass (c) {
      return { Strategic: 'bg-red-100 text-red-700', Important: 'bg-orange-100 text-orange-700', Standard: 'bg-yellow-100 text-yellow-700', Commodity: 'bg-gray-100 text-gray-600' }[c] || 'bg-gray-100 text-gray-600'
    }
    function timeClass (t) {
      return { Invest: 'bg-green-100 text-green-700', Tolerate: 'bg-yellow-100 text-yellow-700', Migrate: 'bg-blue-100 text-blue-700', Eliminate: 'bg-red-100 text-red-700' }[t] || ''
    }

    function confirmDelete () {
      if (vendor.value && confirm('Delete "' + vendor.value.name + '"? This cannot be undone.')) {
        store.deleteVendor(vendor.value.id)
        navigateTo('/vendors')
      }
    }

    function vendorTypeLabel (val) {
      const types = (store.data.enums && store.data.enums.vendorType) || []
      const t = types.find(e => e.value === val)
      return t ? t.label : val
    }
    function vendorTypeClass (val) {
      return {
        MSP: 'bg-purple-100 text-purple-700',
        HYP: 'bg-blue-100 text-blue-700',
        INF: 'bg-slate-100 text-slate-700',
        MKT: 'bg-cyan-100 text-cyan-700',
        'SAAS-I': 'bg-amber-100 text-amber-700',
        'SAAS-S': 'bg-emerald-100 text-emerald-700',
        LIC: 'bg-orange-100 text-orange-700',
        PBR: 'bg-indigo-100 text-indigo-700'
      }[val] || 'bg-gray-100 text-gray-600'
    }

    function vendorRole (app) {
      if (!vendor.value) return null
      return store.vendorRoleForApp(vendor.value.id, app.id)
    }
    function vendorRoleClass (role) {
      return {
        'Hersteller': 'bg-blue-100 text-blue-700',
        'Entwicklungspartner': 'bg-purple-100 text-purple-700',
        'Implementierungspartner': 'bg-cyan-100 text-cyan-700',
        'Betriebspartner': 'bg-amber-100 text-amber-700',
        'Berater': 'bg-indigo-100 text-indigo-700'
      }[role] || 'bg-gray-100 text-gray-600'
    }

    return { store, router, linkTo, navigateTo, vendor, relatedApps, showEdit, statusClass, critClass, timeClass, confirmDelete, vendorTypeLabel, vendorTypeClass, vendorRole, vendorRoleClass }
  }
}
