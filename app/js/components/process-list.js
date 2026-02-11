// process-list.js — E2E Process overview table
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'ProcessList',
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div></div>
        <button @click="showForm = true" class="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">+ Add Process</button>
      </div>

      <div class="bg-white rounded-xl border border-surface-200 overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-surface-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th class="px-5 py-3 text-left">ID</th>
              <th class="px-5 py-3 text-left">Process</th>
              <th class="px-5 py-3 text-left hidden md:table-cell">Owner</th>
              <th class="px-5 py-3 text-left">Status</th>
              <th class="px-5 py-3 text-left hidden sm:table-cell">Domains</th>
              <th class="px-5 py-3 text-right hidden sm:table-cell">Apps</th>
              <th class="px-5 py-3 text-right hidden md:table-cell">KPIs</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100">
            <tr v-for="proc in processes" :key="proc.id" class="hover:bg-surface-50 cursor-pointer"
                @click="go(proc.id)">
              <td class="px-5 py-3 font-mono text-xs text-gray-500">{{ proc.id }}</td>
              <td class="px-5 py-3 font-medium text-gray-800">{{ proc.name }}</td>
              <td class="px-5 py-3 text-gray-500 hidden md:table-cell">{{ proc.owner || '—' }}</td>
              <td class="px-5 py-3">
                <span class="text-[10px] px-2 py-0.5 rounded-full" :class="statusClass(proc.status)">{{ proc.status }}</span>
              </td>
              <td class="px-5 py-3 hidden sm:table-cell">
                <div class="flex gap-1">
                  <span v-for="did in proc.domains" :key="did"
                        class="w-5 h-5 rounded text-[9px] text-white font-bold flex items-center justify-center"
                        :style="{ backgroundColor: domainColor(did) }">{{ did }}</span>
                </div>
              </td>
              <td class="px-5 py-3 text-right text-gray-500 hidden sm:table-cell">{{ appCount(proc.id) }}</td>
              <td class="px-5 py-3 text-right text-gray-500 hidden md:table-cell">{{ proc.kpis ? proc.kpis.length : 0 }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!processes.length" class="text-center py-8 text-gray-400 text-sm">No E2E processes defined yet.</div>
      </div>

      <process-form v-if="showForm" @close="showForm = false" @saved="showForm = false" />
    </div>
  `,
  setup () {
    const { ref, computed } = Vue
    const showForm = ref(false)

    const processes = computed(() => store.data.e2eProcesses || [])

    function domainColor (id) {
      const d = store.domainById(id)
      return d ? d.color : '#94a3b8'
    }

    function statusClass (s) {
      return { active: 'bg-green-100 text-green-700', optimization: 'bg-blue-100 text-blue-700', transformation: 'bg-purple-100 text-purple-700' }[s] || 'bg-gray-100 text-gray-600'
    }

    function appCount (procId) {
      return store.appsForProcess(procId).length
    }

    function go (id) { window.location.hash = '/processes/' + id }

    return { store, linkTo, showForm, processes, domainColor, statusClass, appCount, go }
  }
}
