// domain-form.js — Modal form for creating/editing a domain (incl. strategy, KPIs)
import { store } from '../store.js'

const PALETTE = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4','#84CC16','#EC4899','#6366F1','#F97316','#14B8A6','#A855F7']

export default {
  name: 'DomainForm',
  props: { editDomain: { type: Object, default: null } },
  emits: ['close', 'saved'],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-surface-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 class="text-base font-semibold text-gray-900">{{ editDomain ? 'Edit Domain' : 'New Domain' }}</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <form @submit.prevent="save" class="px-6 py-4 space-y-5">

          <!-- Basic Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Domain Name *</label>
              <input v-model="form.name" required class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Domain Owner</label>
              <input v-model="form.domainOwner" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" placeholder="e.g. CIO, CFO, COO" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Color</label>
              <div class="flex flex-wrap gap-2 mt-1">
                <button v-for="c in palette" :key="c" type="button" @click="form.color = c"
                        class="w-7 h-7 rounded-lg border-2 transition-all"
                        :style="{ backgroundColor: c }"
                        :class="form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'"></button>
              </div>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea v-model="form.description" rows="2" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none resize-vertical"></textarea>
            </div>
          </div>

          <!-- Strategy Section -->
          <div class="border-t border-surface-200 pt-4">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Strategy & Vision</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Strategic Focus</label>
                <input v-model="form.strategicFocus" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" placeholder="e.g. Cloud-Migration, Integration, Standardisierung" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Vision</label>
                <textarea v-model="form.vision" rows="2" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none resize-vertical" placeholder="Target state description for this domain"></textarea>
              </div>
            </div>
          </div>

          <!-- KPIs Section -->
          <div class="border-t border-surface-200 pt-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-gray-700">Domain KPIs</h4>
              <button type="button" @click="addKpi" class="text-xs text-primary-600 hover:text-primary-800 font-medium">+ Add KPI</button>
            </div>
            <div v-if="form.kpis.length === 0" class="text-xs text-gray-400 italic">No KPIs defined yet</div>
            <div v-for="(kpi, i) in form.kpis" :key="i" class="flex items-start gap-2 mb-2 p-3 bg-surface-50 rounded-lg">
              <div class="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div class="sm:col-span-2">
                  <input v-model="kpi.name" placeholder="KPI Name" class="w-full px-2 py-1.5 border border-surface-200 rounded text-xs focus:ring-1 focus:ring-primary-300 outline-none" />
                </div>
                <div>
                  <input v-model="kpi.target" placeholder="Target" class="w-full px-2 py-1.5 border border-surface-200 rounded text-xs focus:ring-1 focus:ring-primary-300 outline-none" />
                </div>
                <div>
                  <input v-model="kpi.current" placeholder="Current" class="w-full px-2 py-1.5 border border-surface-200 rounded text-xs focus:ring-1 focus:ring-primary-300 outline-none" />
                </div>
                <div>
                  <input v-model="kpi.unit" placeholder="Unit (%,#,h)" class="w-full px-2 py-1.5 border border-surface-200 rounded text-xs focus:ring-1 focus:ring-primary-300 outline-none" />
                </div>
                <div>
                  <select v-model="kpi.trend" class="w-full px-2 py-1.5 border border-surface-200 rounded text-xs bg-white focus:ring-1 focus:ring-primary-300 outline-none">
                    <option value="improving">↑ Improving</option>
                    <option value="stable">→ Stable</option>
                    <option value="declining">↓ Declining</option>
                  </select>
                </div>
              </div>
              <button type="button" @click="form.kpis.splice(i, 1)" class="text-gray-400 hover:text-red-500 text-lg mt-1">&times;</button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2 border-t border-surface-200">
            <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-surface-100">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">{{ editDomain ? 'Update' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  setup (props, { emit }) {
    const { ref, onMounted } = Vue
    const palette = PALETTE

    const defaultForm = () => ({
      name: '', color: '#3B82F6', icon: '', description: '',
      domainOwner: '', strategicFocus: '', vision: '',
      kpis: []
    })

    const form = ref(defaultForm())

    onMounted(() => {
      if (props.editDomain) {
        form.value = {
          ...defaultForm(),
          name: props.editDomain.name,
          color: props.editDomain.color,
          icon: props.editDomain.icon || '',
          description: props.editDomain.description || '',
          domainOwner: props.editDomain.domainOwner || '',
          strategicFocus: props.editDomain.strategicFocus || '',
          vision: props.editDomain.vision || '',
          kpis: (props.editDomain.kpis || []).map(k => ({ ...k }))
        }
      }
    })

    function addKpi () {
      const id = 'KPI-D-' + Date.now()
      form.value.kpis.push({ id, name: '', target: '', current: '', unit: '%', trend: 'stable' })
    }

    function save () {
      const data = { ...form.value }
      // Assign KPI IDs if missing
      data.kpis = data.kpis.filter(k => k.name).map((k, i) => ({
        ...k,
        id: k.id || `KPI-D-${Date.now()}-${i}`
      }))
      if (props.editDomain) {
        store.updateDomain(props.editDomain.id, data)
      } else {
        store.addDomain(data)
      }
      emit('saved')
    }

    return { store, form, palette, addKpi, save }
  }
}
