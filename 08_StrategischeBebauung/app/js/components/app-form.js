// app-form.js — Modal form for creating/editing an application
import { store } from '../store.js'

export default {
  name: 'AppForm',
  props: { editApp: { type: Object, default: null } },
  emits: ['close', 'saved'],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">{{ editApp ? 'Edit Application' : 'New Application' }}</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <form @submit.prevent="save" class="px-6 py-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input v-model="form.name" required class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Vendor</label>
              <input v-model="form.vendor" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <input v-model="form.category" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" placeholder="e.g. ERP, CRM, MES" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select v-model="form.type" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                <option v-for="t in store.data.enums.appType" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Criticality</label>
              <select v-model="form.criticality" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                <option v-for="c in store.data.enums.criticality" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">TIME Quadrant</label>
              <select v-model="form.timeQuadrant" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                <option v-for="t in store.data.enums.timeQuadrant" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Risk Probability</label>
              <select v-model="form.riskProbability" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                <option v-for="r in (store.data.enums.riskProbability || [])" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Risk Impact</label>
              <select v-model="form.riskImpact" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                <option v-for="r in (store.data.enums.riskImpact || [])" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Lifecycle Status</label>
              <select v-model="form.lifecycleStatus" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                <option v-for="l in (store.data.enums.lifecycleStatus || [])" :key="l" :value="l">{{ l }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Cost per Year (€)</label>
              <input v-model.number="form.costPerYear" type="number" min="0" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">User Count</label>
              <input v-model.number="form.userCount" type="number" min="0" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Business Owner</label>
              <input v-model="form.businessOwner" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">IT Owner</label>
              <input v-model="form.itOwner" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Go-Live Date</label>
              <input v-model="form.goLiveDate" type="date" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Business Value (1-10)</label>
              <input v-model.number="form.businessValue" type="number" min="1" max="10" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Technical Health (1-10)</label>
              <input v-model.number="form.technicalHealth" type="number" min="1" max="10" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none resize-vertical"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-surface-100">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">{{ editApp ? 'Update' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  setup (props, { emit }) {
    const { ref, onMounted } = Vue

    const defaultForm = () => ({
      name: '', vendor: '', category: '', type: 'On-Prem',
      criticality: 'Business-Operational', timeQuadrant: 'Tolerate',
      riskProbability: 'Niedrig', riskImpact: 'Mittel', lifecycleStatus: 'Active',
      costPerYear: 0, userCount: 0, businessOwner: '', itOwner: '',
      goLiveDate: '', businessValue: 5, technicalHealth: 5, description: ''
    })

    const form = ref(defaultForm())

    onMounted(() => {
      if (props.editApp) {
        form.value = {
          ...defaultForm(),
          ...props.editApp,
          businessValue: props.editApp.scores?.businessValue || 5,
          technicalHealth: props.editApp.scores?.technicalHealth || 5
        }
      }
    })

    function save () {
      const data = { ...form.value, scores: { businessValue: form.value.businessValue, technicalHealth: form.value.technicalHealth } }
      delete data.businessValue
      delete data.technicalHealth
      if (props.editApp) {
        store.updateApp(props.editApp.id, data)
      } else {
        store.addApp(data)
      }
      emit('saved')
    }

    return { store, form, save }
  }
}
