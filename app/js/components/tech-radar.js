// tech-radar.js — Technologie-Radar (Feature #9)
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'TechRadar',
  template: `
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Technologien</div>
          <div class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ allTechnologies.length }}</div>
          <div class="text-xs text-gray-400 mt-1">Gesamt identifiziert</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Adopt</div>
          <div class="mt-1 text-2xl font-bold text-green-600">{{ adoptCount }}</div>
          <div class="text-xs text-gray-400 mt-1">Strategisch empfohlen</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Hold</div>
          <div class="mt-1 text-2xl font-bold text-red-600">{{ holdCount }}</div>
          <div class="text-xs text-gray-400 mt-1">Ablösung empfohlen</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Plattformen</div>
          <div class="mt-1 text-2xl font-bold text-primary-700 dark:text-primary-400">{{ platformCount }}</div>
          <div class="text-xs text-gray-400 mt-1">Unterschiedliche Typen</div>
        </div>
      </div>

      <!-- Quadrant Filter -->
      <div class="flex items-center gap-3 flex-wrap">
        <button @click="selectedQuadrant = null"
                class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
                :class="!selectedQuadrant ? 'bg-primary-600 text-white border-primary-600' : 'border-surface-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:bg-surface-50 dark:hover:bg-surface-800'">Alle</button>
        <button v-for="q in quadrants" :key="q.name"
                @click="selectedQuadrant = q.name"
                class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
                :class="selectedQuadrant === q.name ? 'text-white border-transparent' : 'border-surface-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:bg-surface-50 dark:hover:bg-surface-800'"
                :style="selectedQuadrant === q.name ? { backgroundColor: q.color } : {}">
          {{ q.name }}
        </button>
      </div>

      <!-- Radar Visualization + Legend -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Radar Chart -->
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Technologie-Radar</h3>
          <div class="h-80 flex items-center justify-center">
            <canvas ref="radarCanvas"></canvas>
          </div>
          <div class="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
            <span v-for="q in quadrants" :key="q.name" class="flex items-center gap-1">
              <span class="w-3 h-3 rounded" :style="{ backgroundColor: q.color }"></span> {{ q.name }}
            </span>
          </div>
        </div>

        <!-- Distribution by Type -->
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Verteilung nach App-Typ</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Technologien gruppiert nach Deployment-Typ</p>
          <div class="h-72">
            <canvas ref="typeCanvas"></canvas>
          </div>
        </div>
      </div>

      <!-- Strategic Decisions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Adopt & Trial -->
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <h3 class="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">✦ Adopt & Trial</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Strategisch empfohlene Technologien</p>
          <div v-if="adoptTrialTechs.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">Keine Technologien in dieser Kategorie</div>
          <div v-else class="space-y-2 max-h-64 overflow-y-auto">
            <div v-for="t in adoptTrialTechs" :key="t.name"
                 class="p-3 rounded-lg border"
                 :class="t.quadrant === 'Adopt' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ t.name }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                      :class="t.quadrant === 'Adopt' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'">{{ t.quadrant }}</span>
              </div>
              <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ t.appCount }} App(s): {{ t.apps.map(a => a.name).join(', ') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Hold -->
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <h3 class="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">⚠ Hold & Assess</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Technologien zur Überprüfung oder Ablösung</p>
          <div v-if="holdAssessTechs.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">Keine Technologien in dieser Kategorie</div>
          <div v-else class="space-y-2 max-h-64 overflow-y-auto">
            <div v-for="t in holdAssessTechs" :key="t.name"
                 class="p-3 rounded-lg border"
                 :class="t.quadrant === 'Hold' ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ t.name }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                      :class="t.quadrant === 'Hold' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'">{{ t.quadrant }}</span>
              </div>
              <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ t.appCount }} App(s): {{ t.apps.map(a => a.name).join(', ') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Technology Table -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Technologie-Übersicht</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-surface-200 dark:border-surface-700">
                <th class="py-2 pr-4">Technologie</th>
                <th class="py-2 pr-4">Quadrant</th>
                <th class="py-2 pr-4 text-center">Apps</th>
                <th class="py-2 pr-4">Applikationen</th>
                <th class="py-2 pr-4">Deployment-Typ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in filteredTechnologies" :key="t.name" class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800">
                <td class="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">{{ t.name }}</td>
                <td class="py-2 pr-4">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="quadrantBadge(t.quadrant)">{{ t.quadrant }}</span>
                </td>
                <td class="py-2 pr-4 text-center font-semibold">{{ t.appCount }}</td>
                <td class="py-2 pr-4">
                  <div class="flex flex-wrap gap-1">
                    <a v-for="app in t.apps" :key="app.id" :href="linkTo('/apps/' + app.id)"
                       class="text-xs px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:underline">{{ app.name }}</a>
                  </div>
                </td>
                <td class="py-2 pr-4">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="typ in t.types" :key="typ"
                          class="text-xs px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-gray-600 dark:text-gray-400">{{ typ }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed, onMounted, nextTick, watch } = Vue

    const selectedQuadrant = ref(null)
    const radarCanvas = ref(null)
    const typeCanvas = ref(null)
    let radarChart = null
    let typeChart = null

    const quadrants = [
      { name: 'Adopt', color: '#22c55e' },
      { name: 'Trial', color: '#3b82f6' },
      { name: 'Assess', color: '#eab308' },
      { name: 'Hold', color: '#ef4444' }
    ]

    // ── Determine quadrant from app's TIME quadrant ──
    function inferQuadrant (apps) {
      // Logic: based on majority TIME quadrant of apps using this technology
      const scores = { 'Invest': 3, 'Tolerate': 1, 'Migrate': 0, 'Eliminate': -1 }
      const avg = apps.reduce((s, a) => s + (scores[a.timeQuadrant] || 0), 0) / (apps.length || 1)
      if (avg >= 2.5) return 'Adopt'
      if (avg >= 1.5) return 'Trial'
      if (avg >= 0.5) return 'Assess'
      return 'Hold'
    }

    // ── Build technology list ──
    const allTechnologies = computed(() => {
      const techMap = {}
      store.data.applications.forEach(app => {
        const techs = app.technology || []
        techs.forEach(tech => {
          if (!techMap[tech]) {
            techMap[tech] = { name: tech, apps: [], types: new Set() }
          }
          techMap[tech].apps.push(app)
          techMap[tech].types.add(app.type || 'Unknown')
        })
      })

      return Object.values(techMap).map(t => ({
        name: t.name,
        apps: t.apps,
        appCount: t.apps.length,
        types: [...t.types],
        quadrant: inferQuadrant(t.apps)
      })).sort((a, b) => {
        const order = { 'Adopt': 0, 'Trial': 1, 'Assess': 2, 'Hold': 3 }
        return (order[a.quadrant] || 0) - (order[b.quadrant] || 0) || b.appCount - a.appCount
      })
    })

    const filteredTechnologies = computed(() => {
      if (!selectedQuadrant.value) return allTechnologies.value
      return allTechnologies.value.filter(t => t.quadrant === selectedQuadrant.value)
    })

    // ── KPIs ──
    const adoptCount = computed(() => allTechnologies.value.filter(t => t.quadrant === 'Adopt').length)
    const holdCount = computed(() => allTechnologies.value.filter(t => t.quadrant === 'Hold').length)
    const platformCount = computed(() => {
      const types = new Set()
      store.data.applications.forEach(a => types.add(a.type))
      return types.size
    })

    // ── Strategic groups ──
    const adoptTrialTechs = computed(() => allTechnologies.value.filter(t => t.quadrant === 'Adopt' || t.quadrant === 'Trial'))
    const holdAssessTechs = computed(() => allTechnologies.value.filter(t => t.quadrant === 'Hold' || t.quadrant === 'Assess'))

    function quadrantBadge (q) {
      const map = {
        'Adopt': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        'Trial': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        'Assess': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
        'Hold': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      }
      return map[q] || 'bg-surface-200 text-gray-600'
    }

    // ── Charts ──
    function renderCharts () {
      if (typeof Chart === 'undefined') return

      // Radar distribution (doughnut)
      if (radarCanvas.value) {
        if (radarChart) radarChart.destroy()
        const counts = quadrants.map(q => allTechnologies.value.filter(t => t.quadrant === q.name).length)
        radarChart = new Chart(radarCanvas.value, {
          type: 'doughnut',
          data: {
            labels: quadrants.map(q => q.name),
            datasets: [{
              data: counts,
              backgroundColor: quadrants.map(q => q.color),
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

      // Technologies by App Type (bar chart)
      if (typeCanvas.value) {
        if (typeChart) typeChart.destroy()
        const types = [...new Set(store.data.applications.map(a => a.type))]
        const datasets = quadrants.map(q => ({
          label: q.name,
          backgroundColor: q.color + '99',
          borderColor: q.color,
          borderWidth: 1,
          data: types.map(typ => {
            return allTechnologies.value.filter(t =>
              t.quadrant === q.name && t.types.includes(typ)
            ).length
          })
        }))
        typeChart = new Chart(typeCanvas.value, {
          type: 'bar',
          data: { labels: types, datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { stacked: true },
              y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } }
            },
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } }
            }
          }
        })
      }
    }

    onMounted(() => { nextTick(renderCharts) })
    watch(selectedQuadrant, () => { nextTick(renderCharts) })

    return {
      store, linkTo, selectedQuadrant,
      radarCanvas, typeCanvas,
      quadrants, allTechnologies, filteredTechnologies,
      adoptCount, holdCount, platformCount,
      adoptTrialTechs, holdAssessTechs,
      quadrantBadge
    }
  }
}
