// compliance-dashboard.js — Compliance overview showing selected regulations and status
import { store } from '../store.js'
import { i18n } from '../i18n.js'
import { navigateTo } from '../router.js'

export default {
  name: 'ComplianceDashboard',
  template: `
    <div class="space-y-6">
      <!-- No Regulations Selected -->
      <div v-if="selectedRegulations.length === 0"
           class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-8 text-center">
        <svg class="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        <p class="text-gray-500 dark:text-gray-400 mb-4">{{ t('compliance.noRegulations') }}</p>
        <button @click="navigateTo('/settings')"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
          {{ t('compliance.goToSettings') }}
        </button>
      </div>

      <!-- Summary Cards -->
      <div v-if="selectedRegulations.length > 0" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ t('compliance.activeRegulations') }}</div>
          <div class="mt-2 text-2xl font-bold text-gray-800 dark:text-gray-100">{{ selectedRegulations.length }}</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ t('compliance.affectedApps') }}</div>
          <div class="mt-2 text-2xl font-bold text-gray-800 dark:text-gray-100">{{ store.totalApps }}</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ t('compliance.overallStatus') }}</div>
          <div class="mt-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              {{ t('compliance.partiallyCompliant') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Regulation Detail Table -->
      <section v-if="selectedRegulations.length > 0"
               class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">{{ t('compliance.activeRegulations') }}</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200 dark:border-surface-700">
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.regulation') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.status') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.coverage') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.affectedApps') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reg in regulationDetails" :key="reg.value"
                  class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <td class="py-3 px-3">
                  <div class="font-medium text-gray-800 dark:text-gray-200">{{ reg.label }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ reg.description }}</div>
                </td>
                <td class="py-3 px-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="statusClass(reg.status)">
                    {{ statusLabel(reg.status) }}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all"
                           :class="reg.coverage >= 80 ? 'bg-green-500' : reg.coverage >= 50 ? 'bg-yellow-500' : 'bg-red-500'"
                           :style="{ width: reg.coverage + '%' }"></div>
                    </div>
                    <span class="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">{{ reg.coverage }}%</span>
                  </div>
                </td>
                <td class="py-3 px-3 text-gray-600 dark:text-gray-400">{{ reg.appCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  setup () {
    const { computed } = Vue
    const t = (key) => i18n.t(key)

    const allRegulations = computed(() => (store.data.enums && store.data.enums.complianceRegulations) || [])

    const selectedRegulations = computed(() => {
      const selected = store.featureToggles.selectedRegulations || []
      return allRegulations.value.filter(r => selected.includes(r.value))
    })

    const regulationDetails = computed(() => {
      const apps = store.data.applications || []
      const total = apps.length || 1
      return selectedRegulations.value.map((reg, idx) => {
        // Deterministic example coverage per regulation based on index
        const coverages = [85, 62, 91, 45, 73, 58, 80]
        const coverage = coverages[idx % coverages.length]
        const statuses = ['compliant', 'partial', 'compliant', 'nonCompliant', 'partial', 'partial', 'compliant']
        return {
          ...reg,
          coverage,
          status: statuses[idx % statuses.length],
          appCount: Math.max(1, Math.round(total * coverage / 100))
        }
      })
    })

    function statusClass (status) {
      if (status === 'compliant') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      if (status === 'partial') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }

    function statusLabel (status) {
      if (status === 'compliant') return t('compliance.compliant')
      if (status === 'partial') return t('compliance.partiallyCompliant')
      return t('compliance.nonCompliant')
    }

    return { store, t, selectedRegulations, regulationDetails, statusClass, statusLabel, navigateTo }
  }
}
