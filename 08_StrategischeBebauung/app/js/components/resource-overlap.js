// resource-overlap.js — Resource Overlap Analysis: Conflicts, Timeline Collisions, Cross-Domain Complexity
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'ResourceOverlap',
  template: `
    <div class="space-y-6">

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">App-Konflikte</div>
          <div class="mt-1 text-2xl font-bold text-red-600">{{ appConflicts.length }}</div>
          <div class="text-xs text-gray-400 mt-1">Apps in &ge; 2 Projekten</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timeline-Kollisionen</div>
          <div class="mt-1 text-2xl font-bold text-orange-600">{{ timelineCollisions.length }}</div>
          <div class="text-xs text-gray-400 mt-1">Gleichzeitige Änderungen</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Cross-Domain</div>
          <div class="mt-1 text-2xl font-bold text-blue-600">{{ crossDomainProjects.length }}</div>
          <div class="text-xs text-gray-400 mt-1">Projekte &ge; 2 Domänen</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Kritische Aktionen</div>
          <div class="mt-1 text-2xl font-bold text-yellow-600">{{ criticalActions.length }}</div>
          <div class="text-xs text-gray-400 mt-1">Ablösen-Konflikte</div>
        </div>
      </div>

      <!-- App-Conflict Matrix: Apps affected by multiple projects -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">App-Konflikte – Applikationen in mehreren Projekten</h2>
        <div v-if="appConflicts.length === 0" class="text-sm text-gray-500 italic">Keine Applikationen werden von mehreren Projekten gleichzeitig betroffen ✓</div>
        <div v-else class="space-y-4">
          <div v-for="conflict in appConflicts" :key="conflict.appId"
               class="p-4 rounded-lg border"
               :class="conflict.hasCritical ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                     :class="conflict.hasCritical ? 'bg-red-200 text-red-700' : 'bg-yellow-200 text-yellow-700'">
                  {{ conflict.projects.length }}
                </div>
                <div>
                  <a :href="linkTo('/apps/' + conflict.appId)" class="text-sm font-semibold text-primary-600 hover:underline">{{ conflict.appName }}</a>
                  <div class="text-xs text-gray-500">{{ conflict.appVendor }} · {{ conflict.appCriticality }}</div>
                </div>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    :class="conflict.hasCritical ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'">
                {{ conflict.hasCritical ? 'Kritischer Konflikt' : 'Ressourcen-Überlappung' }}
              </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <a v-for="proj in conflict.projects" :key="proj.id"
                 :href="linkTo('/projects/' + proj.id)"
                 class="flex items-center gap-2 p-2 rounded bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-300 text-xs">
                <span class="w-2 h-2 rounded-full shrink-0"
                      :class="proj.status === 'green' ? 'bg-green-500' : proj.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'"></span>
                <span class="font-medium truncate">{{ proj.name }}</span>
                <span class="ml-auto px-1.5 py-0.5 rounded text-[10px]"
                      :class="proj.action === 'ablösen' ? 'bg-red-100 text-red-600' : proj.action === 'einführen' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'">
                  {{ proj.action }}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline Collisions -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Timeline-Kollisionen – Gleichzeitige Änderungen an derselben App</h2>
        <div v-if="timelineCollisions.length === 0" class="text-sm text-gray-500 italic">Keine zeitlichen Überlappungen erkannt ✓</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-surface-200 dark:border-surface-700">
                <th class="py-2 pr-4">Applikation</th>
                <th class="py-2 pr-4">Projekt A</th>
                <th class="py-2 pr-4">Projekt B</th>
                <th class="py-2 pr-4">Überlappung</th>
                <th class="py-2 pr-4">Risiko</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(col, idx) in timelineCollisions" :key="idx" class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800">
                <td class="py-2 pr-4">
                  <a :href="linkTo('/apps/' + col.appId)" class="text-primary-600 hover:underline font-medium">{{ col.appName }}</a>
                </td>
                <td class="py-2 pr-4">
                  <a :href="linkTo('/projects/' + col.projA.id)" class="text-primary-600 hover:underline">{{ col.projA.name }}</a>
                  <div class="text-xs text-gray-400">{{ col.projA.start }} – {{ col.projA.end }}</div>
                </td>
                <td class="py-2 pr-4">
                  <a :href="linkTo('/projects/' + col.projB.id)" class="text-primary-600 hover:underline">{{ col.projB.name }}</a>
                  <div class="text-xs text-gray-400">{{ col.projB.start }} – {{ col.projB.end }}</div>
                </td>
                <td class="py-2 pr-4 text-xs text-gray-600 dark:text-gray-400">{{ col.overlapQuarters }} Quartal(e)</td>
                <td class="py-2 pr-4">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="col.riskLevel === 'high' ? 'bg-red-100 text-red-700' : col.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'">
                    {{ col.riskLevel === 'high' ? 'Hoch' : col.riskLevel === 'medium' ? 'Mittel' : 'Niedrig' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Cross-Domain Projects Complexity -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Cross-Domain-Projekte – Komplexitäts-Indikator</h2>
        <div v-if="crossDomainProjects.length === 0" class="text-sm text-gray-500 italic">Keine domänenübergreifenden Projekte vorhanden ✓</div>
        <div v-else class="space-y-3">
          <a v-for="proj in crossDomainProjects" :key="proj.id"
             :href="linkTo('/projects/' + proj.id)"
             class="block p-4 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <span class="w-2.5 h-2.5 rounded-full shrink-0"
                      :class="proj.status === 'green' ? 'bg-green-500' : proj.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'"></span>
                <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ proj.name }}</span>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                    :class="proj.complexity === 'Hoch' ? 'bg-red-100 text-red-700' : proj.complexity === 'Mittel' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'">
                Komplexität: {{ proj.complexity }}
              </span>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <span v-for="dom in proj.allDomains" :key="dom.id"
                    class="text-xs px-2 py-0.5 rounded-full border"
                    :class="dom.isPrimary ? 'bg-primary-100 text-primary-700 border-primary-300' : 'bg-surface-100 text-gray-600 border-surface-300 dark:bg-surface-800 dark:text-gray-400 dark:border-surface-600'">
                {{ dom.name }} {{ dom.isPrimary ? '(Primär)' : '' }}
              </span>
            </div>
            <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {{ proj.domainCount }} Domänen · {{ (proj.affectedApps || []).length }} Apps · Budget: {{ formatBudget(proj.budget) }}
            </div>
          </a>
        </div>
      </div>

      <!-- Critical Action Conflicts: retire vs. modify -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Kritische Aktionskonflikte – Ablösen vs. Verändern</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Applikationen die gleichzeitig abgelöst und verändert werden sollen</p>
        <div v-if="criticalActions.length === 0" class="text-sm text-gray-500 italic">Keine widersprüchlichen Aktionen erkannt ✓</div>
        <div v-else class="space-y-3">
          <div v-for="ca in criticalActions" :key="ca.appId"
               class="p-4 rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <a :href="linkTo('/apps/' + ca.appId)" class="text-sm font-semibold text-primary-600 hover:underline">{{ ca.appName }}</a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div v-for="proj in ca.retireProjects" :key="proj.id"
                   class="flex items-center gap-2 p-2 rounded bg-red-100 dark:bg-red-900/30 text-xs">
                <span class="px-1.5 py-0.5 rounded bg-red-200 text-red-700 font-medium">ablösen</span>
                <a :href="linkTo('/projects/' + proj.id)" class="text-primary-600 hover:underline truncate">{{ proj.name }}</a>
              </div>
              <div v-for="proj in ca.modifyProjects" :key="proj.id"
                   class="flex items-center gap-2 p-2 rounded bg-blue-100 dark:bg-blue-900/30 text-xs">
                <span class="px-1.5 py-0.5 rounded bg-blue-200 text-blue-700 font-medium">verändern</span>
                <a :href="linkTo('/projects/' + proj.id)" class="text-primary-600 hover:underline truncate">{{ proj.name }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  setup () {
    const { computed } = Vue

    const projects = computed(() => store.data.projects || [])

    // Parse quarter string like "Q1/2026" to a comparable number (2026*4 + 1)
    function parseQuarter (q) {
      if (!q) return null
      const m = q.match(/Q(\d)\/(\d{4})/)
      if (!m) return null
      return parseInt(m[2]) * 4 + parseInt(m[1])
    }

    // Check if two project timelines overlap
    function timelinesOverlap (p1, p2) {
      const s1 = parseQuarter(p1.start)
      const e1 = parseQuarter(p1.end)
      const s2 = parseQuarter(p2.start)
      const e2 = parseQuarter(p2.end)
      if (!s1 || !e1 || !s2 || !e2) return 0
      const overlapStart = Math.max(s1, s2)
      const overlapEnd = Math.min(e1, e2)
      return Math.max(0, overlapEnd - overlapStart + 1)
    }

    // App conflicts: apps affected by >= 2 projects
    const appConflicts = computed(() => {
      const appProjects = {}
      projects.value.forEach(p => {
        (p.affectedApps || []).forEach(aa => {
          if (!appProjects[aa.appId]) appProjects[aa.appId] = []
          appProjects[aa.appId].push({ ...p, action: aa.action })
        })
      })

      return Object.entries(appProjects)
        .filter(([, projs]) => projs.length >= 2)
        .map(([appId, projs]) => {
          const app = store.appById(appId)
          const hasCritical = projs.some(p => p.action === 'ablösen') && projs.some(p => p.action !== 'ablösen')
          return {
            appId,
            appName: app ? app.name : appId,
            appVendor: app ? app.vendor : '',
            appCriticality: app ? app.criticality : '',
            projects: projs,
            hasCritical
          }
        })
        .sort((a, b) => b.projects.length - a.projects.length)
    })

    // Timeline collisions: projects touching same app with overlapping timelines
    const timelineCollisions = computed(() => {
      const collisions = []
      const appProjects = {}
      projects.value.forEach(p => {
        (p.affectedApps || []).forEach(aa => {
          if (!appProjects[aa.appId]) appProjects[aa.appId] = []
          appProjects[aa.appId].push(p)
        })
      })

      Object.entries(appProjects).forEach(([appId, projs]) => {
        for (let i = 0; i < projs.length; i++) {
          for (let j = i + 1; j < projs.length; j++) {
            const overlap = timelinesOverlap(projs[i], projs[j])
            if (overlap > 0) {
              const app = store.appById(appId)
              const isCritical = app && (app.criticality === 'Mission-Critical' || app.criticality === 'Business-Critical')
              collisions.push({
                appId,
                appName: app ? app.name : appId,
                projA: projs[i],
                projB: projs[j],
                overlapQuarters: overlap,
                riskLevel: overlap >= 3 || isCritical ? 'high' : overlap >= 2 ? 'medium' : 'low'
              })
            }
          }
        }
      })

      return collisions.sort((a, b) => b.overlapQuarters - a.overlapQuarters)
    })

    // Cross-domain projects (projects spanning >= 2 domains)
    const crossDomainProjects = computed(() => {
      return projects.value
        .map(p => {
          const allDomainIds = new Set()
          if (p.primaryDomain) allDomainIds.add(p.primaryDomain)
          if (p.secondaryDomains) p.secondaryDomains.forEach(d => allDomainIds.add(d))
          const domainCount = allDomainIds.size

          const allDomains = Array.from(allDomainIds).map(id => {
            const d = store.domainById(id)
            return { id, name: d ? d.name : 'Unknown', isPrimary: id === p.primaryDomain }
          })

          const complexity = domainCount >= 4 ? 'Hoch' : domainCount >= 2 ? 'Mittel' : 'Niedrig'

          return { ...p, domainCount, allDomains, complexity }
        })
        .filter(p => p.domainCount >= 2)
        .sort((a, b) => b.domainCount - a.domainCount)
    })

    // Critical action conflicts: apps being both retired and modified
    const criticalActions = computed(() => {
      const appActions = {}
      projects.value.forEach(p => {
        (p.affectedApps || []).forEach(aa => {
          if (!appActions[aa.appId]) appActions[aa.appId] = { retire: [], modify: [] }
          if (aa.action === 'ablösen') {
            appActions[aa.appId].retire.push(p)
          } else {
            appActions[aa.appId].modify.push(p)
          }
        })
      })

      return Object.entries(appActions)
        .filter(([, actions]) => actions.retire.length > 0 && actions.modify.length > 0)
        .map(([appId, actions]) => {
          const app = store.appById(appId)
          return {
            appId,
            appName: app ? app.name : appId,
            retireProjects: actions.retire,
            modifyProjects: actions.modify
          }
        })
    })

    function formatBudget (val) {
      if (!val) return '—'
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
    }

    return {
      store, linkTo,
      appConflicts, timelineCollisions, crossDomainProjects, criticalActions,
      formatBudget
    }
  }
}
