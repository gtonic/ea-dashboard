// ea-health-score.js — EA Health Score & Automatische Empfehlungen (Feature #21)
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'EaHealthScore',
  template: `
    <div class="space-y-6">
      <!-- Overall Health Score -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <!-- Score Circle -->
          <div class="relative w-40 h-40 shrink-0">
            <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="stroke-surface-200 dark:stroke-surface-700"/>
              <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" stroke-linecap="round"
                      :stroke="scoreColor(healthScore)"
                      :stroke-dasharray="circumference"
                      :stroke-dashoffset="circumference - (circumference * healthScore / 100)"/>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-bold" :class="scoreTextColor(healthScore)">{{ healthScore }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
            </div>
          </div>
          <!-- Description -->
          <div class="flex-1 text-center md:text-left">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">EA Health Score</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Aggregierter Gesundheitszustand der IT-Landschaft</p>
            <div class="mt-3 flex flex-wrap gap-3 justify-center md:justify-start">
              <span class="px-3 py-1 rounded-full text-xs font-medium" :class="scoreBadge(healthScore)">{{ scoreLabel(healthScore) }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span class="font-semibold text-red-600">{{ criticalWarnings.length }}</span> Kritische Warnungen
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span class="font-semibold text-yellow-600">{{ warningWarnings.length }}</span> Hinweise
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sub-Scores -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div v-for="sub in subScores" :key="sub.label" class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ sub.label }}</div>
          <div class="mt-1 text-2xl font-bold" :class="scoreTextColor(sub.score)">{{ sub.score }}</div>
          <div class="mt-1 w-full h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500" :style="{ width: sub.score + '%', backgroundColor: scoreColor(sub.score) }"></div>
          </div>
          <div class="text-xs text-gray-400 mt-1">{{ sub.detail }}</div>
        </div>
      </div>

      <!-- Chart -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Score-Dimensionen</h3>
        <div class="h-72">
          <canvas ref="radarCanvas"></canvas>
        </div>
      </div>

      <!-- Warnings & Recommendations -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Critical Warnings -->
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <h3 class="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">⚠ Kritische Warnungen</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Erfordern sofortige Aufmerksamkeit</p>
          <div v-if="criticalWarnings.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">Keine kritischen Warnungen — alles im grünen Bereich!</div>
          <div v-else class="space-y-3 max-h-80 overflow-y-auto">
            <div v-for="(w, i) in criticalWarnings" :key="'crit-'+i"
                 class="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <div class="flex items-start gap-2">
                <span class="text-red-500 mt-0.5 shrink-0">✗</span>
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ w.title }}</div>
                  <div class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{{ w.description }}</div>
                  <div class="mt-2 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded px-2 py-1 inline-block">
                    💡 {{ w.recommendation }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning Hints -->
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <h3 class="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-1">💡 Hinweise & Empfehlungen</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Verbesserungspotentiale</p>
          <div v-if="warningWarnings.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">Keine Hinweise vorhanden</div>
          <div v-else class="space-y-3 max-h-80 overflow-y-auto">
            <div v-for="(w, i) in warningWarnings" :key="'warn-'+i"
                 class="p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <div class="flex items-start gap-2">
                <span class="text-yellow-500 mt-0.5 shrink-0">⚡</span>
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ w.title }}</div>
                  <div class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{{ w.description }}</div>
                  <div class="mt-2 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded px-2 py-1 inline-block">
                    💡 {{ w.recommendation }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Scorecard Table -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Detaillierte Score-Übersicht</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-surface-200 dark:border-surface-700">
                <th class="py-2 pr-4">Dimension</th>
                <th class="py-2 pr-4 text-center">Score</th>
                <th class="py-2 pr-4">Status</th>
                <th class="py-2 pr-4">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sub in subScores" :key="sub.label" class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800">
                <td class="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">{{ sub.label }}</td>
                <td class="py-2 pr-4 text-center">
                  <span class="text-lg font-bold" :class="scoreTextColor(sub.score)">{{ sub.score }}</span>
                </td>
                <td class="py-2 pr-4">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="scoreBadge(sub.score)">{{ scoreLabel(sub.score) }}</span>
                </td>
                <td class="py-2 pr-4 text-gray-600 dark:text-gray-400 text-xs">{{ sub.detail }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed, onMounted, nextTick } = Vue

    const radarCanvas = ref(null)
    let radarChart = null

    const circumference = 2 * Math.PI * 52

    // ── Score helpers ──

    function scoreColor (score) {
      if (score >= 80) return '#22c55e'
      if (score >= 60) return '#eab308'
      if (score >= 40) return '#f97316'
      return '#ef4444'
    }

    function scoreTextColor (score) {
      if (score >= 80) return 'text-green-600'
      if (score >= 60) return 'text-yellow-600'
      if (score >= 40) return 'text-orange-600'
      return 'text-red-600'
    }

    function scoreBadge (score) {
      if (score >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    }

    function scoreLabel (score) {
      if (score >= 80) return 'Gut'
      if (score >= 60) return 'Akzeptabel'
      if (score >= 40) return 'Verbesserungswürdig'
      return 'Kritisch'
    }

    // ── Sub-score calculations ──

    // 1. Lifecycle Score: % of apps that are Active (vs End-of-Support/End-of-Life)
    const lifecycleScore = computed(() => {
      const apps = store.data.applications
      if (apps.length === 0) return 100
      const active = apps.filter(a => a.lifecycleStatus === 'Active' || a.lifecycleStatus === 'Planned').length
      return Math.round((active / apps.length) * 100)
    })

    // 2. Strategic Alignment: % of apps in Invest/Tolerate (vs Migrate/Eliminate)
    const alignmentScore = computed(() => {
      const apps = store.data.applications
      if (apps.length === 0) return 100
      const aligned = apps.filter(a => a.timeQuadrant === 'Invest' || a.timeQuadrant === 'Tolerate').length
      return Math.round((aligned / apps.length) * 100)
    })

    // 3. Capability Maturity: avg maturity / 5 * 100
    const maturityScore = computed(() => {
      let total = 0
      let count = 0
      store.data.domains.forEach(d => {
        d.capabilities.forEach(c => {
          total += c.maturity || 0
          count++
        })
      })
      if (count === 0) return 0
      return Math.round((total / count / 5) * 100)
    })

    // 4. Vendor Diversity: penalize vendor concentration starting at 30%
    const vendorScore = computed(() => {
      const apps = store.data.applications
      if (apps.length === 0) return 100
      const vendorCounts = {}
      apps.forEach(a => {
        const v = a.vendor || 'Unknown'
        vendorCounts[v] = (vendorCounts[v] || 0) + 1
      })
      const maxConcentration = Math.max(...Object.values(vendorCounts)) / apps.length
      // Score decreases as concentration rises above 30%, reaching 0 at 100%
      return Math.round((1 - Math.max(0, maxConcentration - 0.3) / 0.7) * 100)
    })

    // 5. Data Quality: % of apps with complete data
    const dataQualityScore = computed(() => {
      const apps = store.data.applications
      if (apps.length === 0) return 100
      const complete = apps.filter(a =>
        a.vendor && a.category && a.type && a.criticality && a.timeQuadrant &&
        a.businessOwner && a.itOwner && a.costPerYear != null
      ).length
      return Math.round((complete / apps.length) * 100)
    })

    // ── Overall Score ──
    const healthScore = computed(() => {
      const scores = [lifecycleScore.value, alignmentScore.value, maturityScore.value, vendorScore.value, dataQualityScore.value]
      return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
    })

    // ── Sub-scores array ──
    const subScores = computed(() => [
      { label: 'Lifecycle', score: lifecycleScore.value, detail: 'Anteil aktiver Applikationen' },
      { label: 'Strategie', score: alignmentScore.value, detail: 'TIME-Quadrant Invest/Tolerate Anteil' },
      { label: 'Reifegrad', score: maturityScore.value, detail: 'Durchschnittliche Capability-Maturity' },
      { label: 'Vendor-Diversität', score: vendorScore.value, detail: 'Keine übermäßige Vendor-Konzentration' },
      { label: 'Datenqualität', score: dataQualityScore.value, detail: 'Vollständigkeit der App-Daten' }
    ])

    // ── Warnings & Recommendations ──

    const allWarnings = computed(() => {
      const warnings = []

      // 1. Apps marked "Eliminate" with active projects
      const eliminateApps = store.data.applications.filter(a => a.timeQuadrant === 'Eliminate')
      eliminateApps.forEach(app => {
        const activeProjects = store.data.projects.filter(p =>
          p.status !== 'Abgeschlossen' && p.status !== 'Abgebrochen' &&
          store.data.capabilityMappings
            .filter(m => m.applicationId === app.id)
            .some(m => (p.capabilities || []).includes(m.capabilityId))
        )
        if (activeProjects.length > 0) {
          warnings.push({
            severity: 'critical',
            title: `"${app.name}" ist auf Eliminate, hat aber aktive Projekte`,
            description: `${activeProjects.length} Projekt(e) investieren in Capabilities dieser App: ${activeProjects.map(p => p.name).join(', ')}`,
            recommendation: `Prüfen, ob Projekte auf alternative Applikationen umgestellt werden können oder Eliminate-Entscheidung überdenken.`
          })
        }
      })

      // 2. Low-maturity capabilities without investment
      store.data.domains.forEach(d => {
        d.capabilities.forEach(c => {
          if ((c.maturity || 0) <= 2 && (c.criticality === 'High' || c.criticality === 'Hoch')) {
            const hasProject = store.data.projects.some(p =>
              (p.capabilities || []).includes(c.id) &&
              p.status !== 'Abgeschlossen' && p.status !== 'Abgebrochen'
            )
            if (!hasProject) {
              warnings.push({
                severity: 'critical',
                title: `Capability "${c.name}" hat niedrige Maturity (${c.maturity}/5) ohne Investment`,
                description: `Hohe Kritikalität, aber kein aktives Projekt zur Verbesserung. Domäne: ${d.name}`,
                recommendation: `Investmentbedarf prüfen — ein Modernisierungsprojekt für diese Capability initiieren.`
              })
            }
          }
        })
      })

      // 3. Single-vendor clustering risks
      const vendorApps = {}
      store.data.applications.forEach(a => {
        const v = a.vendor || 'Unknown'
        if (!vendorApps[v]) vendorApps[v] = []
        vendorApps[v].push(a)
      })
      Object.entries(vendorApps).forEach(([vendor, apps]) => {
        const missionCritical = apps.filter(a => a.criticality === 'Mission-Critical')
        if (missionCritical.length >= 2) {
          warnings.push({
            severity: 'warning',
            title: `Vendor-Klumpenrisiko: ${vendor}`,
            description: `${missionCritical.length} mission-critical Applikationen beim selben Vendor: ${missionCritical.map(a => a.name).join(', ')}`,
            recommendation: `Multi-Vendor-Strategie evaluieren oder Notfall-/Exit-Strategie für diesen Vendor definieren.`
          })
        }
      })

      // 4. End-of-Life / End-of-Support apps still active
      store.data.applications.forEach(app => {
        if (app.lifecycleStatus === 'End-of-Life') {
          warnings.push({
            severity: 'critical',
            title: `"${app.name}" hat End-of-Life Status`,
            description: `Diese Applikation hat End-of-Life erreicht und sollte zeitnah abgelöst werden.`,
            recommendation: `Migrationsprojekt starten oder Ablösestrategie definieren.`
          })
        } else if (app.lifecycleStatus === 'End-of-Support') {
          warnings.push({
            severity: 'warning',
            title: `"${app.name}" hat End-of-Support Status`,
            description: `Kein Vendor-Support mehr verfügbar — erhöhtes Betriebsrisiko.`,
            recommendation: `Upgrade oder Migration planen, um wieder in Support-Status zu gelangen.`
          })
        }
      })

      // 5. Capability gaps without projects
      store.data.domains.forEach(d => {
        d.capabilities.forEach(c => {
          const gap = (c.targetMaturity || c.maturity) - (c.maturity || 0)
          if (gap >= 2) {
            const hasProject = store.data.projects.some(p =>
              (p.capabilities || []).includes(c.id)
            )
            if (!hasProject) {
              warnings.push({
                severity: 'warning',
                title: `Großer Maturity-Gap bei "${c.name}" (Gap: ${gap})`,
                description: `Ist: ${c.maturity}/5, Soll: ${c.targetMaturity}/5. Kein Projekt adressiert diese Lücke. Domäne: ${d.name}`,
                recommendation: `Projekt zur Schließung des Maturity-Gaps initiieren oder Ziel-Maturity überprüfen.`
              })
            }
          }
        })
      })

      // 6. Apps without capability mapping ("Shadow IT indicator")
      store.data.applications.forEach(app => {
        const hasMapping = store.data.capabilityMappings.some(m => m.applicationId === app.id)
        if (!hasMapping) {
          warnings.push({
            severity: 'warning',
            title: `"${app.name}" hat kein Capability-Mapping`,
            description: `Diese Applikation ist keiner Business Capability zugeordnet — Schatten-IT-Indikator.`,
            recommendation: `Capability-Mapping ergänzen oder prüfen, ob die Applikation noch benötigt wird.`
          })
        }
      })

      return warnings.sort((a, b) => {
        const order = { critical: 0, warning: 1 }
        return (order[a.severity] || 1) - (order[b.severity] || 1)
      })
    })

    const criticalWarnings = computed(() => allWarnings.value.filter(w => w.severity === 'critical'))
    const warningWarnings = computed(() => allWarnings.value.filter(w => w.severity === 'warning'))

    // ── Chart ──

    function renderChart () {
      if (typeof Chart === 'undefined') return
      if (!radarCanvas.value) return
      if (radarChart) radarChart.destroy()

      const scores = subScores.value
      radarChart = new Chart(radarCanvas.value, {
        type: 'radar',
        data: {
          labels: scores.map(s => s.label),
          datasets: [{
            label: 'Health Score',
            data: scores.map(s => s.score),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            borderWidth: 2,
            pointBackgroundColor: scores.map(s => scoreColor(s.score)),
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: { stepSize: 25 },
              pointLabels: { font: { size: 11 } }
            }
          },
          plugins: { legend: { display: false } }
        }
      })
    }

    onMounted(() => { nextTick(renderChart) })

    return {
      store, linkTo,
      radarCanvas,
      circumference,
      healthScore, subScores,
      criticalWarnings, warningWarnings,
      scoreColor, scoreTextColor, scoreBadge, scoreLabel
    }
  }
}
