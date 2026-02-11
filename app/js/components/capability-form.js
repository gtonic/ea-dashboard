// capability-form.js — Modal form for creating/editing a capability (incl. target maturity, KPIs, sub-capabilities)
import { store } from '../store.js'

export default {
  name: 'CapabilityForm',
  props: {
    editCapability: { type: Object, default: null },
    domainId: { type: Number, required: true }
  },
  emits: ['close', 'saved'],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-surface-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 class="text-base font-semibold text-gray-900">{{ editCapability ? 'Edit Capability' : 'New Capability' }}</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <form @submit.prevent="save" class="px-6 py-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Capability Name *</label>
              <input v-model="form.name" required class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Criticality</label>
              <select v-model="form.criticality" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                <option v-for="c in store.data.enums.capabilityCriticality" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div></div>

            <!-- Maturity (Ist) -->
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Current Maturity (Ist)</label>
              <div class="flex items-center gap-2">
                <input type="range" v-model.number="form.maturity" min="1" max="5" step="1" class="flex-1 accent-blue-600" />
                <span class="text-sm font-bold w-6 text-center" :style="{ color: matColor(form.maturity) }">{{ form.maturity }}</span>
              </div>
              <div class="flex justify-between text-[9px] text-gray-400 px-0.5"><span>Initial</span><span>Optimized</span></div>
            </div>

            <!-- Target Maturity (Soll) -->
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Target Maturity (Soll)</label>
              <div class="flex items-center gap-2">
                <input type="range" v-model.number="form.targetMaturity" min="1" max="5" step="1" class="flex-1 accent-indigo-600" />
                <span class="text-sm font-bold w-6 text-center" :style="{ color: matColor(form.targetMaturity) }">{{ form.targetMaturity }}</span>
              </div>
              <div class="flex justify-between text-[9px] text-gray-400 px-0.5"><span>Initial</span><span>Optimized</span></div>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea v-model="form.description" rows="2" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none resize-vertical"></textarea>
            </div>
          </div>

          <!-- Sub-Capabilities -->
          <div class="border-t border-surface-200 pt-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-semibold text-gray-700">Sub-Capabilities</h4>
              <button type="button" @click="addSub" class="text-xs text-primary-600 hover:text-primary-800 font-medium">+ Add</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <div v-for="(sub, i) in form.subCapabilities" :key="i" class="flex items-center gap-1 bg-surface-100 rounded px-2 py-1">
                <input v-model="sub.name" class="bg-transparent text-xs outline-none w-40" placeholder="Sub-capability name" />
                <button type="button" @click="form.subCapabilities.splice(i, 1)" class="text-gray-400 hover:text-red-500 text-sm">&times;</button>
              </div>
            </div>
          </div>

          <!-- KPIs -->
          <div class="border-t border-surface-200 pt-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-semibold text-gray-700">Capability KPIs</h4>
              <button type="button" @click="addKpi" class="text-xs text-primary-600 hover:text-primary-800 font-medium">+ Add KPI</button>
            </div>
            <div v-for="(kpi, i) in form.kpis" :key="i" class="flex items-start gap-2 mb-2 p-2 bg-surface-50 rounded-lg">
              <div class="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div class="sm:col-span-2">
                  <input v-model="kpi.name" placeholder="KPI Name" class="w-full px-2 py-1 border border-surface-200 rounded text-xs outline-none" />
                </div>
                <input v-model="kpi.target" placeholder="Target" class="px-2 py-1 border border-surface-200 rounded text-xs outline-none" />
                <input v-model="kpi.current" placeholder="Current" class="px-2 py-1 border border-surface-200 rounded text-xs outline-none" />
                <input v-model="kpi.unit" placeholder="Unit" class="px-2 py-1 border border-surface-200 rounded text-xs outline-none" />
                <select v-model="kpi.trend" class="px-2 py-1 border border-surface-200 rounded text-xs bg-white outline-none">
                  <option value="improving">↑ Improving</option>
                  <option value="stable">→ Stable</option>
                  <option value="declining">↓ Declining</option>
                </select>
              </div>
              <button type="button" @click="form.kpis.splice(i, 1)" class="text-gray-400 hover:text-red-500 text-sm mt-1">&times;</button>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2 border-t border-surface-200">
            <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-surface-100">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">{{ editCapability ? 'Update' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  setup (props, { emit }) {
    const { ref, onMounted } = Vue

    const defaultForm = () => ({
      name: '', criticality: 'Medium', maturity: 1, targetMaturity: 3,
      description: '', subCapabilities: [], kpis: []
    })

    const form = ref(defaultForm())

    onMounted(() => {
      if (props.editCapability) {
        const c = props.editCapability
        form.value = {
          name: c.name,
          criticality: c.criticality || 'Medium',
          maturity: c.maturity || 1,
          targetMaturity: c.targetMaturity || c.maturity || 1,
          description: c.description || '',
          subCapabilities: (c.subCapabilities || []).map(s => ({ ...s })),
          kpis: (c.kpis || []).map(k => ({ ...k }))
        }
      }
    })

    function matColor (m) {
      return { 1: '#f87171', 2: '#fb923c', 3: '#facc15', 4: '#a3e635', 5: '#34d399' }[m] || '#94a3b8'
    }

    function addSub () {
      form.value.subCapabilities.push({ id: '', name: '' })
    }

    function addKpi () {
      form.value.kpis.push({ id: 'KPI-C-' + Date.now(), name: '', target: '', current: '', unit: '%', trend: 'stable' })
    }

    function save () {
      const data = { ...form.value }
      // Clean up sub-capabilities
      data.subCapabilities = data.subCapabilities.filter(s => s.name)
      data.kpis = data.kpis.filter(k => k.name)

      if (props.editCapability) {
        store.updateCapability(props.editCapability.id, data)
      } else {
        store.addCapability(props.domainId, data)
      }
      emit('saved')
    }

    return { store, form, matColor, addSub, addKpi, save }
  }
}
