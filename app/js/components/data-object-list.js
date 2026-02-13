// data-object-list.js — Data object catalog with classification overview
import { store } from '../store.js'
import { linkTo, navigateTo } from '../router.js'

export default {
  name: 'DataObjectList',
  template: `
    <div class="space-y-4">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="search" type="text" placeholder="Datenobjekt suchen…"
               class="flex-1 min-w-[200px] px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none" />
        <select v-model="filterClassification" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">Alle Klassifikationen</option>
          <option v-for="c in classifications" :key="c" :value="c">{{ classificationLabel(c) }}</option>
        </select>
        <button @click="showForm = true"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors whitespace-nowrap">
          + Neues Datenobjekt
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-white rounded-xl border border-surface-200 p-4 text-center">
          <div class="text-2xl font-bold text-primary-600">{{ store.totalDataObjects }}</div>
          <div class="text-xs text-gray-500 mt-1">Datenobjekte</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4 text-center">
          <div class="text-2xl font-bold text-red-600">{{ personalDataCount }}</div>
          <div class="text-xs text-gray-500 mt-1">Personenbezogen</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4 text-center">
          <div class="text-2xl font-bold text-amber-600">{{ avgQuality }}</div>
          <div class="text-xs text-gray-500 mt-1">Ø Qualität</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4 text-center">
          <div class="text-2xl font-bold text-purple-600">{{ classificationCounts.strengVertraulich || 0 }}</div>
          <div class="text-xs text-gray-500 mt-1">Streng vertraulich</div>
        </div>
      </div>

      <!-- Count -->
      <div class="text-xs text-gray-500">{{ filtered.length }} von {{ store.totalDataObjects }} Datenobjekte</div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a v-for="obj in filtered" :key="obj.id"
           :href="linkTo('/data-objects/' + obj.id)"
           class="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md transition-shadow cursor-pointer group">
          <div class="flex items-start justify-between mb-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-mono text-gray-400">{{ obj.id }}</span>
                <span v-if="obj.personalData" class="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">DSGVO</span>
              </div>
              <h3 class="text-sm font-semibold text-gray-900 group-hover:text-primary-600">{{ obj.name }}</h3>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full" :class="classificationClass(obj.classification)">{{ classificationLabel(obj.classification) }}</span>
          </div>
          <p class="text-xs text-gray-500 mb-3 line-clamp-2">{{ obj.description }}</p>
          <div class="flex items-center justify-between pt-3 border-t border-surface-100">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <span class="text-xs text-gray-400">Qualität:</span>
                <span class="text-xs font-bold" :class="qualityColor(obj.qualityScore)">{{ obj.qualityScore }}/5</span>
              </div>
            </div>
            <div class="text-xs text-gray-400">{{ obj.owner }}</div>
          </div>
        </a>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-x-auto">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Datenobjekt-Katalog</h3>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-200 bg-surface-50">
              <th class="text-left px-4 py-2 font-medium text-gray-600">ID</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">Name</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">Klassifikation</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">Owner</th>
              <th class="text-center px-4 py-2 font-medium text-gray-600">Qualität</th>
              <th class="text-center px-4 py-2 font-medium text-gray-600">DSGVO</th>
              <th class="text-right px-4 py-2 font-medium text-gray-600">Apps</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="obj in filtered" :key="obj.id" class="hover:bg-surface-50 cursor-pointer" @click="navigateTo('/data-objects/' + obj.id)">
              <td class="px-4 py-2 font-mono text-xs text-gray-400">{{ obj.id }}</td>
              <td class="px-4 py-2 font-medium text-gray-900">{{ obj.name }}</td>
              <td class="px-4 py-2">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="classificationClass(obj.classification)">{{ classificationLabel(obj.classification) }}</span>
              </td>
              <td class="px-4 py-2 text-gray-600">{{ obj.owner }}</td>
              <td class="px-4 py-2 text-center">
                <span class="font-bold" :class="qualityColor(obj.qualityScore)">{{ obj.qualityScore }}/5</span>
              </td>
              <td class="px-4 py-2 text-center">
                <span v-if="obj.personalData" class="text-red-600">●</span>
                <span v-else class="text-gray-300">—</span>
              </td>
              <td class="px-4 py-2 text-right font-mono font-bold text-gray-700">{{ totalApps(obj) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create Modal -->
      <data-object-form v-if="showForm" @close="showForm = false" @saved="onSaved"></data-object-form>
    </div>
  `,
  setup () {
    const { ref, computed } = Vue
    const search = ref('')
    const filterClassification = ref('')
    const showForm = ref(false)

    const dataObjects = computed(() => store.data.dataObjects || [])

    const classifications = computed(() => {
      const set = new Set(dataObjects.value.map(d => d.classification).filter(Boolean))
      return [...set].sort()
    })

    const filtered = computed(() => {
      let list = [...dataObjects.value]
      const q = search.value.toLowerCase()
      if (q) list = list.filter(d =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.id || '').toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q) ||
        (d.owner || '').toLowerCase().includes(q)
      )
      if (filterClassification.value) list = list.filter(d => d.classification === filterClassification.value)
      return list
    })

    const personalDataCount = computed(() => dataObjects.value.filter(d => d.personalData).length)

    const avgQuality = computed(() => {
      const objs = dataObjects.value.filter(d => d.qualityScore)
      if (!objs.length) return '—'
      const avg = objs.reduce((s, d) => s + d.qualityScore, 0) / objs.length
      return avg.toFixed(1)
    })

    const classificationCounts = computed(() => {
      const counts = {}
      dataObjects.value.forEach(d => {
        const c = d.classification || 'unbekannt'
        counts[c] = (counts[c] || 0) + 1
      })
      return counts
    })

    function totalApps (obj) {
      return ((obj.sourceAppIds || []).length + (obj.consumingAppIds || []).length)
    }

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

    function qualityColor (score) {
      if (score >= 4) return 'text-green-600'
      if (score >= 3) return 'text-amber-600'
      return 'text-red-600'
    }

    function onSaved () { showForm.value = false }

    return { store, linkTo, navigateTo, search, filterClassification, classifications, filtered, personalDataCount, avgQuality, classificationCounts, totalApps, classificationLabel, classificationClass, qualityColor, showForm, onSaved }
  }
}
