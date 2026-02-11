// capability-investment.js — Capability-basierte Investment-Analyse (Feature #7)
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'CapabilityInvestment',
  template: `
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Gesamtbudget</div>
          <div class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ formatCurrency(totalBudget) }}</div>
          <div class="text-xs text-gray-400 mt-1">Alle Projekte</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Capabilities mit Investment</div>
          <div class="mt-1 text-2xl font-bold text-primary-700 dark:text-primary-400">{{ fundedCount }}</div>
          <div class="text-xs text-gray-400 mt-1">von {{ totalCaps }} gesamt</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Unterfinanziert</div>
          <div class="mt-1 text-2xl font-bold text-red-600">{{ underfundedCaps.length }}</div>
          <div class="text-xs text-gray-400 mt-1">Hohe Kritikalität, kein Budget</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg Budget/Cap</div>
          <div class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{{ formatCurrency(avgBudgetPerCap) }}</div>
          <div class="text-xs text-gray-400 mt-1">Geförderte Capabilities</div>
        </div>
      </div>

      <!-- Domain Filter -->
      <div class="flex items-center gap-3 flex-wrap">
        <button @click="selectedDomain = null"
                class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
                :class="!selectedDomain ? 'bg-primary-600 text-white border-primary-600' : 'border-surface-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:bg-surface-50 dark:hover:bg-surface-800'">Alle Domänen</button>
        <button v-for="d in store.data.domains" :key="d.id"
                @click="selectedDomain = d.id"
                class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
                :class="selectedDomain === d.id ? 'text-white border-transparent' : 'border-surface-200 dark:border-surface-700 text-gray-600 dark:text-gray-400 hover:bg-surface-50 dark:hover:bg-surface-800'"
                :style="selectedDomain === d.id ? { backgroundColor: d.color } : {}">
          {{ d.name }}
        </button>
      </div>

      <!-- Investment by Capability Chart -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Investment pro Capability</h3>
        <div :style="{ height: chartHeight + 'px' }">
          <canvas ref="investCanvas"></canvas>
        </div>
      </div>

      <!-- Maturity-Gap × Budget Analysis -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Maturity-Gap × Budget</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Investieren wir in die richtigen Dinge?</p>
          <div class="h-72">
            <canvas ref="gapBudgetCanvas"></canvas>
          </div>
        </div>

        <!-- Underfunded Capabilities -->
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Unterfinanzierte Capabilities</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Hohe Kritikalität + Maturity-Gap, aber kein/kaum Investment</p>
          <div v-if="underfundedCaps.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">Keine unterfinanzierten Capabilities gefunden</div>
          <div v-else class="space-y-2 max-h-64 overflow-y-auto">
            <div v-for="item in underfundedCaps" :key="item.capId"
                 class="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ item.capName }}</span>
                  <span class="ml-2 text-xs px-2 py-0.5 rounded-full"
                        :style="{ backgroundColor: item.domainColor + '20', color: item.domainColor }">{{ item.domainName }}</span>
                </div>
                <span class="text-xs font-semibold text-red-600">Gap: {{ item.gap }}</span>
              </div>
              <div class="mt-1 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Ist: {{ item.current }}/5</span>
                <span>Soll: {{ item.target }}/5</span>
                <span>Kritikalität: {{ item.criticality }}</span>
                <span>Budget: {{ formatCurrency(item.budget) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Investment Table -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Capability Investment Detail</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-surface-200 dark:border-surface-700">
                <th class="py-2 pr-4">Capability</th>
                <th class="py-2 pr-4">Domäne</th>
                <th class="py-2 pr-4">Kritikalität</th>
                <th class="py-2 pr-4 text-center">Ist</th>
                <th class="py-2 pr-4 text-center">Soll</th>
                <th class="py-2 pr-4 text-center">Gap</th>
                <th class="py-2 pr-4 text-right">Budget</th>
                <th class="py-2 pr-4">Projekte</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredCapData" :key="item.capId" class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800">
                <td class="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">{{ item.capName }}</td>
                <td class="py-2 pr-4">
                  <span class="text-xs px-2 py-0.5 rounded-full"
                        :style="{ backgroundColor: item.domainColor + '20', color: item.domainColor }">{{ item.domainName }}</span>
                </td>
                <td class="py-2 pr-4">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="critClass(item.criticality)">{{ item.criticality }}</span>
                </td>
                <td class="py-2 pr-4 text-center">{{ item.current }}</td>
                <td class="py-2 pr-4 text-center">{{ item.target }}</td>
                <td class="py-2 pr-4 text-center">
                  <span :class="item.gap > 0 ? 'text-red-600 font-semibold' : 'text-green-600'">{{ item.gap }}</span>
                </td>
                <td class="py-2 pr-4 text-right font-medium" :class="item.budget > 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'">{{ formatCurrency(item.budget) }}</td>
                <td class="py-2 pr-4">
                  <div class="flex flex-wrap gap-1">
                    <a v-for="p in item.projects" :key="p.id" :href="linkTo('/projects/' + p.id)"
                       class="text-xs px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:underline">{{ p.id }}</a>
                    <span v-if="item.projects.length === 0" class="text-xs text-gray-400">—</span>
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

    const selectedDomain = ref(null)
    const investCanvas = ref(null)
    const gapBudgetCanvas = ref(null)
    let investChart = null
    let gapBudgetChart = null

    // ── Helpers ──

    function formatCurrency (val) {
      if (!val && val !== 0) return '—'
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
    }

    function critClass (crit) {
      const map = {
        'High': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        'Medium': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
        'Low': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      }
      return map[crit] || 'bg-surface-200 text-gray-600'
    }

    // ── Build capability investment data ──

    const capData = computed(() => {
      const result = []
      store.data.domains.forEach(d => {
        d.capabilities.forEach(c => {
          const gap = (c.targetMaturity || c.maturity) - c.maturity
          // Find projects that reference this capability
          const projects = store.data.projects.filter(p =>
            p.capabilities && p.capabilities.includes(c.id)
          )
          const budget = projects.reduce((s, p) => {
            // Distribute project budget evenly across its capabilities
            const capCount = (p.capabilities || []).length
            return s + (capCount > 0 ? (p.budget || 0) / capCount : 0)
          }, 0)

          result.push({
            capId: c.id,
            capName: c.name,
            domainId: d.id,
            domainName: d.name,
            domainColor: d.color,
            criticality: c.criticality || 'Medium',
            current: c.maturity,
            target: c.targetMaturity || c.maturity,
            gap,
            budget: Math.round(budget),
            projects
          })
        })
      })
      return result
    })

    const filteredCapData = computed(() => {
      if (!selectedDomain.value) return capData.value
      return capData.value.filter(c => c.domainId === selectedDomain.value)
    })

    // ── KPIs ──

    const totalBudget = computed(() => store.data.projects.reduce((s, p) => s + (p.budget || 0), 0))
    const totalCaps = computed(() => capData.value.length)
    const fundedCount = computed(() => capData.value.filter(c => c.budget > 0).length)
    const avgBudgetPerCap = computed(() => {
      const funded = capData.value.filter(c => c.budget > 0)
      if (funded.length === 0) return 0
      return Math.round(funded.reduce((s, c) => s + c.budget, 0) / funded.length)
    })

    // ── Underfunded Capabilities ──

    const underfundedCaps = computed(() => {
      return capData.value
        .filter(c => c.criticality === 'High' && c.gap > 0 && c.budget === 0)
        .sort((a, b) => b.gap - a.gap)
    })

    // ── Chart height ──

    const chartHeight = computed(() => {
      return Math.max(300, filteredCapData.value.length * 28)
    })

    // ── Charts ──

    function renderCharts () {
      if (typeof Chart === 'undefined') return

      // Investment by Capability (horizontal bar)
      if (investCanvas.value) {
        if (investChart) investChart.destroy()
        const data = filteredCapData.value.slice().sort((a, b) => b.budget - a.budget)
        investChart = new Chart(investCanvas.value, {
          type: 'bar',
          data: {
            labels: data.map(c => c.capName),
            datasets: [{
              label: 'Budget (€)',
              data: data.map(c => c.budget),
              backgroundColor: data.map(c => c.domainColor + '80'),
              borderColor: data.map(c => c.domainColor),
              borderWidth: 1
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                ticks: {
                  callback: v => v >= 1000 ? (v / 1000) + 'k €' : v + ' €'
                }
              }
            }
          }
        })
      }

      // Maturity Gap × Budget scatter chart
      if (gapBudgetCanvas.value) {
        if (gapBudgetChart) gapBudgetChart.destroy()
        const items = capData.value.filter(c => c.gap > 0 || c.budget > 0)
        gapBudgetChart = new Chart(gapBudgetCanvas.value, {
          type: 'bubble',
          data: {
            datasets: [{
              label: 'Capabilities',
              data: items.map(c => ({
                x: c.gap,
                y: c.budget,
                r: c.criticality === 'High' ? 10 : c.criticality === 'Medium' ? 7 : 4
              })),
              backgroundColor: items.map(c => {
                // Red for underfunded (high gap, low budget), green for well-funded
                if (c.gap > 0 && c.budget === 0) return 'rgba(239, 68, 68, 0.6)'
                if (c.gap > 1 && c.budget < 100000) return 'rgba(245, 158, 11, 0.6)'
                return 'rgba(59, 130, 246, 0.6)'
              }),
              borderColor: items.map(c => {
                if (c.gap > 0 && c.budget === 0) return '#ef4444'
                if (c.gap > 1 && c.budget < 100000) return '#f59e0b'
                return '#3b82f6'
              }),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const item = items[ctx.dataIndex]
                    return item ? `${item.capName}: Gap ${item.gap}, Budget ${formatCurrency(item.budget)}` : ''
                  }
                }
              }
            },
            scales: {
              x: { title: { display: true, text: 'Maturity Gap' }, min: 0 },
              y: {
                title: { display: true, text: 'Budget (€)' },
                ticks: { callback: v => v >= 1000 ? (v / 1000) + 'k' : v }
              }
            }
          }
        })
      }
    }

    onMounted(() => { nextTick(renderCharts) })
    watch(selectedDomain, () => { nextTick(renderCharts) })

    return {
      store, linkTo, selectedDomain,
      investCanvas, gapBudgetCanvas,
      capData, filteredCapData,
      totalBudget, totalCaps, fundedCount, avgBudgetPerCap,
      underfundedCaps, chartHeight,
      formatCurrency, critClass
    }
  }
}
