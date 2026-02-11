// time-quadrant.js — TIME (Tolerate / Invest / Migrate / Eliminate) scatter plot
import { store } from '../store.js'
import { linkTo, navigateTo } from '../router.js'

export default {
  name: 'TimeQuadrant',
  template: `
    <div class="space-y-4">
      <p class="text-sm text-gray-500">Business Value (Y) vs Technical Health (X). Color & label = TIME classification. Click an application to view details.</p>

      <div class="bg-white rounded-xl border border-surface-200 p-4 sm:p-6">
        <div class="relative h-[360px] md:h-[520px]">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>

      <!-- Applications by TIME category -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="q in quadrants" :key="q.name"
             class="rounded-xl border-2 p-4"
             :style="{ borderColor: q.color + '40', backgroundColor: q.color + '08' }">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: q.color }"></span>
            <span class="text-sm font-semibold" :style="{ color: q.color }">{{ q.name }}</span>
            <span class="text-xs text-gray-400 ml-auto">{{ q.apps.length }}</span>
          </div>
          <div class="space-y-1">
            <a v-for="app in q.apps" :key="app.id"
               :href="linkTo('/apps/' + app.id)"
               class="block text-xs text-gray-700 hover:text-primary-600 truncate">
              {{ app.name }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed, onMounted, nextTick } = Vue
    const chartCanvas = ref(null)

    const timeColors = { Invest: '#10b981', Tolerate: '#f59e0b', Migrate: '#3b82f6', Eliminate: '#ef4444' }

    const quadrants = computed(() => {
      const groups = { Invest: [], Tolerate: [], Migrate: [], Eliminate: [] }
      store.data.applications.forEach(a => {
        if (groups[a.timeQuadrant]) groups[a.timeQuadrant].push(a)
      })
      return Object.entries(groups).map(([name, apps]) => ({ name, apps, color: timeColors[name] }))
    })

    function renderChart () {
      if (!chartCanvas.value) return
      const apps = store.data.applications

      // Group datasets by TIME quadrant
      const datasets = Object.entries(timeColors).map(([quadrant, color]) => {
        const points = apps
          .filter(a => a.timeQuadrant === quadrant && a.scores)
          .map(a => ({
            x: a.scores.technicalHealth,
            y: a.scores.businessValue,
            r: Math.max(6, Math.sqrt(a.costPerYear / 1000) * 1.5),
            label: a.name,
            id: a.id
          }))
        return {
          label: quadrant,
          data: points,
          backgroundColor: color + '99',
          borderColor: color,
          borderWidth: 1.5
        }
      })

      const chart = new Chart(chartCanvas.value, {
        type: 'bubble',
        data: { datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: { display: true, text: 'Technical Health →', font: { size: 12 } },
              min: 0, max: 11, ticks: { stepSize: 1 },
              grid: { color: '#f1f5f9' }
            },
            y: {
              title: { display: true, text: 'Business Value →', font: { size: 12 } },
              min: 0, max: 11, ticks: { stepSize: 1 },
              grid: { color: '#f1f5f9' }
            }
          },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, padding: 16 } },
            tooltip: {
              callbacks: {
                label: ctx => {
                  const p = ctx.raw
                  return p.label + ' (BV=' + p.y + ', TH=' + p.x + ')'
                }
              }
            }
          },
          onClick: (evt, elements) => {
            if (elements.length > 0) {
              const el = elements[0]
              const ds = datasets[el.datasetIndex]
              const point = ds.data[el.index]
              if (point && point.id) navigateTo('/apps/' + point.id)
            }
          }
        },
        plugins: [{
          // Draw quadrant background areas
          beforeDraw: (chart) => {
            const { ctx, chartArea: { left, top, right, bottom } } = chart
            const xMid = chart.scales.x.getPixelForValue(5.5)
            const yMid = chart.scales.y.getPixelForValue(5.5)
            const areas = [
              { x1: left, y1: top, x2: xMid, y2: yMid, color: '#3b82f610', label: 'Migrate' },        // low-tech, high-biz
              { x1: xMid, y1: top, x2: right, y2: yMid, color: '#10b98110', label: 'Invest' },         // high-tech, high-biz
              { x1: left, y1: yMid, x2: xMid, y2: bottom, color: '#ef444410', label: 'Eliminate' },     // low-tech, low-biz
              { x1: xMid, y1: yMid, x2: right, y2: bottom, color: '#f59e0b10', label: 'Tolerate' }     // high-tech, low-biz
            ]
            areas.forEach(a => {
              ctx.save()
              ctx.fillStyle = a.color
              ctx.fillRect(a.x1, a.y1, a.x2 - a.x1, a.y2 - a.y1)
              // Label
              ctx.fillStyle = '#94a3b8'
              ctx.font = '11px sans-serif'
              ctx.textAlign = 'center'
              ctx.fillText(a.label, (a.x1 + a.x2) / 2, a.y1 + 16)
              ctx.restore()
            })
          }
        }]
      })
    }

    onMounted(() => { nextTick(renderChart) })

    return { store, linkTo, navigateTo, chartCanvas, quadrants }
  }
}
