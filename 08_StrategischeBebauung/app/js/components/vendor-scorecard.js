// vendor-scorecard.js — Vendor Dependency Scorecard (Feature #17)
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'VendorScorecard',
  template: `
    <div class="space-y-6">

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Vendors</div>
          <div class="mt-1 text-2xl font-bold text-gray-900">{{ vendors.length }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ strategicCount }} Strategic</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Concentration Risk</div>
          <div class="mt-1 text-2xl font-bold" :class="concentrationRiskColor">{{ topConcentration }}%</div>
          <div class="text-xs text-gray-400 mt-1">Top Vendor MC-Share</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Expiring Contracts</div>
          <div class="mt-1 text-2xl font-bold text-orange-600">{{ expiringCount }}</div>
          <div class="text-xs text-gray-400 mt-1">&le; 12 Monate</div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-4">
          <div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Contract Value</div>
          <div class="mt-1 text-2xl font-bold text-primary-700">{{ formatCurrency(totalContractValue) }}</div>
          <div class="text-xs text-gray-400 mt-1">Alle Vendors</div>
        </div>
      </div>

      <!-- Vendor Concentration Risk -->
      <div class="bg-white rounded-xl border border-surface-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Vendor Concentration Risk</h2>
        <p class="text-sm text-gray-500 mb-4">Anteil Mission-Critical Apps pro Vendor</p>
        <div v-if="concentrationData.length === 0" class="text-sm text-gray-500 italic">Keine Mission-Critical Apps vorhanden</div>
        <div v-else class="space-y-3">
          <div v-for="item in concentrationData" :key="item.vendorName" class="flex items-center gap-4">
            <div class="w-40 text-sm font-medium text-gray-900 truncate" :title="item.vendorName">
              <a v-if="item.vendorId" :href="linkTo('/vendors/' + item.vendorId)" class="text-primary-600 hover:underline">{{ item.vendorName }}</a>
              <span v-else>{{ item.vendorName }}</span>
            </div>
            <div class="flex-1 h-6 bg-surface-100 rounded-full overflow-hidden relative">
              <div class="h-full rounded-full transition-all duration-500"
                   :class="item.mcPercent >= 50 ? 'bg-red-500' : item.mcPercent >= 30 ? 'bg-orange-400' : 'bg-primary-500'"
                   :style="{ width: item.mcPercent + '%' }"></div>
            </div>
            <div class="w-24 text-right">
              <span class="text-sm font-semibold" :class="item.mcPercent >= 50 ? 'text-red-600' : item.mcPercent >= 30 ? 'text-orange-600' : 'text-gray-700'">{{ item.mcPercent }}%</span>
              <span class="text-xs text-gray-400 ml-1">({{ item.mcCount }}/{{ totalMC }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Contract Renewal Calendar + Vendor Health Score -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Contract Renewal Calendar -->
        <div class="bg-white rounded-xl border border-surface-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">Contract Renewal Calendar</h2>
          <p class="text-sm text-gray-500 mb-4">Timeline auslaufender Verträge</p>
          <div v-if="contractTimeline.length === 0" class="text-sm text-gray-500 italic">Keine Vertragsdaten hinterlegt</div>
          <div v-else class="space-y-2">
            <a v-for="item in contractTimeline" :key="item.vendor.id"
               :href="linkTo('/vendors/' + item.vendor.id)"
               class="flex items-center justify-between p-3 rounded-lg border hover:bg-surface-50 transition-colors"
               :class="contractRowClass(item)">
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium text-gray-900 truncate">{{ item.vendor.name }}</div>
                <div class="text-xs text-gray-500">{{ item.vendor.criticality }} · {{ item.appCount }} App(s) · {{ formatCurrency(item.vendor.contractValue) }}</div>
              </div>
              <div class="text-right ml-3 shrink-0">
                <div class="text-sm font-semibold" :class="contractDaysClass(item)">
                  {{ item.expired ? 'Abgelaufen' : item.daysLeft + ' Tage' }}
                </div>
                <div class="text-xs text-gray-400">{{ item.vendor.contractEnd }}</div>
              </div>
            </a>
          </div>
        </div>

        <!-- Vendor Health Score -->
        <div class="bg-white rounded-xl border border-surface-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">Vendor Health Score</h2>
          <p class="text-sm text-gray-500 mb-4">Kombination: Apps, Kritikalität, Vertragslaufzeit, Kosten</p>
          <div v-if="healthScores.length === 0" class="text-sm text-gray-500 italic">Keine Vendors vorhanden</div>
          <div v-else class="space-y-3">
            <a v-for="item in healthScores" :key="item.vendor.id"
               :href="linkTo('/vendors/' + item.vendor.id)"
               class="block p-3 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-900">{{ item.vendor.name }}</span>
                <span class="text-lg font-bold" :class="healthScoreColor(item.score)">{{ item.score }}<span class="text-xs font-normal text-gray-400">/100</span></span>
              </div>
              <div class="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500"
                     :class="healthScoreBarColor(item.score)"
                     :style="{ width: item.score + '%' }"></div>
              </div>
              <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>{{ item.appCount }} Apps</span>
                <span>{{ item.vendor.criticality }}</span>
                <span>{{ item.contractMonthsLeft >= 0 ? item.contractMonthsLeft + ' Mon. Restlaufzeit' : 'Kein Vertrag' }}</span>
                <span>{{ formatCurrency(item.vendor.contractValue) }}</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Vendor Overview Table -->
      <div class="bg-white rounded-xl border border-surface-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Vendor-Übersicht</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-surface-200">
                <th class="py-2 pr-4">Vendor</th>
                <th class="py-2 pr-4">Status</th>
                <th class="py-2 pr-4">Criticality</th>
                <th class="py-2 pr-4 text-right">Apps</th>
                <th class="py-2 pr-4 text-right">MC Apps</th>
                <th class="py-2 pr-4 text-right">Contract Value</th>
                <th class="py-2 pr-4">Contract End</th>
                <th class="py-2 pr-4 text-right">Health</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in vendorTableData" :key="item.vendor.id" class="border-b border-surface-100 hover:bg-surface-50">
                <td class="py-2 pr-4">
                  <a :href="linkTo('/vendors/' + item.vendor.id)" class="text-primary-600 hover:underline font-medium">{{ item.vendor.name }}</a>
                </td>
                <td class="py-2 pr-4">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="statusBadge(item.vendor.status)">{{ item.vendor.status }}</span>
                </td>
                <td class="py-2 pr-4">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="critBadge(item.vendor.criticality)">{{ item.vendor.criticality }}</span>
                </td>
                <td class="py-2 pr-4 text-right">{{ item.appCount }}</td>
                <td class="py-2 pr-4 text-right">{{ item.mcCount }}</td>
                <td class="py-2 pr-4 text-right">{{ formatCurrency(item.vendor.contractValue) }}</td>
                <td class="py-2 pr-4">{{ item.vendor.contractEnd || '—' }}</td>
                <td class="py-2 pr-4 text-right">
                  <span class="font-semibold" :class="healthScoreColor(item.score)">{{ item.score }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  setup () {
    const { computed } = Vue

    const vendors = computed(() => store.data.vendors || [])
    const apps = computed(() => store.data.applications || [])

    // ── Helper ──

    function formatCurrency (val) {
      if (!val && val !== 0) return '—'
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
    }

    function appsForVendor (vendor) {
      return apps.value.filter(a => a.vendor === vendor.name || a.vendorId === vendor.id)
    }

    function mcAppsForVendor (vendor) {
      return appsForVendor(vendor).filter(a => a.criticality === 'Mission-Critical')
    }

    // ── KPIs ──

    const strategicCount = computed(() => vendors.value.filter(v => v.criticality === 'Strategic').length)

    const totalMC = computed(() => apps.value.filter(a => a.criticality === 'Mission-Critical').length)

    const totalContractValue = computed(() => vendors.value.reduce((s, v) => s + (v.contractValue || 0), 0))

    // ── Vendor Concentration Risk ──

    const concentrationData = computed(() => {
      if (totalMC.value === 0) return []
      const map = {}
      apps.value.filter(a => a.criticality === 'Mission-Critical').forEach(a => {
        const vName = a.vendor || 'Unknown'
        if (!map[vName]) {
          const vObj = vendors.value.find(v => v.name === vName)
          map[vName] = { vendorName: vName, vendorId: vObj ? vObj.id : null, mcCount: 0 }
        }
        map[vName].mcCount++
      })
      return Object.values(map)
        .map(item => ({ ...item, mcPercent: Math.round((item.mcCount / totalMC.value) * 100) }))
        .sort((a, b) => b.mcPercent - a.mcPercent)
    })

    const topConcentration = computed(() => concentrationData.value.length > 0 ? concentrationData.value[0].mcPercent : 0)

    const concentrationRiskColor = computed(() => {
      const v = topConcentration.value
      if (v >= 50) return 'text-red-600'
      if (v >= 30) return 'text-orange-600'
      return 'text-green-600'
    })

    // ── Contract Renewal Calendar ──

    const contractTimeline = computed(() => {
      const now = new Date()
      return vendors.value
        .filter(v => v.contractEnd)
        .map(v => {
          const end = new Date(v.contractEnd)
          const expired = end < now
          const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
          const appCount = appsForVendor(v).length
          return { vendor: v, expired, daysLeft, appCount }
        })
        .sort((a, b) => a.daysLeft - b.daysLeft)
    })

    const expiringCount = computed(() => contractTimeline.value.filter(c => c.daysLeft <= 365).length)

    function contractRowClass (item) {
      if (item.expired) return 'border-red-300 bg-red-50'
      if (item.daysLeft <= 90) return 'border-red-200 bg-red-50'
      if (item.daysLeft <= 180) return 'border-orange-200 bg-orange-50'
      if (item.daysLeft <= 365) return 'border-yellow-200 bg-yellow-50'
      return 'border-surface-200'
    }

    function contractDaysClass (item) {
      if (item.expired) return 'text-red-600'
      if (item.daysLeft <= 90) return 'text-red-600'
      if (item.daysLeft <= 180) return 'text-orange-600'
      if (item.daysLeft <= 365) return 'text-yellow-700'
      return 'text-green-600'
    }

    // ── Vendor Health Score ──

    function calcHealthScore (vendor) {
      const now = new Date()
      const vendorApps = appsForVendor(vendor)
      const appCount = vendorApps.length
      const mcCount = vendorApps.filter(a => a.criticality === 'Mission-Critical').length

      // App diversity score (0-25): fewer apps = less dependency = healthier
      const appScore = appCount <= 1 ? 25 : appCount <= 3 ? 20 : appCount <= 5 ? 15 : appCount <= 8 ? 10 : 5

      // Criticality score (0-25): lower share of MC apps = healthier
      const mcRatio = appCount > 0 ? mcCount / appCount : 0
      const critScore = mcRatio === 0 ? 25 : mcRatio <= 0.25 ? 20 : mcRatio <= 0.5 ? 15 : mcRatio <= 0.75 ? 10 : 5

      // Contract tenure score (0-25): longer remaining = healthier
      let contractMonthsLeft = -1
      let tenureScore = 15 // default if no contract data
      if (vendor.contractEnd) {
        const end = new Date(vendor.contractEnd)
        contractMonthsLeft = Math.round((end - now) / (1000 * 60 * 60 * 24 * 30))
        if (contractMonthsLeft < 0) tenureScore = 0
        else if (contractMonthsLeft <= 3) tenureScore = 5
        else if (contractMonthsLeft <= 6) tenureScore = 10
        else if (contractMonthsLeft <= 12) tenureScore = 15
        else if (contractMonthsLeft <= 24) tenureScore = 20
        else tenureScore = 25
      }

      // Cost efficiency score (0-25): based on vendor rating (1-10)
      const rating = vendor.rating || 5
      const costScore = Math.round((rating / 10) * 25)

      const score = Math.min(100, appScore + critScore + tenureScore + costScore)

      return { vendor, score, appCount, mcCount, contractMonthsLeft }
    }

    const healthScores = computed(() =>
      vendors.value
        .map(v => calcHealthScore(v))
        .sort((a, b) => b.score - a.score)
    )

    function healthScoreColor (score) {
      if (score >= 75) return 'text-green-600'
      if (score >= 50) return 'text-yellow-600'
      if (score >= 25) return 'text-orange-600'
      return 'text-red-600'
    }

    function healthScoreBarColor (score) {
      if (score >= 75) return 'bg-green-500'
      if (score >= 50) return 'bg-yellow-400'
      if (score >= 25) return 'bg-orange-400'
      return 'bg-red-500'
    }

    // ── Vendor Table ──

    const vendorTableData = computed(() =>
      vendors.value.map(v => {
        const hs = calcHealthScore(v)
        return { vendor: v, appCount: hs.appCount, mcCount: hs.mcCount, score: hs.score }
      }).sort((a, b) => b.score - a.score)
    )

    function statusBadge (status) {
      const map = {
        'Active': 'bg-green-100 text-green-700',
        'New': 'bg-blue-100 text-blue-700',
        'Under Review': 'bg-yellow-100 text-yellow-700',
        'Phase-Out': 'bg-red-100 text-red-700'
      }
      return map[status] || 'bg-surface-200 text-gray-600'
    }

    function critBadge (crit) {
      const map = {
        'Strategic': 'bg-purple-100 text-purple-700',
        'Important': 'bg-blue-100 text-blue-700',
        'Standard': 'bg-surface-200 text-gray-600',
        'Commodity': 'bg-surface-100 text-gray-500'
      }
      return map[crit] || 'bg-surface-200 text-gray-600'
    }

    return {
      store, linkTo,
      vendors, apps, totalMC,
      strategicCount, totalContractValue,
      concentrationData, topConcentration, concentrationRiskColor,
      contractTimeline, expiringCount, contractRowClass, contractDaysClass,
      healthScores, healthScoreColor, healthScoreBarColor,
      vendorTableData, formatCurrency, statusBadge, critBadge
    }
  }
}
