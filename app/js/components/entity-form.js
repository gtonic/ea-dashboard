// entity-form.js — Modal form for creating/editing a legal entity
import { store } from '../store.js'

export default {
  name: 'EntityForm',
  props: { editEntity: { type: Object, default: null } },
  emits: ['close', 'saved'],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">{{ editEntity ? 'Entität bearbeiten' : 'Neue Entität' }}</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <form @submit.prevent="save" class="px-6 py-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input v-model="form.name" required class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Kurzname *</label>
              <input v-model="form.shortName" required class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Land (ISO Code)</label>
              <input v-model="form.country" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" placeholder="z.B. DE, AT, CH" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Stadt</label>
              <input v-model="form.city" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Region</label>
              <select v-model="form.region" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                <option value="">— Auswählen —</option>
                <option value="Headquarters">Headquarters</option>
                <option value="DACH">DACH</option>
                <option value="EMEA">EMEA</option>
                <option value="Americas">Americas</option>
                <option value="APAC">APAC</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Parent-Entität</label>
              <select v-model="form.parentEntity" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                <option :value="null">— Keine (Konzernmutter) —</option>
                <option v-for="ent in availableParents" :key="ent.id" :value="ent.id">{{ ent.shortName }}</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">Beschreibung</label>
              <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none resize-vertical"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-surface-100">Abbrechen</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">{{ editEntity ? 'Aktualisieren' : 'Anlegen' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  setup (props, { emit }) {
    const { ref, computed, onMounted } = Vue

    const defaultForm = () => ({
      name: '', shortName: '', country: '', city: '',
      region: '', parentEntity: null, description: ''
    })

    const form = ref(defaultForm())

    onMounted(() => {
      if (props.editEntity) {
        form.value = { ...defaultForm(), ...props.editEntity }
      }
    })

    const availableParents = computed(() => {
      const entities = store.data.legalEntities || []
      if (props.editEntity) {
        return entities.filter(e => e.id !== props.editEntity.id)
      }
      return entities
    })

    function save () {
      const { id, ...data } = form.value
      if (props.editEntity) {
        store.updateEntity(props.editEntity.id, data)
      } else {
        store.addEntity(data)
      }
      emit('saved')
    }

    return { store, form, save, availableParents }
  }
}
