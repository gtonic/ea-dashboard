// scenario-planner.js — What-If Analysis: Project cancellation & App retirement impact simulation
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'ScenarioPlanner',
  template: `
    <div class="space-y-6">

      <!-- Intro -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Szenario-Planung / What-If-Analyse</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">Simulieren Sie die Auswirkungen strategischer Entscheidungen auf Ihre IT-Landschaft. Wählen Sie ein Szenario-Typ und ein Zielobjekt, um die Auswirkungsanalyse zu starten.</p>
      </div>

      <!-- Scenario Selector -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Scenario Type -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Szenario-Typ</label>
            <select v-model="scenarioType"
                    class="w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2 text-gray-900 dark:text-gray-100">
              <option value="">— Bitte wählen —</option>
              <option value="cancelProject">Projekt streichen</option>
              <option value="retireApp">Applikation ablösen</option>
              <option v-if="store.featureToggles.skillImpactEnabled" value="skillLoss">Fachkräfte-Verlust</option>
            </select>
          </div>

          <!-- Target Object -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Zielobjekt</label>
            <select v-model="targetId"
                    class="w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2 text-gray-900 dark:text-gray-100"
                    :disabled="!scenarioType">
              <option value="">— Bitte wählen —</option>
              <template v-if="scenarioType === 'cancelProject'">
                <option v-for="p in activeProjects" :key="p.id" :value="p.id">{{ p.id }} – {{ p.name }}</option>
              </template>
              <template v-if="scenarioType === 'retireApp'">
                <option v-for="a in activeApps" :key="a.id" :value="a.id">{{ a.id }} – {{ a.name }}</option>
              </template>
              <template v-if="scenarioType === 'skillLoss'">
                <option v-for="s in availableSkills" :key="s" :value="s">{{ s }}</option>
              </template>
            </select>
          </div>

          <!-- Skill Loss Count -->
          <div v-if="scenarioType === 'skillLoss'">
            <label class="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Anzahl Abgänge</label>
            <input v-model.number="skillLossCount" type="number" min="1" max="10"
                   class="w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm px-3 py-2 text-gray-900 dark:text-gray-100" />
          </div>

          <!-- Analyze Button -->
          <div class="flex items-end">
            <button @click="runAnalysis"
                    :disabled="!scenarioType || !targetId"
                    class="w-full px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Auswirkung analysieren
            </button>
          </div>
        </div>
      </div>

      <!-- Analysis Results -->
      <template v-if="analysisResult">

        <!-- Scenario Summary Card -->
        <div class="bg-white dark:bg-surface-900 rounded-xl border-2 p-6"
             :class="analysisResult.severity === 'high' ? 'border-red-400' : analysisResult.severity === 'medium' ? 'border-yellow-400' : 'border-green-400'">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                 :class="analysisResult.severity === 'high' ? 'bg-red-100 text-red-600' : analysisResult.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="analysisResult.severity === 'high'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                <path v-else-if="analysisResult.severity === 'medium'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ analysisResult.title }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ analysisResult.summary }}</p>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div v-for="kpi in analysisResult.kpis" :key="kpi.label" class="text-center">
                  <div class="text-xl font-bold" :class="kpi.color">{{ kpi.value }}</div>
                  <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase">{{ kpi.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Impact: Maturity Gaps (for Cancel Project) -->
        <div v-if="analysisResult.maturityImpacts && analysisResult.maturityImpacts.length > 0"
             class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Auswirkung auf Maturity-Gaps</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Capabilities die durch das Streichen des Projekts nicht mehr verbessert würden</p>
          <div class="space-y-2">
            <div v-for="mi in analysisResult.maturityImpacts" :key="mi.capId"
                 class="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <div class="w-8 h-8 rounded-lg bg-orange-200 text-orange-700 flex items-center justify-center text-xs font-bold shrink-0">
                {{ mi.current }}/{{ mi.target }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ mi.capName }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ mi.domainName }} · Gap: {{ mi.gap }} Stufen</div>
              </div>
              <div class="text-xs font-semibold text-orange-600">Verbesserung gefährdet</div>
            </div>
          </div>
        </div>

        <!-- Impact: Dependent Projects (for Cancel Project) -->
        <div v-if="analysisResult.dependentProjects && analysisResult.dependentProjects.length > 0"
             class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Abhängige Projekte – Kaskadeneffekt</h2>
          <div class="space-y-2">
            <a v-for="dp in analysisResult.dependentProjects" :key="dp.id"
               :href="linkTo('/projects/' + dp.id)"
               class="flex items-center justify-between p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <div class="flex items-center gap-3">
                <span class="w-2.5 h-2.5 rounded-full shrink-0"
                      :class="dp.status === 'green' ? 'bg-green-500' : dp.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'"></span>
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ dp.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ dp.depType }} · {{ dp.depDescription }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatBudget(dp.budget) }}</div>
                <div class="text-xs text-gray-400">{{ dp.start }} – {{ dp.end }}</div>
              </div>
            </a>
          </div>
        </div>

        <!-- Impact: Affected Capabilities (for Retire App) -->
        <div v-if="analysisResult.affectedCapabilities && analysisResult.affectedCapabilities.length > 0"
             class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Betroffene Capabilities</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Capabilities die diese Applikation aktuell unterstützen</p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="cap in analysisResult.affectedCapabilities" :key="cap.capId"
                 class="p-3 rounded-lg border"
                 :class="cap.alternativeCount === 0 ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ cap.capName }}</span>
                <span class="text-xs px-1.5 py-0.5 rounded-full"
                      :class="cap.alternativeCount === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'">
                  {{ cap.alternativeCount === 0 ? 'Keine Alternative' : cap.alternativeCount + ' Alternative(n)' }}
                </span>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ cap.domainName }} · Rolle: {{ cap.role }}</div>
            </div>
          </div>
        </div>

        <!-- Impact: Affected Projects (for Retire App) -->
        <div v-if="analysisResult.affectedProjects && analysisResult.affectedProjects.length > 0"
             class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Betroffene Projekte</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Projekte die diese Applikation referenzieren</p>
          <div class="space-y-2">
            <a v-for="proj in analysisResult.affectedProjects" :key="proj.id"
               :href="linkTo('/projects/' + proj.id)"
               class="flex items-center justify-between p-3 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
              <div class="flex items-center gap-3">
                <span class="w-2.5 h-2.5 rounded-full shrink-0"
                      :class="proj.status === 'green' ? 'bg-green-500' : proj.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'"></span>
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ proj.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Aktion: {{ proj.action }} · {{ proj.start }} – {{ proj.end }}</div>
                </div>
              </div>
              <div class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ formatBudget(proj.budget) }}</div>
            </a>
          </div>
        </div>

        <!-- Impact: Affected Processes (for Retire App) -->
        <div v-if="analysisResult.affectedProcesses && analysisResult.affectedProcesses.length > 0"
             class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Betroffene E2E-Prozesse</h2>
          <div class="space-y-2">
            <a v-for="proc in analysisResult.affectedProcesses" :key="proc.id"
               :href="linkTo('/processes/' + proc.id)"
               class="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
              <svg class="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <div>
                <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ proc.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ proc.owner || '—' }}</div>
              </div>
            </a>
          </div>
        </div>

        <!-- Impact: Affected Integrations (for Retire App) -->
        <div v-if="analysisResult.affectedIntegrations && analysisResult.affectedIntegrations.length > 0"
             class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Betroffene Integrationen</h2>
          <div class="space-y-2">
            <div v-for="integ in analysisResult.affectedIntegrations" :key="integ.id"
                 class="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800">
              <svg class="w-5 h-5 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ integ.sourceName }} → {{ integ.targetName }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ integ.type || '—' }} · {{ integ.description || '—' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Impact: Skill Loss (for Skill Loss scenario) -->
        <div v-if="analysisResult.skillImpacts && analysisResult.skillImpacts.length > 0"
             class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Betroffene Applikationen</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Applikationen die durch den Fachkräfte-Verlust betroffen wären</p>
          <div class="space-y-2">
            <a v-for="si in analysisResult.skillImpacts" :key="si.appId"
               :href="linkTo('/apps/' + si.appId)"
               class="flex items-center justify-between p-3 rounded-lg border hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
               :class="si.severity === 'critical' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : si.severity === 'high' ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                     :class="si.severity === 'critical' ? 'bg-red-200 text-red-700' : si.severity === 'high' ? 'bg-orange-200 text-orange-700' : 'bg-yellow-200 text-yellow-700'">
                  {{ si.remainingHeadcount }}/{{ si.currentHeadcount }}
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ si.appName }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ si.criticality }} · Schlüsselpersonen: {{ si.keyPersons.join(', ') }}</div>
                </div>
              </div>
              <div class="text-right shrink-0">
                <span class="text-xs font-semibold px-2 py-1 rounded-full"
                      :class="si.severity === 'critical' ? 'bg-red-100 text-red-700' : si.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'">
                  {{ si.severity === 'critical' ? 'Kritisch – kein Personal' : si.severity === 'high' ? 'Hoch – 1 Person verbleibend' : 'Mittel' }}
                </span>
                <div class="text-xs text-gray-400 mt-1">{{ si.outsourceable ? '✓ Outsourcing möglich' : '✗ Nicht outsourcebar' }}</div>
              </div>
            </a>
          </div>
        </div>

      </template>

      <!-- Saved Scenarios -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Gespeicherte Szenarien</h2>
          <button v-if="analysisResult"
                  @click="saveScenario"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors">
            Aktuelles Szenario speichern
          </button>
        </div>
        <div v-if="savedScenarios.length === 0" class="text-sm text-gray-500 italic">Noch keine Szenarien gespeichert. Führen Sie eine Analyse durch und speichern Sie das Ergebnis.</div>
        <div v-else class="space-y-2">
          <div v-for="(sc, idx) in savedScenarios" :key="idx"
               class="flex items-center justify-between p-3 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800">
            <div class="flex items-center gap-3 cursor-pointer flex-1 min-w-0" @click="loadScenario(sc)">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                   :class="sc.severity === 'high' ? 'bg-red-100 text-red-600' : sc.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="min-w-0">
                <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ sc.title }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ sc.type === 'cancelProject' ? 'Projekt streichen' : sc.type === 'skillLoss' ? 'Fachkräfte-Verlust' : 'App ablösen' }} · {{ sc.savedAt }}</div>
              </div>
            </div>
            <button @click="deleteScenario(idx)"
                    class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    title="Szenario löschen">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  setup () {
    const { computed, ref } = Vue

    const scenarioType = ref('')
    const targetId = ref('')
    const analysisResult = ref(null)
    const savedScenarios = ref(JSON.parse(localStorage.getItem('ea-scenarios') || '[]'))

    const activeProjects = computed(() => (store.data.projects || []).filter(p => p.status !== 'completed'))
    const activeApps = computed(() => (store.data.applications || []).filter(a => a.lifecycleStatus !== 'End-of-Life'))
    const skillLossCount = ref(2)
    const availableSkills = computed(() => store.skillSummary.map(s => s.skill).sort())

    const depTypes = {
      T: 'Technische Abhängigkeit',
      D: 'Datenabhängigkeit',
      P: 'Plattformabhängigkeit',
      R: 'Ressourcenkonflikt',
      F: 'Fachliche Abhängigkeit',
      Z: 'Zeitliche Abhängigkeit'
    }

    function runAnalysis () {
      if (scenarioType.value === 'cancelProject') {
        analysisResult.value = analyzeCancelProject(targetId.value)
      } else if (scenarioType.value === 'retireApp') {
        analysisResult.value = analyzeRetireApp(targetId.value)
      } else if (scenarioType.value === 'skillLoss') {
        analysisResult.value = analyzeSkillLoss(targetId.value, skillLossCount.value)
      }
    }

    function analyzeCancelProject (projectId) {
      const project = store.projectById(projectId)
      if (!project) return null

      // 1. Find dependent projects (projects that depend on this one)
      const deps = (store.data.projectDependencies || [])
        .filter(d => d.targetProjectId === projectId)
      const dependentProjects = deps.map(d => {
        const p = store.projectById(d.sourceProjectId)
        return p ? {
          ...p,
          depType: depTypes[d.type] || d.type,
          depDescription: d.description || ''
        } : null
      }).filter(Boolean)

      // 2. Maturity gaps that this project addresses (via capabilities)
      const maturityImpacts = (project.capabilities || []).map(capId => {
        const cap = store.capabilityById(capId)
        if (!cap) return null
        const gap = (cap.targetMaturity || cap.maturity) - cap.maturity
        if (gap <= 0) return null
        return {
          capId: cap.id,
          capName: cap.name,
          domainName: cap.domain ? cap.domain.name : '',
          current: cap.maturity,
          target: cap.targetMaturity || cap.maturity,
          gap
        }
      }).filter(Boolean)

      // 3. Calculate severity
      const totalBudgetAtRisk = dependentProjects.reduce((s, p) => s + (p.budget || 0), 0) + (project.budget || 0)
      const severity = dependentProjects.length >= 3 || maturityImpacts.length >= 3 ? 'high'
        : dependentProjects.length >= 1 || maturityImpacts.length >= 1 ? 'medium' : 'low'

      return {
        type: 'cancelProject',
        targetId: projectId,
        title: `Szenario: "${project.name}" streichen`,
        summary: `Streichung des Projekts würde ${dependentProjects.length} abhängige(s) Projekt(e) und ${maturityImpacts.length} Capability-Verbesserung(en) gefährden.`,
        severity,
        kpis: [
          { label: 'Budget freigesetzt', value: formatBudget(project.budget), color: 'text-green-600' },
          { label: 'Budget gefährdet', value: formatBudget(totalBudgetAtRisk), color: 'text-red-600' },
          { label: 'Abhängige Projekte', value: dependentProjects.length, color: dependentProjects.length > 0 ? 'text-red-600' : 'text-green-600' },
          { label: 'Maturity-Gaps', value: maturityImpacts.length, color: maturityImpacts.length > 0 ? 'text-orange-600' : 'text-green-600' }
        ],
        dependentProjects,
        maturityImpacts
      }
    }

    function analyzeRetireApp (appId) {
      const app = store.appById(appId)
      if (!app) return null

      // 1. Affected capabilities (via mappings)
      const cappings = store.capabilitiesForApp(appId)
      const affectedCapabilities = cappings.map(cap => {
        // Count alternative apps for this capability
        const otherApps = store.appsForCapability(cap.id).filter(a => a.id !== appId)
        return {
          capId: cap.id,
          capName: cap.name,
          domainName: cap.domain ? cap.domain.name : '',
          role: cap.role || 'Primary',
          alternativeCount: otherApps.length
        }
      })

      // 2. Affected projects
      const affectedProjects = (store.data.projects || [])
        .filter(p => p.affectedApps && p.affectedApps.some(aa => aa.appId === appId))
        .map(p => {
          const aa = p.affectedApps.find(a => a.appId === appId)
          return { ...p, action: aa ? aa.action : '' }
        })

      // 3. Affected E2E processes
      const affectedProcesses = store.processesForApp(appId)

      // 4. Affected integrations
      const affectedIntegrations = store.integrationsForApp(appId).map(integ => {
        const src = store.appById(integ.sourceAppId)
        const tgt = store.appById(integ.targetAppId)
        return {
          ...integ,
          sourceName: src ? src.name : integ.sourceAppId,
          targetName: tgt ? tgt.name : integ.targetAppId
        }
      })

      // 5. Calculate severity
      const noAlternative = affectedCapabilities.filter(c => c.alternativeCount === 0).length
      const severity = noAlternative >= 2 || affectedProjects.length >= 3 ? 'high'
        : noAlternative >= 1 || affectedProjects.length >= 1 ? 'medium' : 'low'

      return {
        type: 'retireApp',
        targetId: appId,
        title: `Szenario: "${app.name}" ablösen`,
        summary: `Ablösung würde ${affectedCapabilities.length} Capability(s), ${affectedProjects.length} Projekt(e), ${affectedProcesses.length} Prozess(e) und ${affectedIntegrations.length} Integration(en) betreffen.`,
        severity,
        kpis: [
          { label: 'Kosten eingespart', value: formatBudget(app.costPerYear) + '/a', color: 'text-green-600' },
          { label: 'Ohne Alternative', value: noAlternative, color: noAlternative > 0 ? 'text-red-600' : 'text-green-600' },
          { label: 'Betroffene Projekte', value: affectedProjects.length, color: affectedProjects.length > 0 ? 'text-orange-600' : 'text-green-600' },
          { label: 'Integrationen', value: affectedIntegrations.length, color: affectedIntegrations.length > 0 ? 'text-orange-600' : 'text-green-600' }
        ],
        affectedCapabilities,
        affectedProjects,
        affectedProcesses,
        affectedIntegrations
      }
    }

    function analyzeSkillLoss (skill, count) {
      const skillImpacts = store.skillLossImpact(skill, count)
      if (!skillImpacts.length) return null

      const criticalCount = skillImpacts.filter(i => i.severity === 'critical').length
      const highCount = skillImpacts.filter(i => i.severity === 'high').length
      const outsourceableCount = skillImpacts.filter(i => i.outsourceable).length
      const severity = criticalCount >= 2 ? 'high' : criticalCount >= 1 || highCount >= 2 ? 'medium' : 'low'

      return {
        type: 'skillLoss',
        targetId: skill,
        title: `Szenario: ${count} "${skill}"-Fachkräfte verlieren`,
        summary: `Verlust von ${count} ${skill}-Spezialist(en) würde ${skillImpacts.length} Applikation(en) betreffen. ${criticalCount} ohne verbleibendes Personal, ${outsourceableCount} outsourcebar.`,
        severity,
        kpis: [
          { label: 'Betroffene Apps', value: skillImpacts.length, color: skillImpacts.length > 0 ? 'text-orange-600' : 'text-green-600' },
          { label: 'Kritisch (0 verbl.)', value: criticalCount, color: criticalCount > 0 ? 'text-red-600' : 'text-green-600' },
          { label: 'Outsourcebar', value: outsourceableCount, color: 'text-blue-600' },
          { label: 'Nicht outsourcebar', value: skillImpacts.length - outsourceableCount, color: outsourceableCount < skillImpacts.length ? 'text-red-600' : 'text-green-600' }
        ],
        skillImpacts
      }
    }

    function formatBudget (val) {
      if (!val && val !== 0) return '—'
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
    }

    function saveScenario () {
      if (!analysisResult.value) return
      const sc = {
        ...analysisResult.value,
        savedAt: new Date().toLocaleDateString('de-AT')
      }
      savedScenarios.value.push(sc)
      localStorage.setItem('ea-scenarios', JSON.stringify(savedScenarios.value))
    }

    function loadScenario (sc) {
      scenarioType.value = sc.type
      targetId.value = sc.targetId
      analysisResult.value = sc
    }

    function deleteScenario (idx) {
      savedScenarios.value.splice(idx, 1)
      localStorage.setItem('ea-scenarios', JSON.stringify(savedScenarios.value))
    }

    // Watch scenario type changes to reset target
    Vue.watch(scenarioType, () => {
      targetId.value = ''
      analysisResult.value = null
    })

    return {
      store, linkTo,
      scenarioType, targetId, analysisResult, savedScenarios,
      activeProjects, activeApps, availableSkills, skillLossCount,
      runAnalysis, formatBudget,
      saveScenario, loadScenario, deleteScenario
    }
  }
}
