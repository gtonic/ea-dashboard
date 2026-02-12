// demand-form.js — Wizard-style modal form for creating/editing a demand
import { store } from '../store.js'

export default {
  name: 'DemandForm',
  props: { editDemand: { type: Object, default: null } },
  emits: ['close', 'saved'],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">{{ editDemand ? 'Demand bearbeiten' : 'Neuer Demand' }}</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <!-- Wizard Steps -->
        <div class="px-6 pt-4">
          <div class="flex items-center justify-between mb-6">
            <button v-for="(s, i) in steps" :key="i"
                    @click="step = i"
                    class="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                    :class="step === i ? 'bg-primary-100 text-primary-700' : step > i ? 'bg-green-100 text-green-700' : 'bg-surface-100 text-gray-500'">
              <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    :class="step === i ? 'bg-primary-600 text-white' : step > i ? 'bg-green-600 text-white' : 'bg-gray-300 text-white'">
                {{ step > i ? '✓' : i + 1 }}
              </span>
              <span class="hidden sm:inline">{{ s }}</span>
            </button>
          </div>
        </div>

        <form @submit.prevent="save" class="px-6 pb-4">
          <!-- Step 1: Business Description -->
          <div v-show="step === 0" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Titel *</label>
              <input v-model="form.title" required class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" placeholder="Kurze Beschreibung des Vorhabens" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Beschreibung *</label>
              <textarea v-model="form.description" required rows="4" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none resize-vertical" placeholder="Detaillierte Beschreibung des Business-Bedarfs…"></textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Business Case</label>
              <textarea v-model="form.businessCase" rows="3" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none resize-vertical" placeholder="Erwarteter Nutzen, ROI, Einsparungen…"></textarea>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Eingereicht von *</label>
                <input v-model="form.requestedBy" required class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Datum</label>
                <input v-model="form.requestDate" type="date" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
              </div>
            </div>
          </div>

          <!-- Step 2: Classification -->
          <div v-show="step === 1" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Kategorie</label>
                <select v-model="form.category" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                  <option v-for="c in store.data.enums.demandCategory" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Priorität</label>
                <select v-model="form.priority" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                  <option v-for="p in store.data.enums.demandPriority" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select v-model="form.status" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                  <option v-for="s in store.data.enums.demandStatus" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Geschätztes Budget (€)</label>
                <input v-model.number="form.estimatedBudget" type="number" min="0" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" />
              </div>
            </div>
          </div>

          <!-- Step 3: Compliance & AI (if compliance enabled) -->
          <div v-show="step === (store.featureToggles.complianceEnabled ? 2 : -1)" class="space-y-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 mb-4">
              <strong>⚖️ Compliance- & KI-Prüfung:</strong> Welche Regulierungen und Standards sind für dieses Vorhaben relevant? Beinhaltet das Vorhaben einen KI-Anwendungsfall, wählen Sie „EU AI Act“.
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-2">Zutreffende Regulierungen</label>
              <div class="flex flex-wrap gap-2">
                <div v-for="reg in (store.data.enums.complianceRegulations || [])" :key="reg.value"
                     @click="toggleRegulation(reg.value)"
                     class="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs cursor-pointer transition-colors"
                     :class="form.applicableRegulations.includes(reg.value)
                       ? 'bg-primary-50 border-primary-400 text-primary-700'
                       : 'border-surface-200 text-gray-600 hover:bg-surface-50'">
                  <span class="flex items-center justify-center w-4 h-4 rounded border transition-colors"
                        :class="form.applicableRegulations.includes(reg.value) ? 'bg-primary-600 border-primary-600' : 'border-gray-300'">
                    <svg v-if="form.applicableRegulations.includes(reg.value)" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </span>
                  <div>
                    <div class="font-medium">{{ reg.label }}</div>
                    <div class="text-[10px] text-gray-400">{{ reg.description }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="form.applicableRegulations.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              ℹ️ <strong>{{ form.applicableRegulations.length }} Regulierung(en)</strong> ausgewählt.
              Nach Genehmigung wird ein Compliance-Assessment für jede Regulierung erforderlich.
            </div>

            <!-- EU AI Act details (shown when EUAIACT is selected) -->
            <div v-if="form.applicableRegulations.includes('EUAIACT')" class="mt-2 p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-4">
              <h4 class="text-sm font-semibold text-indigo-800 flex items-center gap-2">
                <span class="text-base">🤖</span> EU AI Act – KI-Details
              </h4>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">EU AI Act Risikokategorie *</label>
                <select v-model="form.aiRiskCategory" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                  <option v-for="r in (store.data.enums.aiRiskCategory || []).filter(r => r !== 'Kein AI-Usecase')" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
              <div v-if="form.aiRiskCategory === 'Unannehmbares Risiko'" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                ⚠️ <strong>Unannehmbares Risiko:</strong> Systeme dieser Kategorie sind gemäß EU AI Act verboten (z.B. Social Scoring, biometrische Echtzeitüberwachung). Dieses Vorhaben kann nicht umgesetzt werden.
              </div>
              <div v-if="form.aiRiskCategory === 'Hohes Risiko'" class="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                ⚠️ <strong>Hohes Risiko:</strong> Erfordert Konformitätsbewertung, CE-Kennzeichnung, Risikomanagement-System, Daten-Governance, technische Dokumentation und menschliche Aufsicht gemäß EU AI Act.
              </div>
              <div v-if="form.aiRiskCategory === 'Begrenztes Risiko'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                ℹ️ <strong>Begrenztes Risiko:</strong> Transparenzpflichten beachten – Nutzer müssen informiert werden, dass sie mit einem KI-System interagieren (Art. 52 EU AI Act).
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">KI-Beschreibung & Begründung</label>
                <textarea v-model="form.aiDescription" rows="3" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none resize-vertical" placeholder="Beschreiben Sie den KI-Anwendungsfall und die Begründung für die Risikokategorie…"></textarea>
              </div>
            </div>
          </div>

          <!-- Step 4 (or 3): Linking -->
          <div v-show="step === (store.featureToggles.complianceEnabled ? 3 : 2)" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Primäre Domäne</label>
              <select v-model.number="form.primaryDomain" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-300 outline-none">
                <option :value="null">— Keine —</option>
                <option v-for="d in store.data.domains" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Weitere Domänen</label>
              <div class="flex flex-wrap gap-2 mt-1">
                <label v-for="d in store.data.domains" :key="d.id" class="flex items-center gap-1 text-xs bg-surface-50 px-2 py-1 rounded cursor-pointer hover:bg-surface-100">
                  <input type="checkbox" :value="d.id" v-model="form.relatedDomains" class="rounded border-gray-300" />
                  {{ d.name }}
                </label>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Betroffene Applikationen</label>
              <div class="flex flex-wrap gap-2 mt-1 max-h-32 overflow-y-auto">
                <label v-for="a in store.data.applications" :key="a.id" class="flex items-center gap-1 text-xs bg-surface-50 px-2 py-1 rounded cursor-pointer hover:bg-surface-100">
                  <input type="checkbox" :value="a.id" v-model="form.relatedApps" class="rounded border-gray-300" />
                  {{ a.name }}
                </label>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Betroffene Vendoren</label>
              <div class="flex flex-wrap gap-2 mt-1 max-h-32 overflow-y-auto">
                <label v-for="v in (store.data.vendors || [])" :key="v.id" class="flex items-center gap-1 text-xs bg-surface-50 px-2 py-1 rounded cursor-pointer hover:bg-surface-100">
                  <input type="checkbox" :value="v.id" v-model="form.relatedVendors" class="rounded border-gray-300" />
                  {{ v.name }}
                </label>
              </div>
            </div>
          </div>

          <!-- Navigation + Save -->
          <div class="flex justify-between items-center pt-6">
            <button v-if="step > 0" type="button" @click="step--"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-surface-100">← Zurück</button>
            <div v-else></div>
            <div class="flex gap-3">
              <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-surface-100">Abbrechen</button>
              <button v-if="step < steps.length - 1" type="button" @click="step++"
                      class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Weiter →</button>
              <button v-else type="submit"
                      class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">{{ editDemand ? 'Aktualisieren' : 'Erstellen' }}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  setup (props, { emit }) {
    const { ref, onMounted } = Vue

    const steps = store.featureToggles.complianceEnabled
      ? ['Business Beschreibung', 'Klassifikation', 'Compliance & AI', 'Verknüpfungen']
      : ['Business Beschreibung', 'Klassifikation', 'Verknüpfungen']
    const step = ref(0)

    const emptyChecklist = () => ({
      dataClassification: false, accessControl: false,
      encryptionReview: false, vulnerabilityScan: false, notes: ''
    })
    const emptyLegalChecklist = () => ({
      dataPrivacy: false, gdprCompliance: false,
      contractReview: false, licenseCheck: false, notes: ''
    })
    const emptyArchChecklist = () => ({
      fitsEAStrategy: false, integrationReview: false,
      technologyApproved: false, scalabilityCheck: false, notes: ''
    })

    const defaultForm = () => ({
      title: '', description: '', businessCase: '',
      category: 'Idee', status: 'Eingereicht', priority: 'Mittel',
      requestedBy: '', requestDate: new Date().toISOString().slice(0, 10),
      estimatedBudget: 0, primaryDomain: null,
      relatedDomains: [], relatedApps: [], relatedVendors: [],
      applicableRegulations: [],
      isAIUseCase: false, aiRiskCategory: 'Kein AI-Usecase', aiDescription: '',
      checklistSecurity: emptyChecklist(),
      checklistLegal: emptyLegalChecklist(),
      checklistArchitecture: emptyArchChecklist()
    })

    const form = ref(defaultForm())

    onMounted(() => {
      if (props.editDemand) {
        form.value = {
          ...defaultForm(),
          ...JSON.parse(JSON.stringify(props.editDemand))
        }
        // Backward compat: if old demand has isAIUseCase but no EUAIACT in applicableRegulations, add it
        if (!form.value.applicableRegulations) form.value.applicableRegulations = []
        if (form.value.isAIUseCase && !form.value.applicableRegulations.includes('EUAIACT')) {
          form.value.applicableRegulations.push('EUAIACT')
        }
      }
    })

    function save () {
      const data = { ...form.value }
      // Derive isAIUseCase from regulation selection for backward compat
      data.isAIUseCase = data.applicableRegulations.includes('EUAIACT')
      if (!data.isAIUseCase) {
        data.aiRiskCategory = 'Kein AI-Usecase'
        data.aiDescription = ''
      }
      if (props.editDemand) {
        store.updateDemand(props.editDemand.id, data)
      } else {
        store.addDemand(data)
      }
      emit('saved')
    }

    function toggleRegulation (value) {
      const idx = form.value.applicableRegulations.indexOf(value)
      if (idx >= 0) form.value.applicableRegulations.splice(idx, 1)
      else form.value.applicableRegulations.push(value)
    }

    return { store, steps, step, form, save, toggleRegulation }
  }
}
