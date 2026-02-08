// vendor-form.js — Modal form for creating/editing a vendor
import { store } from '../store.js'

export default {
  name: 'VendorForm',
  props: { editVendor: { type: Object, default: null } },
  emits: ['close', 'saved'],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">{{ editVendor ? 'Edit Vendor' : 'New Vendor' }}</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <form @submit.prevent="save" class="px-6 py-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Vendor Name *</label>
              <input v-model="form.name" required class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <input v-model="form.category" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" placeholder="e.g. ERP, Cloud, Security" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select v-model="form.status" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                <option v-for="s in store.data.enums.vendorStatus" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Criticality</label>
              <select v-model="form.criticality" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                <option v-for="c in store.data.enums.vendorCriticality" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Service Level</label>
              <input v-model="form.serviceLevel" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" placeholder="e.g. Premium, Standard" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Contract Value / Year (€)</label>
              <input v-model.number="form.contractValue" type="number" min="0" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Contract End</label>
              <input v-model="form.contractEnd" type="date" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Contact Person</label>
              <input v-model="form.contactPerson" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Vendor Manager</label>
              <input v-model="form.vendorManager" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Website</label>
              <input v-model="form.website" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" placeholder="https://..." />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Rating (1-10)</label>
              <input v-model.number="form.rating" type="number" min="1" max="10" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none resize-vertical"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-surface-100">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">{{ editVendor ? 'Update' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  setup (props, { emit }) {
    const { ref, onMounted } = Vue

    const defaultForm = () => ({
      name: '', category: '', status: 'Active',
      criticality: 'Standard', serviceLevel: '',
      contractValue: 0, contractEnd: '',
      contactPerson: '', vendorManager: '',
      website: '', rating: 5, description: ''
    })

    const form = ref(defaultForm())

    onMounted(() => {
      if (props.editVendor) {
        form.value = {
          ...defaultForm(),
          ...props.editVendor
        }
      }
    })

    function save () {
      const data = { ...form.value }
      if (props.editVendor) {
        store.updateVendor(props.editVendor.id, data)
      } else {
        store.addVendor(data)
      }
      emit('saved')
    }

    return { store, form, save }
  }
}
