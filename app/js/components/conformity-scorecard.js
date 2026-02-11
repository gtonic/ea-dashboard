// conformity-scorecard.js — Strategische Konformitäts-Scorecard (Feature #15)
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'ConformityScorecard',
  template: `
    <div class="space-y-6">
      <!-- Overall Score -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">EA Conformity Score</div>
          <div class="mt-1 text-2xl font-bold" :class="overallScoreColor">{{ overallScore }}%</div>
          <div class="text-xs text-gray-400 mt-1">Gesamtlandschaft</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Konforme Projekte</div>
          <div class="mt-1 text-2xl font-bold text-green-600">{{ conformCount }}</div>
          <div class="text-xs text-gray-400 mt-1">von {{ totalProjects }} Projekten</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Teilkonform</div>
          <div class="mt-1 text-2xl font-bold text-yellow-600">{{ partialCount }}</div>
          <div class="text-xs text-gray-400 mt-1">Nachbesserung nötig</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Widerspricht</div>
          <div class="mt-1 text-2xl font-bold text-red-600">{{ conflictCount }}</div>
          <div class="text-xs text-gray-400 mt-1">EA-Prinzipien verletzt</div>
        </div>
      </div>

      <!-- Domain Conformity Overview -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Konformität pro Domäne</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Projekte nach EA-Konformität pro Domäne</p>
        <div v-if="domainScores.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">Keine Projekte mit Konformitäts-Bewertung vorhanden</div>
        <div v-else class="space-y-4">
          <div v-for="ds in domainScores" :key="ds.domainId" class="space-y-1">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded" :style="{ backgroundColor: ds.color }"></span>
                <a :href="linkTo('/domains/' + ds.domainId)" class="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600">{{ ds.domainName }}</a>
              </div>
              <div class="flex items-center gap-3 text-xs">
                <span class="text-green-600 font-semibold">{{ ds.conformCount }} Konform</span>
                <span class="text-yellow-600 font-semibold">{{ ds.partialCount }} Teilkonform</span>
                <span class="text-red-600 font-semibold">{{ ds.conflictCount }} Widerspricht</span>
                <span class="font-bold" :class="scoreColor(ds.score)">{{ ds.score }}%</span>
              </div>
            </div>
            <div class="w-full h-3 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden flex">
              <div class="h-full bg-green-500 transition-all duration-500" :style="{ width: ds.conformPct + '%' }"></div>
              <div class="h-full bg-yellow-400 transition-all duration-500" :style="{ width: ds.partialPct + '%' }"></div>
              <div class="h-full bg-red-500 transition-all duration-500" :style="{ width: ds.conflictPct + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart + Conformity Detail -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Chart -->
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Konformitätsverteilung</h3>
          <div class="h-72 flex items-center justify-center">
            <canvas ref="conformityCanvas"></canvas>
          </div>
          <div class="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500 dark:text-gray-400">
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-green-500"></span> Konform</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-yellow-400"></span> Teilkonform</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-red-500"></span> Widerspricht</span>
          </div>
        </div>

        <!-- Domain Score Radar -->
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Domänen-Score</h3>
          <div class="h-72">
            <canvas ref="radarCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Projects Table -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Projekt-Konformitäts-Übersicht</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-surface-200 dark:border-surface-700">
                <th class="py-2 pr-4">Projekt</th>
                <th class="py-2 pr-4">Domäne</th>
                <th class="py-2 pr-4">Kategorie</th>
                <th class="py-2 pr-4 text-right">Budget</th>
                <th class="py-2 pr-4">Konformität</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in sortedProjects" :key="p.id" class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800">
                <td class="py-2 pr-4">
                  <a :href="linkTo('/projects/' + p.id)" class="text-primary-600 hover:underline font-medium">{{ p.name }}</a>
                </td>
                <td class="py-2 pr-4">
                  <span v-if="domainForProject(p)" class="text-xs px-2 py-0.5 rounded-full"
                        :style="{ backgroundColor: domainForProject(p).color + '20', color: domainForProject(p).color }">{{ domainForProject(p).name }}</span>
                  <span v-else class="text-xs text-gray-400">—</span>
                </td>
                <td class="py-2 pr-4 text-gray-600 dark:text-gray-400">{{ p.category || '—' }}</td>
                <td class="py-2 pr-4 text-right">{{ formatCurrency(p.budget) }}</td>
                <td class="py-2 pr-4">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="conformityBadge(p.conformity)">{{ p.conformity || 'Nicht bewertet' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed, onMounted, nextTick } = Vue

    const conformityCanvas = ref(null)
    const radarCanvas = ref(null)
    let conformityChart = null
    let radarChart = null

    // ── Helpers ──

    function formatCurrency (val) {
      if (!val && val !== 0) return '—'
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
    }

    function conformityBadge (conformity) {
      const map = {
        'Konform': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        'Teilkonform': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
        'Widerspricht': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      }
      return map[conformity] || 'bg-surface-200 dark:bg-surface-700 text-gray-600 dark:text-gray-400'
    }

    function domainForProject (p) {
      if (!p.primaryDomain) return null
      return store.data.domains.find(d => d.id === p.primaryDomain)
    }

    function scoreColor (score) {
      if (score >= 80) return 'text-green-600'
      if (score >= 60) return 'text-yellow-600'
      return 'text-red-600'
    }

    // ── Data ──

    const projects = computed(() => store.data.projects || [])
    const totalProjects = computed(() => projects.value.length)

    const conformCount = computed(() => projects.value.filter(p => p.conformity === 'Konform').length)
    const partialCount = computed(() => projects.value.filter(p => p.conformity === 'Teilkonform').length)
    const conflictCount = computed(() => projects.value.filter(p => p.conformity === 'Widerspricht').length)

    const overallScore = computed(() => {
      const total = projects.value.length
      if (total === 0) return 0
      // Konform = 100%, Teilkonform = 50%, Widerspricht = 0%, unrated = 50%
      const score = projects.value.reduce((s, p) => {
        if (p.conformity === 'Konform') return s + 100
        if (p.conformity === 'Teilkonform') return s + 50
        if (p.conformity === 'Widerspricht') return s + 0
        return s + 50 // unrated
      }, 0)
      return Math.round(score / total)
    })

    const overallScoreColor = computed(() => scoreColor(overallScore.value))

    // ── Per-Domain Scores ──

    const domainScores = computed(() => {
      return store.data.domains.map(d => {
        const domainProjects = projects.value.filter(p =>
          p.primaryDomain === d.id ||
          (p.secondaryDomains && p.secondaryDomains.includes(d.id))
        )
        const total = domainProjects.length
        const conformC = domainProjects.filter(p => p.conformity === 'Konform').length
        const partialC = domainProjects.filter(p => p.conformity === 'Teilkonform').length
        const conflictC = domainProjects.filter(p => p.conformity === 'Widerspricht').length

        const score = total > 0 ? Math.round(domainProjects.reduce((s, p) => {
          if (p.conformity === 'Konform') return s + 100
          if (p.conformity === 'Teilkonform') return s + 50
          if (p.conformity === 'Widerspricht') return s + 0
          return s + 50
        }, 0) / total) : 0

        return {
          domainId: d.id,
          domainName: d.name,
          color: d.color,
          total,
          conformCount: conformC,
          partialCount: partialC,
          conflictCount: conflictC,
          conformPct: total > 0 ? Math.round((conformC / total) * 100) : 0,
          partialPct: total > 0 ? Math.round((partialC / total) * 100) : 0,
          conflictPct: total > 0 ? Math.round((conflictC / total) * 100) : 0,
          score
        }
      }).filter(d => d.total > 0).sort((a, b) => b.score - a.score)
    })

    // ── Sorted projects ──

    const sortedProjects = computed(() => {
      const order = { 'Widerspricht': 0, 'Teilkonform': 1, 'Konform': 2 }
      return [...projects.value].sort((a, b) => {
        const oa = order[a.conformity] ?? 1.5
        const ob = order[b.conformity] ?? 1.5
        return oa - ob
      })
    })

    // ── Charts ──

    function renderCharts () {
      if (typeof Chart === 'undefined') return

      // Donut chart
      if (conformityCanvas.value) {
        if (conformityChart) conformityChart.destroy()
        conformityChart = new Chart(conformityCanvas.value, {
          type: 'doughnut',
          data: {
            labels: ['Konform', 'Teilkonform', 'Widerspricht', 'Nicht bewertet'],
            datasets: [{
              data: [
                conformCount.value,
                partialCount.value,
                conflictCount.value,
                totalProjects.value - conformCount.value - partialCount.value - conflictCount.value
              ],
              backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#d1d5db'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } }
            }
          }
        })
      }

      // Radar chart for domain scores
      if (radarCanvas.value && domainScores.value.length > 0) {
        if (radarChart) radarChart.destroy()
        const ds = domainScores.value
        radarChart = new Chart(radarCanvas.value, {
          type: 'radar',
          data: {
            labels: ds.map(d => d.domainName.length > 20 ? d.domainName.substring(0, 20) + '…' : d.domainName),
            datasets: [{
              label: 'Konformitäts-Score (%)',
              data: ds.map(d => d.score),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              borderWidth: 2,
              pointBackgroundColor: '#3b82f6',
              pointRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { r: { min: 0, max: 100, ticks: { stepSize: 25 } } },
            plugins: { legend: { display: false } }
          }
        })
      }
    }

    onMounted(() => { nextTick(renderCharts) })

    return {
      store, linkTo,
      conformityCanvas, radarCanvas,
      projects, totalProjects,
      conformCount, partialCount, conflictCount,
      overallScore, overallScoreColor,
      domainScores, sortedProjects,
      formatCurrency, conformityBadge, domainForProject, scoreColor
    }
  }
}
