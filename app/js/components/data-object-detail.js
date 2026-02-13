// data-object-detail.js — Detail view for a single data object
import { store } from '../store.js'
import { router, linkTo, navigateTo } from '../router.js'

export default {
  name: 'DataObjectDetail',
  template: `
    <div v-if="obj" class="space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-mono text-gray-400">{{ obj.id }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full" :class="classificationClass(obj.classification)">{{ classificationLabel(obj.classification) }}</span>
            <span v-if="obj.personalData" class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">DSGVO-relevant</span>
          </div>
          <h1 class="text-xl font-bold text-gray-900">{{ obj.name }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ obj.description }}</p>
        </div>
        <div class="flex gap-2">
          <button @click="editing = true" class="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Bearbeiten</button>
          <button @click="confirmDelete" class="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50">Löschen</button>
        </div>
      </div>

      <!-- Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs text-gray-400 mb-1">Data Owner</div>
          <div class="text-sm font-semibold text-gray-900">{{ obj.owner || '—' }}</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs text-gray-400 mb-1">Data Steward</div>
          <div class="text-sm font-semibold text-gray-900">{{ obj.steward || '—' }}</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs text-gray-400 mb-1">Qualitätsscore</div>
          <div class="text-sm font-semibold" :class="qualityColor(obj.qualityScore)">{{ obj.qualityScore || '—' }} / 5</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs text-gray-400 mb-1">Format</div>
          <div class="text-sm font-semibold text-gray-900">{{ formatLabel(obj.format) }}</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs text-gray-400 mb-1">Aufbewahrungsfrist</div>
          <div class="text-sm font-semibold text-gray-900">{{ obj.retentionPeriod || '—' }}</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs text-gray-400 mb-1">Domäne</div>
          <div class="text-sm font-semibold text-gray-900">
            <a v-if="domain" :href="linkTo('/domains/' + domain.id)" class="text-primary-600 hover:underline">{{ domain.name }}</a>
            <span v-else>—</span>
          </div>
        </div>
      </div>

      <!-- Source Applications -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Quell-Applikationen (Datenerzeuger)</h3>
        </div>
        <div v-if="sourceApps.length === 0" class="px-5 py-4 text-sm text-gray-400 italic">Keine Quell-Applikationen zugeordnet</div>
        <table v-else class="w-full text-sm">
          <tbody class="divide-y divide-surface-100">
            <tr v-for="app in sourceApps" :key="app.id" class="hover:bg-surface-50 cursor-pointer" @click="navigateTo('/apps/' + app.id)">
              <td class="px-4 py-2 font-mono text-xs text-gray-400">{{ app.id }}</td>
              <td class="px-4 py-2 font-medium text-primary-600">{{ app.name }}</td>
              <td class="px-4 py-2 text-gray-500">{{ app.vendor }}</td>
              <td class="px-4 py-2 text-xs text-gray-400">{{ app.criticality }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Consuming Applications -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Konsumierende Applikationen (Datenverbraucher)</h3>
        </div>
        <div v-if="consumingApps.length === 0" class="px-5 py-4 text-sm text-gray-400 italic">Keine konsumierenden Applikationen zugeordnet</div>
        <table v-else class="w-full text-sm">
          <tbody class="divide-y divide-surface-100">
            <tr v-for="app in consumingApps" :key="app.id" class="hover:bg-surface-50 cursor-pointer" @click="navigateTo('/apps/' + app.id)">
              <td class="px-4 py-2 font-mono text-xs text-gray-400">{{ app.id }}</td>
              <td class="px-4 py-2 font-medium text-primary-600">{{ app.name }}</td>
              <td class="px-4 py-2 text-gray-500">{{ app.vendor }}</td>
              <td class="px-4 py-2 text-xs text-gray-400">{{ app.criticality }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Edit Modal -->
      <data-object-form v-if="editing" :data-object="obj" @close="editing = false" @saved="editing = false"></data-object-form>
    </div>
    <div v-else class="text-center py-12 text-gray-500">Datenobjekt nicht gefunden.</div>
  `,
  setup () {
    const { ref, computed } = Vue
    const editing = ref(false)

    const obj = computed(() => store.dataObjectById(router.params.id))
    const domain = computed(() => {
      if (!obj.value || !obj.value.domain) return null
      return store.domainById(obj.value.domain)
    })

    const sourceApps = computed(() => {
      if (!obj.value) return []
      return (obj.value.sourceAppIds || []).map(id => store.appById(id)).filter(Boolean)
    })

    const consumingApps = computed(() => {
      if (!obj.value) return []
      return (obj.value.consumingAppIds || []).map(id => store.appById(id)).filter(Boolean)
    })

    function classificationLabel (c) {
      return { öffentlich: 'Öffentlich', intern: 'Intern', vertraulich: 'Vertraulich', strengVertraulich: 'Streng vertraulich' }[c] || c
    }

    function classificationClass (c) {
      return {
        öffentlich: 'bg-green-100 text-green-700',
        intern: 'bg-blue-100 text-blue-700',
        vertraulich: 'bg-amber-100 text-amber-700',
        strengVertraulich: 'bg-red-100 text-red-700'
      }[c] || 'bg-gray-100 text-gray-600'
    }

    function formatLabel (f) {
      return { structured: 'Strukturiert', 'semi-structured': 'Semi-strukturiert', unstructured: 'Unstrukturiert' }[f] || f || '—'
    }

    function qualityColor (score) {
      if (score >= 4) return 'text-green-600'
      if (score >= 3) return 'text-amber-600'
      return 'text-red-600'
    }

    function confirmDelete () {
      if (confirm('Datenobjekt wirklich löschen?')) {
        store.deleteDataObject(router.params.id)
        navigateTo('/data-objects')
      }
    }

    return { obj, domain, sourceApps, consumingApps, editing, classificationLabel, classificationClass, formatLabel, qualityColor, confirmDelete, linkTo, navigateTo }
  }
}
