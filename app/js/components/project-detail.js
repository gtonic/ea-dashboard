// project-detail.js — Project detail view
import { store } from '../store.js'
import { router, linkTo, navigateTo } from '../router.js'

export default {
  name: 'ProjectDetail',
  template: `
    <div v-if="project" class="space-y-6">
      <a :href="linkTo('/projects')" class="text-sm text-gray-500 hover:text-primary-600">← Projects</a>

      <!-- Header -->
      <div class="bg-white rounded-xl border border-surface-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <span class="w-3 h-3 rounded-full" :class="statusDot(project.status)"></span>
              <h2 class="text-xl font-bold text-gray-900">{{ project.name }}</h2>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="catClass(project.category)">{{ project.category }}</span>
            </div>
            <div class="text-sm text-gray-500">{{ project.id }} · {{ project.start }} → {{ project.end }}</div>
            <p v-if="project.statusText" class="text-sm mt-2 px-3 py-1.5 rounded-lg"
               :class="project.status === 'red' ? 'bg-red-50 text-red-700' : project.status === 'yellow' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'">
              {{ project.statusText }}
            </p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button @click="showEdit = true" class="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-surface-100">Edit</button>
            <button @click="confirmDelete" class="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs hover:bg-red-50">Delete</button>
          </div>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-surface-100">
          <div>
            <div class="text-xs text-gray-500">Budget</div>
            <div class="text-lg font-bold text-gray-800">€{{ project.budget?.toLocaleString() }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Primary Domain</div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="domain-swatch" :style="{ backgroundColor: domainColor(project.primaryDomain) }"></span>
              <span class="text-sm font-medium text-gray-800">{{ domainName(project.primaryDomain) }}</span>
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Sponsor</div>
            <div class="text-sm font-medium text-gray-800">{{ project.sponsor || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Project Lead</div>
            <div class="text-sm font-medium text-gray-800">{{ project.projectLead || '—' }}</div>
          </div>
        </div>

        <div v-if="project.strategicContribution" class="mt-4 pt-4 border-t border-surface-100">
          <div class="text-xs text-gray-500 mb-1">Strategic Contribution</div>
          <p class="text-sm text-gray-700">{{ project.strategicContribution }}</p>
        </div>
      </div>

      <!-- Affected Applications -->
      <div v-if="project.affectedApps && project.affectedApps.length" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Affected Applications</h3>
        </div>
        <div class="divide-y divide-surface-100">
          <a v-for="aa in project.affectedApps" :key="aa.appId"
             :href="linkTo('/apps/' + aa.appId)"
             class="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
            <span class="text-sm text-gray-800">{{ appName(aa.appId) }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full"
                  :class="aa.action === 'ablösen' ? 'bg-red-100 text-red-700' : aa.action === 'einführen' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'">
              {{ aa.action }}
            </span>
          </a>
        </div>
      </div>

      <!-- Dependencies -->
      <div v-if="deps.length" class="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div class="px-5 py-3 border-b border-surface-200 bg-surface-50">
          <h3 class="text-sm font-semibold text-gray-700">Dependencies ({{ deps.length }})</h3>
        </div>
        <div class="divide-y divide-surface-100">
          <div v-for="dep in deps" :key="dep.sourceProjectId + dep.targetProjectId" class="flex items-center justify-between px-5 py-3">
            <div class="flex items-center gap-2 text-sm">
              <a :href="linkTo('/projects/' + dep.sourceProjectId)" class="text-primary-600 hover:underline">{{ projName(dep.sourceProjectId) }}</a>
              <span class="text-gray-400">→{{ depSymbol(dep.type) }}→</span>
              <a :href="linkTo('/projects/' + dep.targetProjectId)" class="text-primary-600 hover:underline">{{ projName(dep.targetProjectId) }}</a>
            </div>
            <span class="text-xs text-gray-500 max-w-[300px] truncate">{{ dep.description }}</span>
          </div>
        </div>
      </div>

      <!-- Capabilities -->
      <div v-if="project.capabilities && project.capabilities.length" class="bg-white rounded-xl border border-surface-200 p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Touched Capabilities</h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="capId in project.capabilities" :key="capId"
                class="text-xs px-2 py-1 bg-surface-100 text-gray-700 rounded">
            {{ capId }} {{ capName(capId) }}
          </span>
        </div>
      </div>

      <!-- Edit Modal -->
      <project-form v-if="showEdit" :edit-project="project" @close="showEdit = false" @saved="showEdit = false"></project-form>
    </div>
    <div v-else class="text-center py-12 text-gray-500">Project not found.</div>
  `,
  setup () {
    const { ref, computed } = Vue
    const showEdit = ref(false)

    const project = computed(() => store.projectById(router.params.id))
    const deps = computed(() => project.value ? store.depsForProject(project.value.id) : [])

    function statusDot (s) { return { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500' }[s] || 'bg-gray-400' }
    function catClass (c) { return { 'Run / Pflicht': 'bg-gray-100 text-gray-700', 'Modernisierung': 'bg-blue-100 text-blue-700', 'Optimierung': 'bg-green-100 text-green-700', 'Innovation / Grow': 'bg-purple-100 text-purple-700', 'Infrastruktur': 'bg-orange-100 text-orange-700' }[c] || 'bg-gray-100' }
    function domainColor (id) { const d = store.domainById(id); return d ? d.color : '#94a3b8' }
    function domainName (id) { const d = store.domainById(id); return d ? d.name : '—' }
    function appName (id) { const a = store.appById(id); return a ? a.name : id }
    function projName (id) { const p = store.projectById(id); return p ? p.name : id }
    function capName (id) { const c = store.capabilityById(id); return c ? c.name : '' }
    function depSymbol (type) {
      const dt = store.data.enums.dependencyType?.find(d => d.value === type)
      return dt ? dt.symbol.replace('→', '') : type
    }

    function confirmDelete () {
      if (project.value && confirm('Delete "' + project.value.name + '"?')) {
        store.deleteProject(project.value.id)
        navigateTo('/projects')
      }
    }

    return { store, router, linkTo, navigateTo, project, deps, showEdit, statusDot, catClass, domainColor, domainName, appName, projName, capName, depSymbol, confirmDelete }
  }
}
