// demand-detail.js — Demand detail view with checklists for Security, Legal, Architecture
import { store } from '../store.js'
import { router, linkTo, navigateTo } from '../router.js'

export default {
  name: 'DemandDetail',
  template: `
    <div v-if="demand" class="space-y-6">
      <!-- Back link -->
      <a :href="linkTo('/demands')" class="text-sm text-gray-500 hover:text-primary-600">← Demand Backlog</a>

      <!-- Header -->
      <div class="bg-white rounded-xl border border-surface-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div class="flex items-center gap-3 mb-1 flex-wrap">
              <h2 class="text-xl font-bold text-gray-900">{{ demand.title }}</h2>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="statusClass(demand.status)">{{ demand.status }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="catClass(demand.category)">{{ demand.category }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="prioClass(demand.priority)">{{ demand.priority }}</span>
            </div>
            <div class="text-sm text-gray-500">{{ demand.id }} · Eingereicht von {{ demand.requestedBy }} am {{ demand.requestDate }}</div>
            <p class="text-sm text-gray-600 mt-3 max-w-2xl">{{ demand.description }}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button @click="showEdit = true" class="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-surface-100">Bearbeiten</button>
            <button @click="confirmDelete" class="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs hover:bg-red-50">Löschen</button>
          </div>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-surface-100">
          <div>
            <div class="text-xs text-gray-500">Geschätztes Budget</div>
            <div class="text-lg font-bold text-gray-800">{{ demand.estimatedBudget > 0 ? '€' + demand.estimatedBudget.toLocaleString() : '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Primäre Domäne</div>
            <div class="text-lg font-bold text-primary-600">
              <a v-if="primaryDomain" :href="linkTo('/domains/' + primaryDomain.id)" class="hover:underline">{{ primaryDomain.name }}</a>
              <span v-else>—</span>
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Freigabestatus</div>
            <div class="text-lg font-bold" :class="overallApprovalColor">{{ overallApprovalText }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Business Case</div>
            <div class="text-sm text-gray-700 mt-1">{{ demand.businessCase || '—' }}</div>
          </div>
        </div>
      </div>

      <!-- AI Use Case / EU AI Act (legacy, shown when compliance is off but AI data exists) -->
      <div v-if="!store.featureToggles.complianceEnabled && demand.isAIUseCase" class="bg-white rounded-xl border border-surface-200 p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span class="text-lg">🤖</span> AI Use Case – EU AI Act Klassifikation
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="text-xs text-gray-500">Risikokategorie</div>
            <span class="inline-block mt-1 text-xs px-2.5 py-1 rounded-full font-medium" :class="aiRiskClass(demand.aiRiskCategory)">{{ demand.aiRiskCategory }}</span>
          </div>
          <div class="md:col-span-2">
            <div class="text-xs text-gray-500">AI-Beschreibung</div>
            <div class="text-sm text-gray-700 mt-1">{{ demand.aiDescription || '—' }}</div>
          </div>
        </div>
        <div v-if="demand.aiRiskCategory === 'Hohes Risiko'" class="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800">
          ⚠️ <strong>Pflichten gemäß EU AI Act:</strong> Konformitätsbewertung, CE-Kennzeichnung, Risikomanagement-System, Daten-Governance, technische Dokumentation, menschliche Aufsicht erforderlich.
        </div>
        <div v-if="demand.aiRiskCategory === 'Unannehmbares Risiko'" class="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800">
          🚫 <strong>Verboten gemäß EU AI Act:</strong> Dieses System fällt unter die verbotenen KI-Praktiken und darf nicht eingesetzt werden.
        </div>
      </div>

      <!-- Compliance / Regulierungen (if compliance enabled and regulations assigned) -->
      <div v-if="store.featureToggles.complianceEnabled && demandRegulations.length > 0" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span class="text-base">⚖️</span> Compliance-Anforderungen ({{ demandRegulations.length }})
          </h3>
          <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Assessment erforderlich</span>
        </div>
        <div class="divide-y divide-surface-100">
          <div v-for="reg in demandRegulations" :key="reg.value" class="px-5 py-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{{ reg.value }}</span>
                <div>
                  <div class="text-sm font-medium text-gray-800">{{ reg.label }}</div>
                  <div class="text-xs text-gray-400">{{ reg.description }}</div>
                </div>
              </div>
              <span v-if="reg.deadline" class="text-[10px] text-gray-400">Deadline: {{ reg.deadline }}</span>
            </div>
            <!-- AI details inline for EUAIACT -->
            <div v-if="reg.value === 'EUAIACT' && demand.aiRiskCategory && demand.aiRiskCategory !== 'Kein AI-Usecase'" class="mt-3 ml-8 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div class="text-[10px] text-gray-500 uppercase">Risikokategorie</div>
                  <span class="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium" :class="aiRiskClass(demand.aiRiskCategory)">{{ demand.aiRiskCategory }}</span>
                </div>
                <div class="md:col-span-2">
                  <div class="text-[10px] text-gray-500 uppercase">KI-Beschreibung</div>
                  <div class="text-xs text-gray-700 mt-0.5">{{ demand.aiDescription || '—' }}</div>
                </div>
              </div>
              <div v-if="demand.aiRiskCategory === 'Hohes Risiko'" class="mt-2 bg-orange-50 border border-orange-200 rounded p-2 text-xs text-orange-800">
                ⚠️ Konformitätsbewertung, CE-Kennzeichnung, Risikomanagement-System, Daten-Governance, technische Dokumentation und menschliche Aufsicht erforderlich.
              </div>
              <div v-if="demand.aiRiskCategory === 'Unannehmbares Risiko'" class="mt-2 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-800">
                🚫 Dieses System fällt unter die verbotenen KI-Praktiken und darf nicht eingesetzt werden.
              </div>
            </div>
          </div>
        </div>
        <div class="px-5 py-3 bg-yellow-50 border-t border-yellow-100 text-xs text-yellow-700">
          ℹ️ Nach Genehmigung dieses Demands wird ein Compliance-Assessment für jede zugewiesene Regulierung auf der zugehörigen Applikation durchgeführt.
        </div>
      </div>
          </div>
        </div>
        <div class="px-5 py-3 bg-yellow-50 border-t border-yellow-100 text-xs text-yellow-700">
          ℹ️ Nach Genehmigung dieses Demands wird ein Compliance-Assessment für jede zugewiesene Regulierung auf der zugehörigen Applikation durchgeführt.
        </div>
      </div>

      <!-- Status Workflow -->
      <div class="bg-white rounded-xl border border-surface-200 p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Status ändern</h3>
        <div class="flex flex-wrap gap-2">
          <button v-for="s in store.data.enums.demandStatus" :key="s"
                  @click="changeStatus(s)"
                  class="px-3 py-1.5 rounded-lg text-xs border transition-colors"
                  :class="demand.status === s ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-700 hover:bg-surface-100'">
            {{ s }}
          </button>
        </div>
      </div>

      <!-- Checklists -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- IT Security -->
        <div class="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div class="px-5 py-3 border-b border-surface-200 flex items-center justify-between" :class="checklistHeaderClass(demand.checklistSecurity)">
            <h3 class="text-sm font-semibold text-gray-700">🔒 IT Security</h3>
            <span class="text-xs font-mono" :class="checklistProgressColor(demand.checklistSecurity)">{{ checklistProgress(demand.checklistSecurity) }}</span>
          </div>
          <div class="px-5 py-3 space-y-2">
            <label class="flex items-center gap-2 text-sm cursor-pointer" @click.prevent="toggleCheck('checklistSecurity', 'dataClassification')">
              <input type="checkbox" :checked="demand.checklistSecurity.dataClassification" class="rounded border-gray-300" />
              <span>Datenklassifikation</span>
            </label>
            <label class="flex items-center gap-2 text-sm cursor-pointer" @click.prevent="toggleCheck('checklistSecurity', 'accessControl')">
              <input type="checkbox" :checked="demand.checklistSecurity.accessControl" class="rounded border-gray-300" />
              <span>Zugriffssteuerung</span>
            </label>
            <label class="flex items-center gap-2 text-sm cursor-pointer" @click.prevent="toggleCheck('checklistSecurity', 'encryptionReview')">
              <input type="checkbox" :checked="demand.checklistSecurity.encryptionReview" class="rounded border-gray-300" />
              <span>Verschlüsselungs-Review</span>
            </label>
            <label class="flex items-center gap-2 text-sm cursor-pointer" @click.prevent="toggleCheck('checklistSecurity', 'vulnerabilityScan')">
              <input type="checkbox" :checked="demand.checklistSecurity.vulnerabilityScan" class="rounded border-gray-300" />
              <span>Schwachstellen-Scan</span>
            </label>
            <div class="pt-2 border-t border-surface-100">
              <label class="block text-xs font-medium text-gray-500 mb-1">Notizen</label>
              <textarea v-model="demand.checklistSecurity.notes" rows="2" class="w-full px-2 py-1 border border-surface-200 rounded text-xs focus:ring-1 focus:ring-primary-300 outline-none resize-vertical"></textarea>
            </div>
          </div>
        </div>

        <!-- Legal / Compliance -->
        <div class="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div class="px-5 py-3 border-b border-surface-200 flex items-center justify-between" :class="checklistHeaderClass(demand.checklistLegal)">
            <h3 class="text-sm font-semibold text-gray-700">⚖️ Legal & Compliance</h3>
            <span class="text-xs font-mono" :class="checklistProgressColor(demand.checklistLegal)">{{ checklistProgress(demand.checklistLegal) }}</span>
          </div>
          <div class="px-5 py-3 space-y-2">
            <label class="flex items-center gap-2 text-sm cursor-pointer" @click.prevent="toggleCheck('checklistLegal', 'dataPrivacy')">
              <input type="checkbox" :checked="demand.checklistLegal.dataPrivacy" class="rounded border-gray-300" />
              <span>Datenschutz-Prüfung</span>
            </label>
            <label class="flex items-center gap-2 text-sm cursor-pointer" @click.prevent="toggleCheck('checklistLegal', 'gdprCompliance')">
              <input type="checkbox" :checked="demand.checklistLegal.gdprCompliance" class="rounded border-gray-300" />
              <span>DSGVO-Konformität</span>
            </label>
            <label class="flex items-center gap-2 text-sm cursor-pointer" @click.prevent="toggleCheck('checklistLegal', 'contractReview')">
              <input type="checkbox" :checked="demand.checklistLegal.contractReview" class="rounded border-gray-300" />
              <span>Vertragsprüfung</span>
            </label>
            <label class="flex items-center gap-2 text-sm cursor-pointer" @click.prevent="toggleCheck('checklistLegal', 'licenseCheck')">
              <input type="checkbox" :checked="demand.checklistLegal.licenseCheck" class="rounded border-gray-300" />
              <span>Lizenz-Prüfung</span>
            </label>
            <div class="pt-2 border-t border-surface-100">
              <label class="block text-xs font-medium text-gray-500 mb-1">Notizen</label>
              <textarea v-model="demand.checklistLegal.notes" rows="2" class="w-full px-2 py-1 border border-surface-200 rounded text-xs focus:ring-1 focus:ring-primary-300 outline-none resize-vertical"></textarea>
            </div>
          </div>
        </div>

        <!-- Architecture -->
        <div class="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div class="px-5 py-3 border-b border-surface-200 flex items-center justify-between" :class="checklistHeaderClass(demand.checklistArchitecture)">
            <h3 class="text-sm font-semibold text-gray-700">🏛️ Architektur</h3>
            <span class="text-xs font-mono" :class="checklistProgressColor(demand.checklistArchitecture)">{{ checklistProgress(demand.checklistArchitecture) }}</span>
          </div>
          <div class="px-5 py-3 space-y-2">
            <label class="flex items-center gap-2 text-sm cursor-pointer" @click.prevent="toggleCheck('checklistArchitecture', 'fitsEAStrategy')">
              <input type="checkbox" :checked="demand.checklistArchitecture.fitsEAStrategy" class="rounded border-gray-300" />
              <span>Passt zur EA-Strategie</span>
            </label>
            <label class="flex items-center gap-2 text-sm cursor-pointer" @click.prevent="toggleCheck('checklistArchitecture', 'integrationReview')">
              <input type="checkbox" :checked="demand.checklistArchitecture.integrationReview" class="rounded border-gray-300" />
              <span>Integrations-Review</span>
            </label>
            <label class="flex items-center gap-2 text-sm cursor-pointer" @click.prevent="toggleCheck('checklistArchitecture', 'technologyApproved')">
              <input type="checkbox" :checked="demand.checklistArchitecture.technologyApproved" class="rounded border-gray-300" />
              <span>Technologie freigegeben</span>
            </label>
            <label class="flex items-center gap-2 text-sm cursor-pointer" @click.prevent="toggleCheck('checklistArchitecture', 'scalabilityCheck')">
              <input type="checkbox" :checked="demand.checklistArchitecture.scalabilityCheck" class="rounded border-gray-300" />
              <span>Skalierbarkeits-Check</span>
            </label>
            <div class="pt-2 border-t border-surface-100">
              <label class="block text-xs font-medium text-gray-500 mb-1">Notizen</label>
              <textarea v-model="demand.checklistArchitecture.notes" rows="2" class="w-full px-2 py-1 border border-surface-200 rounded text-xs focus:ring-1 focus:ring-primary-300 outline-none resize-vertical"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Applications -->
      <div v-if="relatedApps.length" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Betroffene Applikationen ({{ relatedApps.length }})</h3>
        </div>
        <div class="divide-y divide-surface-100">
          <a v-for="app in relatedApps" :key="app.id" :href="linkTo('/apps/' + app.id)"
             class="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono text-gray-400">{{ app.id }}</span>
              <span class="text-sm text-gray-800">{{ app.name }}</span>
            </div>
            <span class="text-xs text-gray-400">{{ app.appType }}</span>
          </a>
        </div>
      </div>

      <!-- Related Vendors -->
      <div v-if="relatedVendors.length" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Betroffene Vendoren ({{ relatedVendors.length }})</h3>
        </div>
        <div class="divide-y divide-surface-100">
          <a v-for="v in relatedVendors" :key="v.id" :href="linkTo('/vendors/' + v.id)"
             class="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono text-gray-400">{{ v.id }}</span>
              <span class="text-sm text-gray-800">{{ v.name }}</span>
            </div>
            <span class="text-xs text-gray-400">{{ v.category }}</span>
          </a>
        </div>
      </div>

      <!-- Edit Modal -->
      <demand-form v-if="showEdit" :edit-demand="demand" @close="showEdit = false" @saved="showEdit = false"></demand-form>
    </div>
    <div v-else class="text-center py-12 text-gray-500">Demand nicht gefunden.</div>
  `,
  setup () {
    const { ref, computed } = Vue
    const showEdit = ref(false)

    const demand = computed(() => store.demandById(router.params.id))

    const primaryDomain = computed(() => {
      if (!demand.value || !demand.value.primaryDomain) return null
      return store.domainById(demand.value.primaryDomain)
    })

    const relatedApps = computed(() => {
      if (!demand.value || !demand.value.relatedApps) return []
      return demand.value.relatedApps.map(id => store.appById(id)).filter(Boolean)
    })

    const relatedVendors = computed(() => {
      if (!demand.value || !demand.value.relatedVendors) return []
      return demand.value.relatedVendors.map(id => store.vendorById(id)).filter(Boolean)
    })

    const demandRegulations = computed(() => {
      if (!demand.value || !demand.value.applicableRegulations) return []
      const allRegs = (store.data.enums && store.data.enums.complianceRegulations) || []
      return demand.value.applicableRegulations.map(val => {
        const meta = allRegs.find(r => r.value === val)
        return meta || { value: val, label: val, description: '' }
      })
    })

    function checklistItems (checklist) {
      if (!checklist) return { total: 0, done: 0 }
      const items = Object.entries(checklist).filter(([k]) => k !== 'notes')
      const done = items.filter(([, v]) => v === true).length
      return { total: items.length, done }
    }

    function checklistProgress (checklist) {
      const { total, done } = checklistItems(checklist)
      return done + '/' + total
    }

    function checklistProgressColor (checklist) {
      const { total, done } = checklistItems(checklist)
      if (done === total) return 'text-green-600'
      if (done > 0) return 'text-yellow-600'
      return 'text-gray-400'
    }

    function checklistHeaderClass (checklist) {
      const { total, done } = checklistItems(checklist)
      if (done === total) return 'bg-green-50'
      if (done > 0) return 'bg-yellow-50'
      return 'bg-surface-50'
    }

    const overallApprovalText = computed(() => {
      if (!demand.value) return '—'
      const checklists = [demand.value.checklistSecurity, demand.value.checklistLegal, demand.value.checklistArchitecture]
      const allDone = checklists.every(cl => {
        const { total, done } = checklistItems(cl)
        return done === total
      })
      const anyStarted = checklists.some(cl => {
        const { done } = checklistItems(cl)
        return done > 0
      })
      if (allDone) return 'Vollständig'
      if (anyStarted) return 'In Arbeit'
      return 'Offen'
    })

    const overallApprovalColor = computed(() => {
      const t = overallApprovalText.value
      if (t === 'Vollständig') return 'text-green-600'
      if (t === 'In Arbeit') return 'text-yellow-600'
      return 'text-gray-400'
    })

    function toggleCheck (checklistName, field) {
      if (!demand.value) return
      demand.value[checklistName][field] = !demand.value[checklistName][field]
    }

    function changeStatus (newStatus) {
      if (demand.value) {
        store.updateDemand(demand.value.id, { status: newStatus })
      }
    }

    function catClass (c) {
      return { 'Idee': 'bg-purple-100 text-purple-700', 'Bereichsvorhaben (< 50k)': 'bg-blue-100 text-blue-700', 'Projekt (> 50k)': 'bg-orange-100 text-orange-700' }[c] || 'bg-gray-100 text-gray-600'
    }
    function statusClass (s) {
      return { 'Eingereicht': 'bg-blue-100 text-blue-700', 'In Bewertung': 'bg-yellow-100 text-yellow-700', 'Genehmigt': 'bg-green-100 text-green-700', 'Abgelehnt': 'bg-red-100 text-red-700', 'In Umsetzung': 'bg-purple-100 text-purple-700', 'Abgeschlossen': 'bg-gray-100 text-gray-600' }[s] || 'bg-gray-100 text-gray-600'
    }
    function prioClass (p) {
      return { 'Hoch': 'bg-red-100 text-red-700', 'Mittel': 'bg-yellow-100 text-yellow-700', 'Niedrig': 'bg-green-100 text-green-700' }[p] || 'bg-gray-100 text-gray-600'
    }

    function aiRiskClass (r) {
      return {
        'Unannehmbares Risiko': 'bg-red-100 text-red-800',
        'Hohes Risiko': 'bg-orange-100 text-orange-800',
        'Begrenztes Risiko': 'bg-yellow-100 text-yellow-800',
        'Minimales Risiko': 'bg-green-100 text-green-800',
        'Kein AI-Usecase': 'bg-gray-100 text-gray-600'
      }[r] || 'bg-gray-100 text-gray-600'
    }

    function confirmDelete () {
      if (demand.value && confirm('Demand "' + demand.value.title + '" löschen? Dies kann nicht rückgängig gemacht werden.')) {
        store.deleteDemand(demand.value.id)
        navigateTo('/demands')
      }
    }

    return { store, router, linkTo, navigateTo, demand, primaryDomain, relatedApps, relatedVendors, demandRegulations, showEdit, checklistProgress, checklistProgressColor, checklistHeaderClass, overallApprovalText, overallApprovalColor, toggleCheck, changeStatus, catClass, statusClass, prioClass, aiRiskClass, confirmDelete }
  }
}
