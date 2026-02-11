// process-form.js — Modal for E2E Process CRUD
import { store } from '../store.js'

export default {
  name: 'ProcessForm',
  props: { editProcess: { type: Object, default: null } },
  emits: ['close', 'saved'],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-900">{{ editProcess ? 'Edit Process' : 'New E2E Process' }}</h3>

        <!-- ID -->
        <div>
          <label class="text-xs font-medium text-gray-600">Process ID (e.g. O2C)</label>
          <input v-model="form.id" :disabled="!!editProcess" class="mt-1 w-full border border-surface-200 rounded-lg px-3 py-2 text-sm" placeholder="O2C" />
        </div>

        <!-- Name -->
        <div>
          <label class="text-xs font-medium text-gray-600">Name</label>
          <input v-model="form.name" class="mt-1 w-full border border-surface-200 rounded-lg px-3 py-2 text-sm" />
        </div>

        <!-- Owner -->
        <div>
          <label class="text-xs font-medium text-gray-600">Owner</label>
          <input v-model="form.owner" class="mt-1 w-full border border-surface-200 rounded-lg px-3 py-2 text-sm" />
        </div>

        <!-- Description -->
        <div>
          <label class="text-xs font-medium text-gray-600">Description</label>
          <textarea v-model="form.description" rows="2" class="mt-1 w-full border border-surface-200 rounded-lg px-3 py-2 text-sm"></textarea>
        </div>

        <!-- Status -->
        <div>
          <label class="text-xs font-medium text-gray-600">Status</label>
          <select v-model="form.status" class="mt-1 w-full border border-surface-200 rounded-lg px-3 py-2 text-sm">
            <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <!-- Domain Multi-Select -->
        <div>
          <label class="text-xs font-medium text-gray-600">Linked Domains</label>
          <div class="mt-1 flex flex-wrap gap-2">
            <label v-for="d in store.data.domains" :key="d.id"
                   class="flex items-center gap-1.5 text-xs px-2 py-1 rounded border cursor-pointer"
                   :class="form.domains.includes(d.id) ? 'border-primary-400 bg-primary-50' : 'border-surface-200'">
              <input type="checkbox" :value="d.id" v-model="form.domains" class="sr-only" />
              <span class="w-4 h-4 rounded flex items-center justify-center text-white text-[8px] font-bold"
                    :style="{ backgroundColor: d.color }">{{ d.id }}</span>
              {{ d.name }}
            </label>
          </div>
        </div>

        <!-- Linked Applications (direct) -->
        <div>
          <div class="flex items-center justify-between">
            <label class="text-xs font-medium text-gray-600">Direkt zugewiesene Applikationen</label>
            <span class="text-[10px] text-gray-400">{{ form.applicationIds.length }} ausgewählt</span>
          </div>
          <div class="text-[10px] text-gray-400 mb-1">Wenn leer, wird automatisch über Domains abgeleitet.</div>
          <input v-model="appSearch" placeholder="App suchen…" class="mt-1 w-full border border-surface-200 rounded-lg px-3 py-1.5 text-xs" />
          <div class="mt-1 max-h-40 overflow-y-auto border border-surface-200 rounded-lg">
            <label v-for="app in filteredApps" :key="app.id"
                   class="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-50 cursor-pointer text-xs border-b border-surface-100 last:border-0">
              <input type="checkbox" :value="app.id" v-model="form.applicationIds" class="rounded text-primary-600" />
              <span class="font-mono text-gray-400 w-14 shrink-0">{{ app.id }}</span>
              <span class="text-gray-700 truncate">{{ app.name }}</span>
              <span class="ml-auto text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                    :class="{'bg-green-100 text-green-700': app.timeQuadrant === 'Invest', 'bg-yellow-100 text-yellow-700': app.timeQuadrant === 'Tolerate', 'bg-blue-100 text-blue-700': app.timeQuadrant === 'Migrate', 'bg-red-100 text-red-700': app.timeQuadrant === 'Eliminate'}">
                {{ app.timeQuadrant }}
              </span>
            </label>
          </div>
          <div v-if="form.applicationIds.length" class="mt-2 flex flex-wrap gap-1">
            <span v-for="aid in form.applicationIds" :key="aid" class="inline-flex items-center gap-1 text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
              {{ appName(aid) }}
              <button @click="form.applicationIds = form.applicationIds.filter(x => x !== aid)" class="hover:text-red-600">✕</button>
            </span>
          </div>
        </div>

        <!-- KPIs -->
        <div>
          <div class="flex items-center justify-between">
            <label class="text-xs font-medium text-gray-600">Process KPIs</label>
            <button type="button" @click="addKpi" class="text-xs text-primary-600 hover:text-primary-800">+ Add KPI</button>
          </div>
          <div v-for="(kpi, i) in form.kpis" :key="i" class="mt-2 flex flex-wrap items-center gap-2">
            <input v-model="kpi.name" placeholder="Name" class="flex-1 border border-surface-200 rounded px-2 py-1 text-xs" />
            <input v-model="kpi.current" placeholder="Ist" class="w-14 border border-surface-200 rounded px-2 py-1 text-xs text-right" />
            <input v-model="kpi.target" placeholder="Soll" class="w-14 border border-surface-200 rounded px-2 py-1 text-xs text-right" />
            <input v-model="kpi.unit" placeholder="%" class="w-10 border border-surface-200 rounded px-2 py-1 text-xs" />
            <select v-model="kpi.trend" class="w-16 border border-surface-200 rounded px-1 py-1 text-xs">
              <option v-for="t in trendOptions" :key="t" :value="t">{{ t }}</option>
            </select>
            <button @click="form.kpis.splice(i, 1)" class="text-red-400 hover:text-red-600 text-xs">✕</button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2">
          <button @click="$emit('close')" class="px-4 py-2 text-sm border border-surface-200 rounded-lg hover:bg-surface-50">Cancel</button>
          <button @click="save" :disabled="!form.id || !form.name" class="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-40">Save</button>
        </div>
      </div>
    </div>
  `,
  setup (props, { emit }) {
    const { ref, onMounted } = Vue
    const statusOptions = (store.data.enums?.processStatus || ['active', 'optimization', 'transformation'])
    const trendOptions = (store.data.enums?.kpiTrend || ['improving', 'stable', 'declining'])

    const form = ref({
      id: '', name: '', owner: '', description: '', status: 'active', domains: [], applicationIds: [], kpis: []
    })

    const appSearch = ref('')
    const { computed: vComputed } = Vue
    const filteredApps = vComputed(() => {
      const q = appSearch.value.toLowerCase()
      return store.data.applications
        .filter(a => !q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
        .sort((a, b) => {
          const aChecked = form.value.applicationIds.includes(a.id)
          const bChecked = form.value.applicationIds.includes(b.id)
          if (aChecked !== bChecked) return aChecked ? -1 : 1
          return a.name.localeCompare(b.name)
        })
    })

    function appName (id) {
      const a = store.appById(id)
      return a ? a.name : id
    }

    onMounted(() => {
      if (props.editProcess) {
        const p = props.editProcess
        form.value = {
          id: p.id,
          name: p.name,
          owner: p.owner || '',
          description: p.description || '',
          status: p.status || 'active',
          domains: [...(p.domains || [])],
          applicationIds: [...(p.applicationIds || [])],
          kpis: (p.kpis || []).map(k => ({ ...k }))
        }
      }
    })

    function addKpi () {
      const idx = form.value.kpis.length + 1
      form.value.kpis.push({ id: 'PKI-' + idx, name: '', current: '', target: '', unit: '%', trend: 'stable' })
    }

    function save () {
      const f = form.value
      const data = {
        id: f.id, name: f.name, owner: f.owner, description: f.description,
        status: f.status, domains: f.domains,
        applicationIds: f.applicationIds,
        kpis: f.kpis.map((k, i) => ({ ...k, id: k.id || ('PKI-' + (i + 1)), current: Number(k.current) || k.current, target: Number(k.target) || k.target }))
      }
      if (props.editProcess) {
        store.updateProcess(data.id, data)
      } else {
        store.addProcess(data)
      }
      emit('saved')
    }

    return { store, form, statusOptions, trendOptions, appSearch, filteredApps, appName, addKpi, save }
  }
}
