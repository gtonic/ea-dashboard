// app-lifecycle-timeline.js — Application Lifecycle Timeline: visual timeline per app and aggregated EOL view
import { store } from '../store.js'
import { linkTo, navigateTo } from '../router.js'
import { i18n } from '../i18n.js'

export default {
  name: 'AppLifecycleTimeline',
  template: `
    <div class="space-y-6">

      <!-- Summary KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white rounded-xl border border-surface-200 p-5 text-center">
          <div class="text-2xl font-bold text-gray-800">{{ statusCounts.Planned }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('lifecycle.planned') }}</div>
          <div class="mt-2 h-1 rounded bg-blue-400"></div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-5 text-center">
          <div class="text-2xl font-bold text-green-700">{{ statusCounts.Active }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('lifecycle.active') }}</div>
          <div class="mt-2 h-1 rounded bg-green-500"></div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-5 text-center">
          <div class="text-2xl font-bold text-amber-600">{{ statusCounts['End-of-Support'] }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('lifecycle.endOfSupport') }}</div>
          <div class="mt-2 h-1 rounded bg-amber-500"></div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-5 text-center">
          <div class="text-2xl font-bold text-red-600">{{ statusCounts['End-of-Life'] }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('lifecycle.endOfLife') }}</div>
          <div class="mt-2 h-1 rounded bg-red-500"></div>
        </div>
        <div class="bg-white rounded-xl border border-surface-200 p-5 text-center">
          <div class="text-2xl font-bold text-orange-600">{{ eolWarnings.length }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('lifecycle.eolWarnings') }}</div>
          <div class="mt-2 h-1 rounded bg-orange-400"></div>
        </div>
      </div>

      <!-- EOL Warnings -->
      <div v-if="eolWarnings.length" class="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
          {{ t('lifecycle.warningTitle') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <a v-for="w in eolWarnings" :key="w.id" :href="linkTo('/apps/' + w.id)"
             class="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100 hover:shadow-sm transition-shadow">
            <div>
              <div class="text-sm font-medium text-gray-800">{{ w.name }}</div>
              <div class="text-xs text-gray-500">{{ w.vendor }} · {{ w.criticality }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs font-bold" :class="w.monthsLeft <= 12 ? 'text-red-600' : 'text-amber-600'">
                {{ w.monthsLeft }} {{ t('lifecycle.months') }}
              </div>
              <div class="text-[10px] text-gray-400">{{ w.targetDate }}</div>
            </div>
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <input v-model="search" type="text" :placeholder="t('lifecycle.searchPlaceholder')"
               class="flex-1 min-w-[200px] px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none" />
        <select v-model="filterStatus" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">{{ t('lifecycle.allStatuses') }}</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="filterCriticality" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">{{ t('lifecycle.allCriticalities') }}</option>
          <option v-for="c in criticalities" :key="c" :value="c">{{ c }}</option>
        </select>
        <select v-model="horizonMonths" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option :value="12">12 {{ t('lifecycle.months') }}</option>
          <option :value="24">24 {{ t('lifecycle.months') }}</option>
          <option :value="36">36 {{ t('lifecycle.months') }}</option>
          <option :value="60">60 {{ t('lifecycle.months') }}</option>
        </select>
      </div>

      <!-- Timeline Chart (SVG) -->
      <div class="bg-white rounded-xl border border-surface-200 p-5 overflow-x-auto">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ t('lifecycle.timelineTitle') }}</h3>
        <div class="min-w-[800px]">
          <svg :width="svgWidth" :height="svgHeight" class="block">
            <!-- Year grid lines -->
            <g v-for="yr in yearMarkers" :key="'yr-' + yr.year">
              <line :x1="yr.x" :y1="headerH" :x2="yr.x" :y2="svgHeight" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" />
              <text :x="yr.x + 4" :y="headerH - 6" fill="#94a3b8" font-size="11" font-family="monospace">{{ yr.year }}</text>
            </g>
            <!-- Today line -->
            <line :x1="todayX" :y1="headerH" :x2="todayX" :y2="svgHeight" stroke="#3b82f6" stroke-width="2" />
            <text :x="todayX + 4" :y="headerH - 6" fill="#3b82f6" font-size="10" font-weight="bold">{{ t('lifecycle.today') }}</text>

            <!-- App bars -->
            <g v-for="(app, idx) in timelineApps" :key="app.id" class="cursor-pointer" @click="navigateTo('/apps/' + app.id)">
              <!-- Label -->
              <text :x="4" :y="headerH + idx * rowH + rowH / 2 + 4" fill="#374151" font-size="11" font-weight="500" style="pointer-events:none">
                {{ app.name.length > 20 ? app.name.substring(0, 20) + '…' : app.name }}
              </text>
              <!-- Active bar (goLive to EOS) -->
              <rect :x="app.barStartX" :y="headerH + idx * rowH + 6"
                    :width="Math.max(app.barActiveW, 2)" :height="rowH - 12" rx="3"
                    :fill="statusColor(app.lifecycleStatus)" opacity="0.8">
                <title>{{ app.name }}: {{ app.goLiveDate || '?' }} → {{ app.endOfSupportDate || '?' }}</title>
              </rect>
              <!-- EOS→EOL bar (warning phase) -->
              <rect v-if="app.barEosW > 0" :x="app.barEosX" :y="headerH + idx * rowH + 6"
                    :width="app.barEosW" :height="rowH - 12" rx="3"
                    fill="#f59e0b" opacity="0.5">
                <title>End-of-Support → End-of-Life: {{ app.endOfSupportDate }} → {{ app.endOfLifeDate }}</title>
              </rect>
              <!-- EOL marker -->
              <circle v-if="app.eolX" :cx="app.eolX" :cy="headerH + idx * rowH + rowH / 2" r="4" fill="#ef4444" />
              <!-- Criticality dot -->
              <circle :cx="labelW - 8" :cy="headerH + idx * rowH + rowH / 2" r="4" :fill="critColor(app.criticality)" />
            </g>
          </svg>
        </div>
        <div class="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-green-500 inline-block"></span> Active</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-amber-400 inline-block"></span> End-of-Support</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-red-500 inline-block"></span> End-of-Life</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-blue-400 inline-block"></span> Planned</span>
          <span class="flex items-center gap-1 ml-4 border-l border-gray-300 pl-4"><span class="w-0.5 h-4 bg-blue-500 inline-block"></span> {{ t('lifecycle.today') }}</span>
        </div>
      </div>

      <!-- App Table -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-x-auto">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">{{ t('lifecycle.detailTable') }} ({{ filtered.length }})</h3>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-200 bg-surface-50">
              <th class="text-left px-4 py-2 font-medium text-gray-600">{{ t('lifecycle.colApp') }}</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">{{ t('lifecycle.colVendor') }}</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">{{ t('lifecycle.colStatus') }}</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">{{ t('lifecycle.colCriticality') }}</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">{{ t('lifecycle.colGoLive') }}</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">{{ t('lifecycle.colEOS') }}</th>
              <th class="text-left px-4 py-2 font-medium text-gray-600">{{ t('lifecycle.colEOL') }}</th>
              <th class="text-right px-4 py-2 font-medium text-gray-600">{{ t('lifecycle.colRemaining') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="app in filtered" :key="app.id" class="hover:bg-surface-50 cursor-pointer" @click="navigateTo('/apps/' + app.id)">
              <td class="px-4 py-2">
                <div class="font-medium text-gray-900">{{ app.name }}</div>
                <div class="text-xs text-gray-400">{{ app.id }}</div>
              </td>
              <td class="px-4 py-2 text-gray-600">{{ app.vendor }}</td>
              <td class="px-4 py-2">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="statusBadge(app.lifecycleStatus)">{{ app.lifecycleStatus }}</span>
              </td>
              <td class="px-4 py-2">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="critBadge(app.criticality)">{{ app.criticality }}</span>
              </td>
              <td class="px-4 py-2 font-mono text-xs text-gray-600">{{ app.goLiveDate || '—' }}</td>
              <td class="px-4 py-2 font-mono text-xs text-gray-600">{{ app.endOfSupportDate || '—' }}</td>
              <td class="px-4 py-2 font-mono text-xs text-gray-600">{{ app.endOfLifeDate || '—' }}</td>
              <td class="px-4 py-2 text-right">
                <span v-if="monthsUntilEOL(app) !== null" class="text-xs font-bold"
                      :class="monthsUntilEOL(app) <= 0 ? 'text-red-600' : monthsUntilEOL(app) <= 12 ? 'text-orange-600' : monthsUntilEOL(app) <= 24 ? 'text-amber-600' : 'text-green-600'">
                  {{ monthsUntilEOL(app) <= 0 ? t('lifecycle.expired') : monthsUntilEOL(app) + ' ' + t('lifecycle.months') }}
                </span>
                <span v-else class="text-xs text-gray-400">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed } = Vue
    const search = ref('')
    const filterStatus = ref('')
    const filterCriticality = ref('')
    const horizonMonths = ref(36)

    const t = (key) => i18n.t(key)

    const apps = computed(() => store.data.applications || [])
    const statuses = ['Planned', 'Active', 'End-of-Support', 'End-of-Life']
    const criticalities = computed(() => {
      const set = new Set(apps.value.map(a => a.criticality).filter(Boolean))
      return [...set].sort()
    })

    const statusCounts = computed(() => {
      const c = { Planned: 0, Active: 0, 'End-of-Support': 0, 'End-of-Life': 0 }
      apps.value.forEach(a => { if (c[a.lifecycleStatus] !== undefined) c[a.lifecycleStatus]++ })
      return c
    })

    const filtered = computed(() => {
      let list = [...apps.value]
      const q = search.value.toLowerCase()
      if (q) list = list.filter(a =>
        a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) ||
        (a.vendor || '').toLowerCase().includes(q)
      )
      if (filterStatus.value) list = list.filter(a => a.lifecycleStatus === filterStatus.value)
      if (filterCriticality.value) list = list.filter(a => a.criticality === filterCriticality.value)
      return list.sort((a, b) => {
        const da = a.endOfLifeDate || '9999'
        const db = b.endOfLifeDate || '9999'
        return da.localeCompare(db)
      })
    })

    function monthsUntilEOL (app) {
      if (!app.endOfLifeDate) return null
      const now = new Date()
      const eol = new Date(app.endOfLifeDate)
      return Math.round((eol - now) / (1000 * 60 * 60 * 24 * 30.44))
    }

    const eolWarnings = computed(() => {
      const now = new Date()
      const horizon = new Date(now)
      horizon.setMonth(horizon.getMonth() + horizonMonths.value)
      return apps.value
        .filter(a => {
          if (!a.endOfLifeDate) return false
          const eol = new Date(a.endOfLifeDate)
          return eol > now && eol <= horizon
        })
        .map(a => {
          const eol = new Date(a.endOfLifeDate)
          const ml = Math.round((eol - now) / (1000 * 60 * 60 * 24 * 30.44))
          return { id: a.id, name: a.name, vendor: a.vendor, criticality: a.criticality, monthsLeft: ml, targetDate: a.endOfLifeDate }
        })
        .sort((a, b) => a.monthsLeft - b.monthsLeft)
    })

    // ── SVG Timeline calculations ──
    const labelW = 180
    const rowH = 32
    const headerH = 24
    const chartW = 700

    const svgWidth = computed(() => labelW + chartW)
    const svgHeight = computed(() => headerH + filtered.value.length * rowH + 4)

    const timeRange = computed(() => {
      const now = new Date()
      let minDate = new Date(now.getFullYear() - 2, 0, 1)
      let maxDate = new Date(now.getFullYear() + 6, 11, 31)
      return { min: minDate, max: maxDate }
    })

    function dateToX (dateStr) {
      if (!dateStr) return null
      const d = new Date(dateStr)
      const { min, max } = timeRange.value
      const ratio = (d - min) / (max - min)
      return labelW + Math.max(0, Math.min(chartW, ratio * chartW))
    }

    const todayX = computed(() => dateToX(new Date().toISOString().slice(0, 10)))

    const yearMarkers = computed(() => {
      const { min, max } = timeRange.value
      const markers = []
      for (let y = min.getFullYear(); y <= max.getFullYear(); y++) {
        markers.push({ year: y, x: dateToX(y + '-01-01') })
      }
      return markers
    })

    const timelineApps = computed(() => {
      return filtered.value.map(app => {
        const startX = dateToX(app.goLiveDate) || labelW
        const eosX = dateToX(app.endOfSupportDate)
        const eolX = dateToX(app.endOfLifeDate)
        const activeEnd = eosX || eolX || (labelW + chartW)
        return {
          ...app,
          barStartX: startX,
          barActiveW: Math.max(activeEnd - startX, 2),
          barEosX: eosX || 0,
          barEosW: (eosX && eolX) ? Math.max(eolX - eosX, 0) : 0,
          eolX: eolX
        }
      })
    })

    function statusColor (status) {
      return { Planned: '#60a5fa', Active: '#22c55e', 'End-of-Support': '#f59e0b', 'End-of-Life': '#ef4444' }[status] || '#94a3b8'
    }
    function critColor (c) {
      return { 'Mission-Critical': '#ef4444', 'Business-Critical': '#f97316', 'Business-Operational': '#eab308', 'Administrative': '#94a3b8' }[c] || '#94a3b8'
    }
    function statusBadge (s) {
      return { Planned: 'bg-blue-100 text-blue-700', Active: 'bg-green-100 text-green-700', 'End-of-Support': 'bg-amber-100 text-amber-700', 'End-of-Life': 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-600'
    }
    function critBadge (c) {
      return { 'Mission-Critical': 'bg-red-100 text-red-700', 'Business-Critical': 'bg-orange-100 text-orange-700', 'Business-Operational': 'bg-yellow-100 text-yellow-700', 'Administrative': 'bg-gray-100 text-gray-600' }[c] || 'bg-gray-100 text-gray-600'
    }

    return {
      store, linkTo, navigateTo, t,
      search, filterStatus, filterCriticality, horizonMonths,
      apps, statuses, criticalities, statusCounts, filtered, eolWarnings,
      monthsUntilEOL, statusColor, critColor, statusBadge, critBadge,
      svgWidth, svgHeight, headerH, rowH, labelW,
      todayX, yearMarkers, timelineApps
    }
  }
}
