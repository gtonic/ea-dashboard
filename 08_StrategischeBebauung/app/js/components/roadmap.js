// roadmap.js — Strategy Roadmap / Gantt Timeline
import { store } from '../store.js'
import { linkTo, navigateTo } from '../router.js'

export default {
  name: 'RoadmapView',
  template: `
    <div class="space-y-4">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-3 no-print">
        <select v-model="filterStatus" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">All Status</option>
          <option value="green">Green</option>
          <option value="yellow">Yellow</option>
          <option value="red">Red</option>
        </select>
        <select v-model="filterConformity" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="">All Conformity</option>
          <option v-for="c in store.data.enums.conformity" :key="c" :value="c">{{ c }}</option>
        </select>
        <select v-model="groupBy" class="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white">
          <option value="domain">Group by Domain</option>
          <option value="category">Group by Category</option>
          <option value="status">Group by Status</option>
        </select>
        <button @click="printView()" class="ml-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Print / PDF
        </button>
      </div>

      <div class="text-xs text-gray-500 no-print">{{ filteredProjects.length }} projects · Showing {{ timelineQuarters.length }} quarters</div>

      <!-- Legend -->
      <div class="flex flex-wrap gap-4 text-xs text-gray-600 no-print">
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Green</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Yellow</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Red</span>
        <span class="flex items-center gap-1"><span class="w-3 h-1 bg-blue-400 inline-block rounded"></span> Konform</span>
        <span class="flex items-center gap-1"><span class="w-3 h-1 bg-orange-400 inline-block rounded"></span> Teilkonform</span>
        <span class="flex items-center gap-1"><span class="w-3 h-1 bg-red-400 inline-block rounded"></span> Widerspricht</span>
        <span class="flex items-center gap-1"><span class="w-0.5 h-4 bg-red-600 inline-block"></span> Today</span>
        <span class="flex items-center gap-1">◆ Milestone</span>
      </div>

      <!-- Gantt Chart -->
      <div class="bg-white rounded-xl border border-surface-200 overflow-x-auto">
        <div class="min-w-[800px]">
          <!-- Quarter Header -->
          <div class="flex border-b border-surface-200 bg-surface-50 sticky top-0 z-10">
            <div class="w-56 shrink-0 px-4 py-2 text-xs font-semibold text-gray-600 border-r border-surface-200">Project</div>
            <div class="flex-1 flex">
              <div v-for="q in timelineQuarters" :key="q.key"
                   class="flex-1 text-center py-2 text-xs font-medium border-r border-surface-100 last:border-r-0"
                   :class="q.isCurrent ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-500'">
                {{ q.label }}
              </div>
            </div>
          </div>

          <!-- Swim lanes grouped -->
          <div v-for="group in groupedProjects" :key="group.label">
            <!-- Group header -->
            <div class="flex items-center px-4 py-2 bg-surface-50 border-b border-surface-200">
              <span v-if="group.color" class="domain-swatch mr-2" :style="{ backgroundColor: group.color }"></span>
              <span class="text-xs font-semibold text-gray-700">{{ group.label }}</span>
              <span class="ml-2 text-xs text-gray-400">({{ group.projects.length }})</span>
            </div>

            <!-- Project rows -->
            <div v-for="p in group.projects" :key="p.id"
                 class="flex border-b border-surface-100 hover:bg-surface-50 transition-colors group/row">
              <!-- Project name column -->
              <div class="w-56 shrink-0 px-4 py-2 border-r border-surface-200 cursor-pointer"
                   @click="navigateTo('/projects/' + p.id)">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full shrink-0" :class="statusDotClass(p.status)"></span>
                  <span class="text-sm text-gray-900 font-medium truncate group-hover/row:text-primary-600">{{ p.name }}</span>
                </div>
                <div class="text-[10px] text-gray-400 ml-4">{{ p.id }} · €{{ (p.budget / 1000).toFixed(0) }}k</div>
              </div>

              <!-- Timeline area -->
              <div class="flex-1 flex relative py-1.5">
                <!-- Today line -->
                <div v-if="todayPosition >= 0 && todayPosition <= 100"
                     class="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                     :style="{ left: todayPosition + '%' }"></div>

                <!-- Quarter grid lines -->
                <div v-for="(q, qi) in timelineQuarters" :key="q.key"
                     class="flex-1 border-r border-surface-100 last:border-r-0"></div>

                <!-- Bar -->
                <div class="absolute top-1/2 -translate-y-1/2 h-5 rounded flex items-center cursor-pointer z-10"
                     :style="barStyle(p)"
                     :title="p.name + ' (' + p.start + ' → ' + p.end + ')'"
                     @click="navigateTo('/projects/' + p.id)">
                  <!-- Conformity indicator (bottom border) -->
                  <div class="absolute bottom-0 left-0 right-0 h-1 rounded-b"
                       :class="conformityBarClass(p.conformity)"></div>
                  <!-- Label inside bar -->
                  <span class="text-[9px] text-white font-medium px-1.5 truncate drop-shadow-sm">{{ p.name }}</span>
                </div>

                <!-- Milestone markers (start & end) -->
                <div v-if="milestoneStartPos(p) !== null"
                     class="absolute top-1/2 -translate-y-1/2 z-10 text-xs"
                     :style="{ left: milestoneStartPos(p) + '%' }"
                     :title="'Start: ' + p.start">
                  <span class="text-gray-500">◆</span>
                </div>
                <div v-if="milestoneEndPos(p) !== null"
                     class="absolute top-1/2 -translate-y-1/2 z-10 text-xs"
                     :style="{ left: milestoneEndPos(p) + '%' }"
                     :title="'End: ' + p.end">
                  <span class="text-gray-500">◆</span>
                </div>

                <!-- Dependency arrows (simplified: lines to dependent projects) -->
                <template v-for="dep in depsFrom(p.id)" :key="dep.targetProjectId">
                  <div v-if="depArrowStyle(p, dep)"
                       class="absolute z-5 border-t-2 border-dashed"
                       :class="depTypeColor(dep.type)"
                       :style="depArrowStyle(p, dep)"
                       :title="dep.description || (dep.type + ' dependency')">
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredProjects.length === 0" class="text-center py-12 text-gray-400 text-sm">
            No projects match the current filters
          </div>
        </div>
      </div>
    </div>
  `,
  setup () {
    const { ref, computed } = Vue

    const filterStatus = ref('')
    const filterConformity = ref('')
    const groupBy = ref('domain')

    // ── Quarter parsing ──

    function parseQuarter (qStr) {
      if (!qStr) return null
      const match = qStr.match(/Q(\d)\/(\d{4})/)
      if (!match) return null
      return { q: parseInt(match[1]), y: parseInt(match[2]) }
    }

    function quarterToIndex (q) {
      if (!q) return null
      return q.y * 4 + q.q
    }

    function indexToQuarter (idx) {
      const y = Math.floor((idx - 1) / 4)
      const q = ((idx - 1) % 4) + 1
      return { q, y, label: 'Q' + q + '/' + y, key: 'Q' + q + '-' + y }
    }

    // ── Timeline range ──

    const timelineQuarters = computed(() => {
      const projects = store.data.projects
      if (!projects.length) return []

      let minIdx = Infinity, maxIdx = -Infinity
      projects.forEach(p => {
        const si = quarterToIndex(parseQuarter(p.start))
        const ei = quarterToIndex(parseQuarter(p.end))
        if (si !== null && si < minIdx) minIdx = si
        if (ei !== null && ei > maxIdx) maxIdx = ei
      })

      if (minIdx === Infinity) return []

      // Add one quarter padding on each side
      minIdx = Math.max(1, minIdx - 1)
      maxIdx = maxIdx + 1

      const quarters = []
      for (let i = minIdx; i <= maxIdx; i++) {
        const qObj = indexToQuarter(i)
        const now = new Date()
        const currentQ = Math.ceil((now.getMonth() + 1) / 3)
        const currentY = now.getFullYear()
        qObj.isCurrent = qObj.q === currentQ && qObj.y === currentY
        quarters.push(qObj)
      }
      return quarters
    })

    const timelineMinIdx = computed(() => {
      return timelineQuarters.value.length > 0
        ? quarterToIndex(timelineQuarters.value[0])
        : 0
    })

    const timelineMaxIdx = computed(() => {
      return timelineQuarters.value.length > 0
        ? quarterToIndex(timelineQuarters.value[timelineQuarters.value.length - 1])
        : 1
    })

    const timelineRange = computed(() => timelineMaxIdx.value - timelineMinIdx.value + 1)

    // ── Today position ──
    const todayPosition = computed(() => {
      const now = new Date()
      const currentQ = Math.ceil((now.getMonth() + 1) / 3)
      const currentY = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      // Calculate sub-quarter position
      const qStartMonth = (currentQ - 1) * 3 + 1
      const monthInQ = currentMonth - qStartMonth
      const dayFrac = (now.getDate() - 1) / 30
      const subQ = (monthInQ + dayFrac) / 3

      const idx = currentY * 4 + currentQ
      const pos = ((idx - timelineMinIdx.value + subQ) / timelineRange.value) * 100
      return pos
    })

    // ── Filtered projects ──

    const filteredProjects = computed(() => {
      let list = [...store.data.projects]
      if (filterStatus.value) list = list.filter(p => p.status === filterStatus.value)
      if (filterConformity.value) list = list.filter(p => p.conformity === filterConformity.value)
      return list
    })

    // ── Grouped projects ──

    const groupedProjects = computed(() => {
      const projects = filteredProjects.value
      const groups = []

      if (groupBy.value === 'domain') {
        const domainMap = new Map()
        projects.forEach(p => {
          const d = store.domainById(p.primaryDomain)
          const key = d ? d.id : 'none'
          if (!domainMap.has(key)) {
            domainMap.set(key, {
              label: d ? d.name : 'No Domain',
              color: d ? d.color : '#94a3b8',
              projects: []
            })
          }
          domainMap.get(key).projects.push(p)
        })
        domainMap.forEach(g => groups.push(g))
      } else if (groupBy.value === 'category') {
        const catMap = new Map()
        projects.forEach(p => {
          const key = p.category || 'Uncategorized'
          if (!catMap.has(key)) {
            catMap.set(key, { label: key, color: null, projects: [] })
          }
          catMap.get(key).projects.push(p)
        })
        catMap.forEach(g => groups.push(g))
      } else if (groupBy.value === 'status') {
        const statusMap = new Map([
          ['green', { label: 'Green', color: '#22c55e', projects: [] }],
          ['yellow', { label: 'Yellow', color: '#eab308', projects: [] }],
          ['red', { label: 'Red', color: '#ef4444', projects: [] }]
        ])
        projects.forEach(p => {
          const key = p.status || 'green'
          if (statusMap.has(key)) statusMap.get(key).projects.push(p)
        })
        statusMap.forEach((g, k) => { if (g.projects.length > 0) groups.push(g) })
      }

      return groups
    })

    // ── Bar positioning ──

    function barStyle (p) {
      const si = quarterToIndex(parseQuarter(p.start))
      const ei = quarterToIndex(parseQuarter(p.end))
      if (si === null || ei === null) return { display: 'none' }

      const left = ((si - timelineMinIdx.value) / timelineRange.value) * 100
      const width = ((ei - si + 1) / timelineRange.value) * 100

      const bgColor = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' }[p.status] || '#94a3b8'

      return {
        left: left + '%',
        width: Math.max(width, 2) + '%',
        backgroundColor: bgColor + 'DD'
      }
    }

    function milestoneStartPos (p) {
      const si = quarterToIndex(parseQuarter(p.start))
      if (si === null) return null
      return ((si - timelineMinIdx.value) / timelineRange.value) * 100 - 0.5
    }

    function milestoneEndPos (p) {
      const ei = quarterToIndex(parseQuarter(p.end))
      if (ei === null) return null
      return ((ei - timelineMinIdx.value + 1) / timelineRange.value) * 100 - 0.5
    }

    // ── Status / conformity helpers ──

    function statusDotClass (s) {
      return { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500' }[s] || 'bg-gray-400'
    }

    function conformityBarClass (c) {
      return {
        'Konform': 'bg-blue-400',
        'Teilkonform': 'bg-orange-400',
        'Widerspricht': 'bg-red-400'
      }[c] || 'bg-gray-300'
    }

    // ── Dependencies ──

    function depsFrom (projectId) {
      return store.data.projectDependencies.filter(d => d.sourceProjectId === projectId)
    }

    function depTypeColor (type) {
      return {
        T: 'border-blue-400',
        D: 'border-purple-400',
        P: 'border-orange-400',
        R: 'border-red-400',
        F: 'border-green-400',
        Z: 'border-gray-400'
      }[type] || 'border-gray-400'
    }

    function depArrowStyle (sourceProject, dep) {
      const sp = sourceProject
      const tp = store.projectById(dep.targetProjectId)
      if (!tp) return null

      const sei = quarterToIndex(parseQuarter(sp.end))
      const tsi = quarterToIndex(parseQuarter(tp.start))
      if (sei === null || tsi === null) return null

      const startPct = ((sei - timelineMinIdx.value + 1) / timelineRange.value) * 100
      const endPct = ((tsi - timelineMinIdx.value) / timelineRange.value) * 100

      if (endPct <= startPct) return null

      return {
        left: startPct + '%',
        width: (endPct - startPct) + '%',
        top: '50%'
      }
    }

    function printView () {
      window.print()
    }

    return {
      store, linkTo, navigateTo,
      filterStatus, filterConformity, groupBy,
      timelineQuarters, filteredProjects, groupedProjects,
      todayPosition,
      barStyle, milestoneStartPos, milestoneEndPos,
      statusDotClass, conformityBarClass,
      depsFrom, depTypeColor, depArrowStyle,
      printView
    }
  }
}
