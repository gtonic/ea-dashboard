// data-object-form.js — Create / Edit form for data objects
import { store } from '../store.js'

export default {
  name: 'DataObjectForm',
  props: { dataObject: { type: Object, default: null } },
  emits: ['close', 'saved'],
  template: `
    <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-surface-200">
          <h2 class="text-lg font-semibold text-gray-900">{{ isEdit ? 'Datenobjekt bearbeiten' : 'Neues Datenobjekt' }}</h2>
        </div>
        <form @submit.prevent="save" class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Name *</label>
            <input v-model="form.name" required class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Beschreibung</label>
            <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Klassifikation</label>
              <select v-model="form.classification" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                <option value="öffentlich">Öffentlich</option>
                <option value="intern">Intern</option>
                <option value="vertraulich">Vertraulich</option>
                <option value="strengVertraulich">Streng vertraulich</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Format</label>
              <select v-model="form.format" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                <option value="structured">Strukturiert</option>
                <option value="semi-structured">Semi-strukturiert</option>
                <option value="unstructured">Unstrukturiert</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Data Owner</label>
              <input v-model="form.owner" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Data Steward</label>
              <input v-model="form.steward" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Qualitätsscore (1–5)</label>
              <input v-model.number="form.qualityScore" type="number" min="1" max="5" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Aufbewahrungsfrist</label>
              <input v-model="form.retentionPeriod" placeholder="z.B. 10 Jahre" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Domäne</label>
            <select v-model.number="form.domain" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
              <option :value="null">— Keine —</option>
              <option v-for="d in domains" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Quell-Applikationen</label>
            <div class="flex flex-wrap gap-1 mb-1">
              <span v-for="id in form.sourceAppIds" :key="id" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                {{ appName(id) }}
                <button type="button" @click="removeSourceApp(id)" class="text-blue-500 hover:text-blue-800">&times;</button>
              </span>
            </div>
            <select @change="addSourceApp($event)" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
              <option value="">+ Applikation hinzufügen</option>
              <option v-for="a in availableSourceApps" :key="a.id" :value="a.id">{{ a.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Konsumierende Applikationen</label>
            <div class="flex flex-wrap gap-1 mb-1">
              <span v-for="id in form.consumingAppIds" :key="id" class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                {{ appName(id) }}
                <button type="button" @click="removeConsumingApp(id)" class="text-green-500 hover:text-green-800">&times;</button>
              </span>
            </div>
            <select @change="addConsumingApp($event)" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
              <option value="">+ Applikation hinzufügen</option>
              <option v-for="a in availableConsumingApps" :key="a.id" :value="a.id">{{ a.name }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="form.personalData" id="personalData" class="rounded border-surface-300" />
            <label for="personalData" class="text-sm text-gray-600">Personenbezogene Daten (DSGVO-relevant)</label>
          </div>
          <div class="flex justify-end gap-2 pt-4 border-t border-surface-200">
            <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm border border-surface-200 rounded-lg hover:bg-surface-50">Abbrechen</button>
            <button type="submit" class="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">{{ isEdit ? 'Speichern' : 'Erstellen' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  setup (props, { emit }) {
    const { ref, computed, reactive } = Vue
    const isEdit = !!props.dataObject

    const form = reactive({
      name: props.dataObject?.name || '',
      description: props.dataObject?.description || '',
      classification: props.dataObject?.classification || 'intern',
      owner: props.dataObject?.owner || '',
      steward: props.dataObject?.steward || '',
      qualityScore: props.dataObject?.qualityScore || 3,
      retentionPeriod: props.dataObject?.retentionPeriod || '',
      personalData: props.dataObject?.personalData || false,
      format: props.dataObject?.format || 'structured',
      domain: props.dataObject?.domain || null,
      sourceAppIds: [...(props.dataObject?.sourceAppIds || [])],
      consumingAppIds: [...(props.dataObject?.consumingAppIds || [])]
    })

    const domains = computed(() => store.data.domains || [])
    const allApps = computed(() => store.data.applications || [])

    const availableSourceApps = computed(() =>
      allApps.value.filter(a => !form.sourceAppIds.includes(a.id))
    )
    const availableConsumingApps = computed(() =>
      allApps.value.filter(a => !form.consumingAppIds.includes(a.id))
    )

    function appName (id) {
      const a = store.appById(id)
      return a ? a.name : id
    }

    function addSourceApp (event) {
      const id = event.target.value
      if (id && !form.sourceAppIds.includes(id)) form.sourceAppIds.push(id)
      event.target.value = ''
    }

    function removeSourceApp (id) {
      form.sourceAppIds = form.sourceAppIds.filter(i => i !== id)
    }

    function addConsumingApp (event) {
      const id = event.target.value
      if (id && !form.consumingAppIds.includes(id)) form.consumingAppIds.push(id)
      event.target.value = ''
    }

    function removeConsumingApp (id) {
      form.consumingAppIds = form.consumingAppIds.filter(i => i !== id)
    }

    function save () {
      const data = { ...form }
      if (isEdit) {
        store.updateDataObject(props.dataObject.id, data)
      } else {
        store.addDataObject(data)
      }
      emit('saved')
    }

    return { form, isEdit, domains, allApps, availableSourceApps, availableConsumingApps, appName, addSourceApp, removeSourceApp, addConsumingApp, removeConsumingApp, save }
  }
}
