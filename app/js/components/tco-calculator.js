// tco-calculator.js — Total Cost of Ownership Calculator: per app, per capability, with comparison
import { store } from '../store.js'
import { linkTo, navigateTo } from '../router.js'
import { i18n } from '../i18n.js'

export default {
  name: 'TcoCalculator',
  template: `
    <div class="space-y-6">

      <!-- Summary KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <div class="text-xs text-gray-500">{{ t('tco.totalTCO') }}</div>
          <div class="text-2xl font-bold text-gray-800">{{ formatCurrency(totalTCO) }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ apps.length }} {{ t('tco.applications') }}</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <div class="text-xs text-gray-500">{{ t('tco.avgTCO') }}</div>
          <div class="text-2xl font-bold text-primary-700">{{ formatCurrency(avgTCO) }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ t('tco.perApp') }}</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <div class="text-xs text-gray-500">{{ t('tco.licenseCosts') }}</div>
          <div class="text-2xl font-bold text-blue-700">{{ formatCurrency(totalLicense) }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ pct(totalLicense, totalTCO) }}%</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-5">
          <div class="text-xs text-gray-500">{{ t('tco.operationsCosts') }}</div>
          <div class="text-2xl font-bold text-green-700">{{ formatCurrency(totalOps) }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ pct(totalOps, totalTCO) }}%</div>
        </div>
      </div>

      <!-- Cost Breakdown Chart (horizontal stacked bars) -->
      <div class="bg-white rounded-xl border border-surface-200 p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ t('tco.costBreakdown') }}</h3>
        <div class="space-y-3">
          <div v-for="app in sortedByTCO" :key="app.id" class="group">
            <div class="flex items-center gap-3 mb-1">
              <a :href="linkTo('/apps/' + app.id)" class="text-xs font-medium text-gray-700 hover:text-primary-600 w-40 truncate">{{ app.name }}</a>
              <div class="flex-1 flex h-5 rounded-md overflow-hidden bg-surface-100">
                <div :style="{ width: barPct(app.licenseCost || 0, maxTCO) + '%' }"
                     class="bg-blue-400 hover:bg-blue-500 transition-colors" :title="t('tco.license') + ': ' + formatCurrency(app.licenseCost || 0)"></div>
                <div :style="{ width: barPct(app.operationsCost || 0, maxTCO) + '%' }"
                     class="bg-green-400 hover:bg-green-500 transition-colors" :title="t('tco.operations') + ': ' + formatCurrency(app.operationsCost || 0)"></div>
                <div :style="{ width: barPct(app.integrationCost || 0, maxTCO) + '%' }"
                     class="bg-amber-400 hover:bg-amber-500 transition-colors" :title="t('tco.integration') + ': ' + formatCurrency(app.integrationCost || 0)"></div>
                <div :style="{ width: barPct(app.personnelCost || 0, maxTCO) + '%' }"
                     class="bg-purple-400 hover:bg-purple-500 transition-colors" :title="t('tco.personnel') + ': ' + formatCurrency(app.personnelCost || 0)"></div>
              </div>
              <span class="text-xs font-mono text-gray-600 w-24 text-right">{{ formatCurrency(appTCO(app)) }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4 mt-4 pt-3 border-t border-surface-100 text-xs text-gray-500">
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-blue-400 inline-block"></span> {{ t('tco.license') }}</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-green-400 inline-block"></span> {{ t('tco.operations') }}</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-amber-400 inline-block"></span> {{ t('tco.integration') }}</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-purple-400 inline-block"></span> {{ t('tco.personnel') }}</span>
        </div>
      </div>

      <!-- TCO per Capability -->
      <div class="bg-white rounded-xl border border-surface-200 p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ t('tco.perCapability') }}</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200 bg-surface-50">
                <th class="text-left px-4 py-2 font-medium text-gray-600">{{ t('tco.capability') }}</th>
                <th class="text-left px-4 py-2 font-medium text-gray-600">{{ t('tco.domain') }}</th>
                <th class="text-right px-4 py-2 font-medium text-gray-600">{{ t('tco.numApps') }}</th>
                <th class="text-right px-4 py-2 font-medium text-gray-600">{{ t('tco.totalLabel') }}</th>
                <th class="text-right px-4 py-2 font-medium text-gray-600">{{ t('tco.avgLabel') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100">
              <tr v-for="cap in capabilityCosts" :key="cap.capId" class="hover:bg-surface-50">
                <td class="px-4 py-2 font-medium text-gray-800">{{ cap.capName }}</td>
                <td class="px-4 py-2">
                  <span class="text-xs px-2 py-0.5 rounded-full" :style="{ backgroundColor: cap.domainColor + '20', color: cap.domainColor }">{{ cap.domainName }}</span>
                </td>
                <td class="px-4 py-2 text-right font-mono text-gray-600">{{ cap.appCount }}</td>
                <td class="px-4 py-2 text-right font-mono font-bold text-gray-800">{{ formatCurrency(cap.totalCost) }}</td>
                <td class="px-4 py-2 text-right font-mono text-gray-600">{{ formatCurrency(cap.avgCost) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TCO Comparison -->
      <div class="bg-white rounded-xl border border-surface-200 p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ t('tco.comparison') }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="text-xs text-gray-500 block mb-1">{{ t('tco.appA') }}</label>
            <select v-model="compareA" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
              <option value="">{{ t('tco.selectApp') }}</option>
              <option v-for="app in apps" :key="app.id" :value="app.id">{{ app.name }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-500 block mb-1">{{ t('tco.appB') }}</label>
            <select v-model="compareB" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
              <option value="">{{ t('tco.selectApp') }}</option>
              <option v-for="app in apps" :key="app.id" :value="app.id">{{ app.name }}</option>
            </select>
          </div>
        </div>

        <div v-if="comparisonData" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200 bg-surface-50">
                <th class="text-left px-4 py-2 font-medium text-gray-600">{{ t('tco.costCategory') }}</th>
                <th class="text-right px-4 py-2 font-medium text-gray-600">{{ comparisonData.a.name }}</th>
                <th class="text-right px-4 py-2 font-medium text-gray-600">{{ comparisonData.b.name }}</th>
                <th class="text-right px-4 py-2 font-medium text-gray-600">{{ t('tco.difference') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100">
              <tr v-for="row in comparisonData.rows" :key="row.label" class="hover:bg-surface-50">
                <td class="px-4 py-2 font-medium text-gray-700">{{ row.label }}</td>
                <td class="px-4 py-2 text-right font-mono text-gray-700">{{ formatCurrency(row.valA) }}</td>
                <td class="px-4 py-2 text-right font-mono text-gray-700">{{ formatCurrency(row.valB) }}</td>
                <td class="px-4 py-2 text-right font-mono font-bold" :class="row.diff > 0 ? 'text-red-600' : row.diff < 0 ? 'text-green-600' : 'text-gray-500'">
                  {{ row.diff > 0 ? '+' : '' }}{{ formatCurrency(row.diff) }}
                </td>
              </tr>
              <tr class="bg-surface-50 font-bold">
                <td class="px-4 py-2 text-gray-800">{{ t('tco.totalLabel') }}</td>
                <td class="px-4 py-2 text-right font-mono text-gray-800">{{ formatCurrency(comparisonData.totalA) }}</td>
                <td class="px-4 py-2 text-right font-mono text-gray-800">{{ formatCurrency(comparisonData.totalB) }}</td>
                <td class="px-4 py-2 text-right font-mono" :class="comparisonData.totalDiff > 0 ? 'text-red-600' : 'text-green-600'">
                  {{ comparisonData.totalDiff > 0 ? '+' : '' }}{{ formatCurrency(comparisonData.totalDiff) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-sm text-gray-400 italic py-4 text-center">{{ t('tco.selectBoth') }}</div>
      </div>

      <!-- Detail Table -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-x-auto">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">{{ t('tco.detailTable') }}</h3>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-200 bg-surface-50">
              <th class="text-left px-4 py-2 font-medium text-gray-600">{{ t('tco.colApp') }}</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">{{ t('tco.colVendor') }}</th>
              <th class="text-right px-4 py-2 font-medium text-gray-600">{{ t('tco.license') }}</th>
              <th class="text-right px-4 py-2 font-medium text-gray-600">{{ t('tco.operations') }}</th>
              <th class="text-right px-4 py-2 font-medium text-gray-600">{{ t('tco.integration') }}</th>
              <th class="text-right px-4 py-2 font-medium text-gray-600">{{ t('tco.personnel') }}</th>
              <th class="text-right px-4 py-2 font-medium text-gray-600 bg-surface-100">{{ t('tco.totalLabel') }}</th>
              <th class="text-right px-4 py-2 font-medium text-gray-600">{{ t('tco.costPerUser') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="app in sortedByTCO" :key="app.id" class="hover:bg-surface-50 cursor-pointer" @click="navigateTo('/apps/' + app.id)">
              <td class="px-4 py-2">
                <div class="font-medium text-gray-900">{{ app.name }}</div>
                <div class="text-xs text-gray-400">{{ app.id }}</div>
              </td>
              <td class="px-4 py-2 text-gray-600">{{ app.vendor }}</td>
              <td class="px-4 py-2 text-right font-mono text-gray-600">{{ formatCurrency(app.licenseCost || 0) }}</td>
              <td class="px-4 py-2 text-right font-mono text-gray-600">{{ formatCurrency(app.operationsCost || 0) }}</td>
              <td class="px-4 py-2 text-right font-mono text-gray-600">{{ formatCurrency(app.integrationCost || 0) }}</td>
              <td class="px-4 py-2 text-right font-mono text-gray-600">{{ formatCurrency(app.personnelCost || 0) }}</td>
              <td class="px-4 py-2 text-right font-mono font-bold text-gray-800 bg-surface-50">{{ formatCurrency(appTCO(app)) }}</td>
              <td class="px-4 py-2 text-right font-mono text-gray-500">{{ app.userCount ? formatCurrency(Math.round(appTCO(app) / app.userCount)) : '—' }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-surface-300 bg-surface-50 font-bold">
              <td class="px-4 py-2 text-gray-800" colspan="2">{{ t('tco.totalLabel') }}</td>
              <td class="px-4 py-2 text-right font-mono text-gray-800">{{ formatCurrency(totalLicense) }}</td>
              <td class="px-4 py-2 text-right font-mono text-gray-800">{{ formatCurrency(totalOps) }}</td>
              <td class="px-4 py-2 text-right font-mono text-gray-800">{{ formatCurrency(totalIntegration) }}</td>
              <td class="px-4 py-2 text-right font-mono text-gray-800">{{ formatCurrency(totalPersonnel) }}</td>
              <td class="px-4 py-2 text-right font-mono text-gray-900 bg-surface-100">{{ formatCurrency(totalTCO) }}</td>
              <td class="px-4 py-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed } = Vue
    const compareA = ref('')
    const compareB = ref('')

    const t = (key) => i18n.t(key)

    const apps = computed(() => store.data.applications || [])

    function appTCO (app) {
      return (app.licenseCost || 0) + (app.operationsCost || 0) + (app.integrationCost || 0) + (app.personnelCost || 0)
    }

    const totalLicense = computed(() => apps.value.reduce((s, a) => s + (a.licenseCost || 0), 0))
    const totalOps = computed(() => apps.value.reduce((s, a) => s + (a.operationsCost || 0), 0))
    const totalIntegration = computed(() => apps.value.reduce((s, a) => s + (a.integrationCost || 0), 0))
    const totalPersonnel = computed(() => apps.value.reduce((s, a) => s + (a.personnelCost || 0), 0))
    const totalTCO = computed(() => apps.value.reduce((s, a) => s + appTCO(a), 0))
    const avgTCO = computed(() => apps.value.length ? Math.round(totalTCO.value / apps.value.length) : 0)
    const maxTCO = computed(() => Math.max(...apps.value.map(a => appTCO(a)), 1))

    const sortedByTCO = computed(() => [...apps.value].sort((a, b) => appTCO(b) - appTCO(a)))

    function formatCurrency (val) {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
    }

    function pct (part, total) {
      return total ? Math.round(part / total * 100) : 0
    }

    function barPct (val, max) {
      return max ? (val / max * 100) : 0
    }

    // ── TCO per Capability ──
    const capabilityCosts = computed(() => {
      const capMap = new Map()
      store.data.domains.forEach(d => {
        d.capabilities.forEach(cap => {
          const mappings = store.data.capabilityMappings.filter(m => m.capabilityId === cap.id)
          if (mappings.length === 0) return
          let total = 0
          mappings.forEach(m => {
            const app = store.appById(m.applicationId)
            if (app) total += appTCO(app)
          })
          capMap.set(cap.id, {
            capId: cap.id,
            capName: cap.name,
            domainName: d.name,
            domainColor: d.color,
            appCount: mappings.length,
            totalCost: total,
            avgCost: mappings.length ? Math.round(total / mappings.length) : 0
          })
        })
      })
      return [...capMap.values()].sort((a, b) => b.totalCost - a.totalCost)
    })

    // ── TCO Comparison ──
    const comparisonData = computed(() => {
      if (!compareA.value || !compareB.value) return null
      const a = store.appById(compareA.value)
      const b = store.appById(compareB.value)
      if (!a || !b) return null

      const categories = [
        { key: 'licenseCost', label: t('tco.license') },
        { key: 'operationsCost', label: t('tco.operations') },
        { key: 'integrationCost', label: t('tco.integration') },
        { key: 'personnelCost', label: t('tco.personnel') }
      ]

      const rows = categories.map(c => ({
        label: c.label,
        valA: a[c.key] || 0,
        valB: b[c.key] || 0,
        diff: (a[c.key] || 0) - (b[c.key] || 0)
      }))

      const totalA = appTCO(a)
      const totalB = appTCO(b)

      return { a, b, rows, totalA, totalB, totalDiff: totalA - totalB }
    })

    return {
      store, linkTo, navigateTo, t,
      apps, compareA, compareB,
      appTCO, totalLicense, totalOps, totalIntegration, totalPersonnel, totalTCO, avgTCO, maxTCO,
      sortedByTCO, formatCurrency, pct, barPct,
      capabilityCosts, comparisonData
    }
  }
}
