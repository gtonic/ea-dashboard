// maturity-gap.js — Maturity Gap Analysis: Ist vs Soll with Chart.js
import { store } from '../store.js'

export default {
  name: 'MaturityGap',
  template: `
    <div class="space-y-6">
      <!-- Domain Filter -->
      <div class="flex items-center gap-3 flex-wrap">
        <button @click="selectedDomain = null"
                class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
                :class="!selectedDomain ? 'bg-primary-600 text-white border-primary-600' : 'border-surface-200 text-gray-600 hover:bg-surface-50'">All Domains</button>
        <button v-for="d in store.data.domains" :key="d.id"
                @click="selectedDomain = d.id"
                class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
                :class="selectedDomain === d.id ? 'text-white border-transparent' : 'border-surface-200 text-gray-600 hover:bg-surface-50'"
                :style="selectedDomain === d.id ? { backgroundColor: d.color } : {}">
          {{ d.name }}
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-surface-200 p-4 text-center">
          <div class="text-2xl font-bold text-gray-700">{{ filteredGaps.length }}</div>
          <div class="text-xs text-gray-500">Capabilities</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4 text-center">
          <div class="text-2xl font-bold text-amber-500">{{ avgIst }}/5</div>
          <div class="text-xs text-gray-500">Avg Ist</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4 text-center">
          <div class="text-2xl font-bold text-indigo-600">{{ avgSoll }}/5</div>
          <div class="text-xs text-gray-500">Avg Soll</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4 text-center">
          <div class="text-2xl font-bold" :style="{ color: avgGapVal > 1 ? '#ef4444' : '#f59e0b' }">{{ avgGapVal }}</div>
          <div class="text-xs text-gray-500">Avg Gap</div>
        </div>
      </div>

      <!-- Chart -->
      <div class="bg-white rounded-xl border border-surface-200 p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">Ist vs Soll Maturity</h3>
        <div :style="{ height: chartHeight + 'px' }">
          <canvas ref="gapCanvas"></canvas>
        </div>
        <div class="flex items-center gap-6 mt-3 text-xs text-gray-500">
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded" style="background:#3b82f6"></span> Ist</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded" style="background:#818cf8"></span> Soll</span>
        </div>
      </div>

      <!-- Top Gaps Table -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Top Gaps (Soll − Ist)</h3>
        </div>
        <table class="w-full text-sm">
          <thead class="text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th class="px-5 py-2 text-left">Capability</th>
              <th class="px-5 py-2 text-left">Domain</th>
              <th class="px-5 py-2 text-right">Ist</th>
              <th class="px-5 py-2 text-right">Soll</th>
              <th class="px-5 py-2 text-right">Gap</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="row in topGaps" :key="row.capId" class="hover:bg-surface-50">
              <td class="px-5 py-2 font-medium">
                <span class="text-[10px] font-mono text-gray-400 mr-1">{{ row.capId }}</span>
                {{ row.capName }}
              </td>
              <td class="px-5 py-2">
                <span class="inline-block w-3 h-3 rounded mr-1 align-middle" :style="{ backgroundColor: row.domainColor }"></span>
                {{ row.domainName }}
              </td>
              <td class="px-5 py-2 text-right font-mono">{{ row.current }}</td>
              <td class="px-5 py-2 text-right font-mono">{{ row.target }}</td>
              <td class="px-5 py-2 text-right font-bold" :style="{ color: row.gap >= 2 ? '#ef4444' : '#f59e0b' }">{{ row.gap }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!topGaps.length" class="text-center py-6 text-sm text-gray-400">No gaps detected.</div>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed, watch, onMounted, nextTick } = Vue
    const selectedDomain = ref(null)
    const gapCanvas = ref(null)
    let chartInstance = null

    const filteredGaps = computed(() => {
      const all = store.maturityGaps || []
      if (!selectedDomain.value) return all
      return all.filter(g => {
        const d = store.data.domains.find(d => d.name === g.domainName)
        return d && d.id === selectedDomain.value
      })
    })

    const avgIst = computed(() => {
      const gs = filteredGaps.value
      return gs.length ? (gs.reduce((s, g) => s + g.current, 0) / gs.length).toFixed(1) : '0'
    })
    const avgSoll = computed(() => {
      const gs = filteredGaps.value
      return gs.length ? (gs.reduce((s, g) => s + g.target, 0) / gs.length).toFixed(1) : '0'
    })
    const avgGapVal = computed(() => {
      const gs = filteredGaps.value
      return gs.length ? (gs.reduce((s, g) => s + g.gap, 0) / gs.length).toFixed(1) : '0'
    })

    const topGaps = computed(() => [...filteredGaps.value].filter(g => g.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 15))

    const chartHeight = computed(() => Math.max(300, filteredGaps.value.length * 28))

    function renderChart () {
      if (!gapCanvas.value) return
      if (chartInstance) chartInstance.destroy()
      const gs = filteredGaps.value
      const labels = gs.map(g => g.capId + ' ' + g.capName)
      chartInstance = new Chart(gapCanvas.value, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Ist', data: gs.map(g => g.current), backgroundColor: '#3b82f6', borderRadius: 3, barPercentage: 0.6 },
            { label: 'Soll', data: gs.map(g => g.target), backgroundColor: '#818cf8', borderRadius: 3, barPercentage: 0.6 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y',
          scales: { x: { min: 0, max: 5, ticks: { stepSize: 1 } } },
          plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 12 } } }
        }
      })
    }

    onMounted(() => nextTick(renderChart))
    watch(selectedDomain, () => nextTick(renderChart))

    return { store, selectedDomain, filteredGaps, avgIst, avgSoll, avgGapVal, topGaps, chartHeight, gapCanvas }
  }
}
