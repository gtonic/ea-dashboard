// project-heatmap.js — Domain × Project mapping heatmap
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'ProjectHeatmap',
  template: `
    <div class="space-y-4">
      <p class="text-sm text-gray-500">Rows = Domains · Columns = Projects. Dark cells = primary domain, light cells = secondary involvement.</p>

      <div class="relative">
        <p class="text-xs text-gray-400 mb-1 md:hidden">← Horizontal scrollen →</p>
        <div class="bg-white rounded-xl border border-surface-200 overflow-auto">
        <table class="text-xs border-collapse min-w-max">
          <thead class="sticky top-0 z-20 bg-white">
            <tr>
              <th class="sticky left-0 z-30 bg-surface-50 px-3 py-2 text-left font-medium text-gray-600 border-b border-r border-surface-200 min-w-[200px]">Domain</th>
              <th v-for="p in store.data.projects" :key="p.id"
                  class="px-1 py-2 border-b border-surface-200 text-center font-medium text-gray-600 min-w-[50px]"
                  :title="p.name">
                <div style="writing-mode: vertical-lr; transform: rotate(180deg); max-height: 120px; overflow: hidden;">
                  {{ p.name.length > 20 ? p.name.slice(0, 18) + '…' : p.name }}
                </div>
              </th>
              <th class="px-3 py-2 border-b border-surface-200 text-center font-medium text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="domain in store.data.domains" :key="domain.id" class="hover:bg-surface-50">
              <td class="sticky left-0 z-10 bg-white px-3 py-2 border-b border-r border-surface-100 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="domain-swatch" :style="{ backgroundColor: domain.color }"></span>
                  <a :href="linkTo('/domains/' + domain.id)" class="text-gray-700 hover:text-primary-600">{{ domain.id }}. {{ domain.name }}</a>
                </div>
              </td>
              <td v-for="p in store.data.projects" :key="p.id"
                  class="border-b border-surface-100 text-center p-0">
                <div v-if="p.primaryDomain === domain.id"
                     class="w-full h-full py-2 font-bold text-white"
                     :style="{ backgroundColor: domain.color }"
                     :title="p.name + ' — Primary'">
                  P
                </div>
                <div v-else-if="p.secondaryDomains && p.secondaryDomains.includes(domain.id)"
                     class="w-full h-full py-2"
                     :style="{ backgroundColor: domain.color + '30', color: domain.color }"
                     :title="p.name + ' — Secondary'">
                  S
                </div>
              </td>
              <td class="px-3 py-2 border-b border-surface-100 text-center text-gray-700 font-medium">
                {{ projectCount(domain.id) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-surface-50">
              <td class="sticky left-0 z-10 bg-surface-50 px-3 py-2 border-t border-r border-surface-200 font-medium text-gray-600">Total</td>
              <td v-for="p in store.data.projects" :key="p.id" class="px-1 py-2 border-t border-surface-200 text-center text-gray-600 font-medium">
                {{ domainCount(p) }}
              </td>
              <td class="px-3 py-2 border-t border-surface-200"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      </div>

      <!-- Summary stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-surface-200 p-4 text-center" v-for="stat in summaryStats" :key="stat.label">
          <div class="text-2xl font-bold" :style="{ color: stat.color }">{{ stat.value }}</div>
          <div class="text-xs text-gray-500">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-6 text-xs text-gray-500">
        <span class="flex items-center gap-1"><span class="w-4 h-4 rounded bg-primary-500 text-white text-center text-[10px] leading-4 font-bold">P</span> Primary Domain</span>
        <span class="flex items-center gap-1"><span class="w-4 h-4 rounded bg-primary-100 text-primary-600 text-center text-[10px] leading-4">S</span> Secondary Involvement</span>
      </div>
    </div>
  `,
  setup () {
    const { computed } = Vue

    function projectCount (domainId) {
      return store.data.projects.filter(p =>
        p.primaryDomain === domainId || (p.secondaryDomains && p.secondaryDomains.includes(domainId))
      ).length
    }

    function domainCount (project) {
      return 1 + (project.secondaryDomains ? project.secondaryDomains.length : 0)
    }

    const summaryStats = computed(() => {
      // Domains with most projects
      const domainCounts = store.data.domains.map(d => ({ name: d.name, count: projectCount(d.id), color: d.color }))
      domainCounts.sort((a, b) => b.count - a.count)
      const topDomain = domainCounts[0]
      const coldDomains = domainCounts.filter(d => d.count === 0)

      return [
        { label: 'Most Active Domain', value: topDomain ? topDomain.name.split(' ')[0] : '—', color: topDomain?.color || '#94a3b8' },
        { label: 'Projects', value: store.totalProjects, color: '#3b82f6' },
        { label: 'Cross-Domain Projects', value: store.data.projects.filter(p => p.secondaryDomains && p.secondaryDomains.length > 0).length, color: '#8b5cf6' },
        { label: 'Domains w/o Projects', value: coldDomains.length, color: coldDomains.length > 0 ? '#ef4444' : '#10b981' }
      ]
    })

    return { store, linkTo, projectCount, domainCount, summaryStats }
  }
}
