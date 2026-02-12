// admin-audit-log.js — Audit log viewer component (admin only)
import { store } from '../store.js'
import { auth, adminApi, addToast } from '../api-client.js'

export default {
  name: 'AdminAuditLog',
  setup () {
    return { store, auth }
  },
  data () {
    return {
      entries: [],
      total: 0,
      loading: true,
      filters: { entity_type: '', action: '', user_email: '' },
      limit: 50,
      offset: 0
    }
  },
  async mounted () {
    await this.loadEntries()
  },
  computed: {
    hasMore () { return this.offset + this.limit < this.total }
  },
  methods: {
    async loadEntries () {
      this.loading = true
      try {
        const data = await adminApi.getAuditLog({
          ...this.filters,
          limit: this.limit,
          offset: this.offset
        })
        this.entries = data.entries
        this.total = data.total
      } catch (e) {
        addToast(e.message || 'Fehler beim Laden des Audit-Logs', 'error')
      } finally {
        this.loading = false
      }
    },
    applyFilters () {
      this.offset = 0
      this.loadEntries()
    },
    nextPage () {
      this.offset += this.limit
      this.loadEntries()
    },
    prevPage () {
      this.offset = Math.max(0, this.offset - this.limit)
      this.loadEntries()
    },
    actionBadgeClass (action) {
      return {
        CREATE: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        DELETE: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      }[action] || 'bg-gray-100 text-gray-700'
    },
    formatDate (iso) {
      if (!iso) return '—'
      const d = new Date(iso)
      const locale = this.i18n?.locale === 'en' ? 'en-US' : 'de-DE'
      return d.toLocaleString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  },
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Audit-Log</h2>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-4">
        <select v-model="filters.entity_type" @change="applyFilters"
          class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-surface-700 text-sm text-gray-800 dark:text-gray-200">
          <option value="">Alle Entitäten</option>
          <option value="domain">Domain</option>
          <option value="capability">Capability</option>
          <option value="application">Application</option>
          <option value="project">Project</option>
          <option value="vendor">Vendor</option>
          <option value="demand">Demand</option>
          <option value="integration">Integration</option>
          <option value="process">Process</option>
          <option value="legal_entity">Legal Entity</option>
          <option value="compliance_assessment">Compliance</option>
          <option value="kpi">KPI</option>
          <option value="seed">Seed</option>
        </select>
        <select v-model="filters.action" @change="applyFilters"
          class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-surface-700 text-sm text-gray-800 dark:text-gray-200">
          <option value="">Alle Aktionen</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input v-model="filters.user_email" @keyup.enter="applyFilters" placeholder="E-Mail filtern..."
          class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-surface-700 text-sm text-gray-800 dark:text-gray-200 w-48" />
      </div>

      <!-- Summary -->
      <div class="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {{ total }} Einträge gesamt · Zeige {{ offset + 1 }}–{{ Math.min(offset + limit, total) }}
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12 text-gray-500">Laden...</div>

      <!-- Table -->
      <div v-else class="bg-white dark:bg-surface-800 rounded-xl shadow overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-surface-700">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Zeitpunkt</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Benutzer</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Aktion</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Entität</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">ID</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Detail</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr v-for="e in entries" :key="e.id" class="hover:bg-gray-50 dark:hover:bg-surface-700/50">
              <td class="px-4 py-2.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ formatDate(e.timestamp) }}</td>
              <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300">{{ e.userEmail || '—' }}</td>
              <td class="px-4 py-2.5">
                <span :class="actionBadgeClass(e.action)" class="px-2 py-0.5 rounded-full text-xs font-medium">{{ e.action }}</span>
              </td>
              <td class="px-4 py-2.5 text-gray-700 dark:text-gray-300">{{ e.entityType }}</td>
              <td class="px-4 py-2.5 text-gray-500 dark:text-gray-400 font-mono text-xs">{{ e.entityId || '—' }}</td>
              <td class="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate">{{ e.detail || '—' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="entries.length === 0" class="text-center py-8 text-gray-500">Keine Einträge gefunden</div>

        <!-- Pagination -->
        <div v-if="total > limit" class="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
          <button @click="prevPage" :disabled="offset === 0"
            class="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40">← Zurück</button>
          <button @click="nextPage" :disabled="!hasMore"
            class="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40">Weiter →</button>
        </div>
      </div>
    </div>
  `
}
