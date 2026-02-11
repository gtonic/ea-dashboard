// project-form.js — Modal for creating/editing a project
import { store } from '../store.js'

export default {
  name: 'ProjectForm',
  props: { editProject: { type: Object, default: null } },
  emits: ['close', 'saved'],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">{{ editProject ? 'Edit Project' : 'New Project' }}</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <form @submit.prevent="save" class="px-6 py-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input v-model="form.name" required class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select v-model="form.category" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
                <option v-for="c in store.data.enums.projectCategory" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Primary Domain</label>
              <select v-model.number="form.primaryDomain" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
                <option v-for="d in store.data.domains" :key="d.id" :value="d.id">{{ d.id }}. {{ d.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Budget (€)</label>
              <input v-model.number="form.budget" type="number" min="0" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select v-model="form.status" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
                <option value="green">🟢 Green</option>
                <option value="yellow">🟡 Yellow</option>
                <option value="red">🔴 Red</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Start (Quarter)</label>
              <input v-model="form.start" placeholder="Q1/2026" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">End (Quarter)</label>
              <input v-model="form.end" placeholder="Q4/2026" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Sponsor</label>
              <input v-model="form.sponsor" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Project Lead</label>
              <input v-model="form.projectLead" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Status Text</label>
              <input v-model="form.statusText" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" placeholder="e.g. On track / Ressourcenengpass" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Strategic Contribution</label>
              <textarea v-model="form.strategicContribution" rows="2" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm resize-vertical focus:ring-2 focus:ring-primary-300 outline-none"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-surface-100">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">{{ editProject ? 'Update' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  setup (props, { emit }) {
    const { ref, onMounted } = Vue

    const defaultForm = () => ({
      name: '', category: 'Modernisierung', primaryDomain: 1, secondaryDomains: [],
      budget: 0, status: 'green', statusText: '', start: '', end: '',
      sponsor: '', projectLead: '', strategicContribution: '',
      capabilities: [], affectedApps: [], timeReference: 'Invest',
      e2eProcesses: [], conformity: 'Konform'
    })

    const form = ref(defaultForm())

    onMounted(() => {
      if (props.editProject) {
        form.value = { ...defaultForm(), ...props.editProject }
      }
    })

    function save () {
      if (props.editProject) {
        store.updateProject(props.editProject.id, { ...form.value })
      } else {
        store.addProject({ ...form.value })
      }
      emit('saved')
    }

    return { store, form, save }
  }
}
