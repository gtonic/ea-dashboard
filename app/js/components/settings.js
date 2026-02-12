// settings.js — Import/export JSON, reset to seed data
import { store } from '../store.js'
import { exportJSON, importJSON, resetToSeed } from '../store.js'
import { i18n } from '../i18n.js'

export default {
  name: 'SettingsView',
  template: `
    <div class="max-w-2xl space-y-8">
      <!-- Appearance -->
      <section class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">Appearance</h2>
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark theme</div>
          </div>
          <button @click="store.darkMode = !store.darkMode"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="store.darkMode ? 'bg-primary-600' : 'bg-gray-300 dark:bg-surface-700'">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="store.darkMode ? 'translate-x-6' : 'translate-x-1'"></span>
          </button>
        </div>
      </section>

      <!-- Feature Toggles -->
      <section class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">{{ t('settings.featureToggles') }}</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('nav.analysis') }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('settings.analysisDesc') }}</div>
            </div>
            <button @click="store.featureToggles.analysisEnabled = !store.featureToggles.analysisEnabled"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    :class="store.featureToggles.analysisEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-surface-700'">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="store.featureToggles.analysisEnabled ? 'translate-x-6' : 'translate-x-1'"></span>
            </button>
          </div>
          <div class="flex items-center justify-between border-t border-surface-100 dark:border-surface-700 pt-4">
            <div>
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('nav.governance') }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('settings.governanceDesc') }}</div>
            </div>
            <button @click="store.featureToggles.governanceEnabled = !store.featureToggles.governanceEnabled"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    :class="store.featureToggles.governanceEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-surface-700'">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="store.featureToggles.governanceEnabled ? 'translate-x-6' : 'translate-x-1'"></span>
            </button>
          </div>
          <div class="flex items-center justify-between border-t border-surface-100 dark:border-surface-700 pt-4">
            <div>
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ t('nav.compliance') }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ t('settings.complianceDesc') }}</div>
            </div>
            <button @click="store.featureToggles.complianceEnabled = !store.featureToggles.complianceEnabled"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    :class="store.featureToggles.complianceEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-surface-700'">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="store.featureToggles.complianceEnabled ? 'translate-x-6' : 'translate-x-1'"></span>
            </button>
          </div>
        </div>
      </section>

      <!-- Compliance Regulations -->
      <section v-if="store.featureToggles.complianceEnabled" class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">{{ t('settings.complianceRegulations') }}</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ t('settings.complianceRegulationsDesc') }}</p>
        <div class="space-y-3">
          <div v-for="reg in availableRegulations" :key="reg.value"
               @click="toggleRegulation(reg.value)"
               class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
               :class="isRegulationSelected(reg.value)
                 ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
                 : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'">
            <div class="flex items-center justify-center w-5 h-5 rounded border-2 shrink-0 transition-colors"
                 :class="isRegulationSelected(reg.value)
                   ? 'bg-primary-600 border-primary-600 text-white'
                   : 'border-gray-300 dark:border-gray-600'">
              <svg v-if="isRegulationSelected(reg.value)" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ reg.label }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ reg.description }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Data Management -->
      <section class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">Data Management</h2>
        <div class="space-y-4">
          <!-- Export -->
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Export Data</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Download the entire dataset as a JSON file</div>
            </div>
            <button @click="doExport"
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
              Export JSON
            </button>
          </div>

          <!-- Import -->
          <div class="flex items-center justify-between border-t border-surface-100 dark:border-surface-700 pt-4">
            <div>
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Import Data</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Replace current data with a JSON file</div>
            </div>
            <label class="px-4 py-2 border border-gray-300 dark:border-surface-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer transition-colors">
              Import JSON
              <input type="file" accept=".json" @change="doImport" class="hidden" />
            </label>
          </div>

          <!-- Reset -->
          <div class="flex items-center justify-between border-t border-surface-100 dark:border-surface-700 pt-4">
            <div>
              <div class="text-sm font-medium text-red-600">Reset to Seed Data</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Discard all changes and reload the original dataset</div>
            </div>
            <button @click="confirmReset"
                    class="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Reset
            </button>
          </div>
        </div>
      </section>

      <!-- Data Statistics -->
      <section class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">Data Statistics</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div v-for="stat in stats" :key="stat.label" class="flex justify-between py-1">
            <span class="text-gray-500 dark:text-gray-400">{{ stat.label }}</span>
            <span class="font-medium text-gray-800 dark:text-gray-200">{{ stat.value }}</span>
          </div>
        </div>
      </section>

      <!-- About -->
      <section class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">About</h2>
        <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p><strong>Version:</strong> {{ store.data.meta.version }}</p>
          <p><strong>Company:</strong> {{ store.data.meta.company }}</p>
          <p><strong>Owner:</strong> {{ store.data.meta.owner }}</p>
          <p><strong>Last Updated:</strong> {{ store.data.meta.lastUpdated }}</p>
        </div>
        <div class="mt-4 text-xs text-gray-400">
          Built with Vue 3, Tailwind CSS, Chart.js, D3.js. Data stored in localStorage.
        </div>
      </section>

      <!-- Toast -->
      <div v-if="toast" class="fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-sm text-white z-50 transition-opacity"
           :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'">
        {{ toast.message }}
      </div>
    </div>
  `,
  setup () {
    const { ref, computed } = Vue
    const t = (key) => i18n.t(key)
    const toast = ref(null)

    function showToast (message, type = 'success') {
      toast.value = { message, type }
      setTimeout(() => { toast.value = null }, 3000)
    }

    const stats = computed(() => [
      { label: 'Domains', value: store.data.domains.length },
      { label: 'L1 Capabilities', value: store.totalCapabilities },
      { label: 'L2 Sub-Capabilities', value: store.totalSubCapabilities },
      { label: 'Applications', value: store.totalApps },
      { label: 'Capability Mappings', value: store.data.capabilityMappings.length },
      { label: 'Projects', value: store.totalProjects },
      { label: 'Dependencies', value: store.data.projectDependencies.length },
      { label: 'localStorage Size', value: (() => {
        const s = localStorage.getItem('ea-bebauungsplan-v1')
        return s ? (s.length / 1024).toFixed(1) + ' KB' : '—'
      })() }
    ])

    function doExport () {
      exportJSON()
      showToast('Data exported successfully')
    }

    async function doImport (e) {
      const file = e.target.files[0]
      if (!file) return
      try {
        await importJSON(file)
        showToast('Data imported successfully')
      } catch (err) {
        showToast('Import failed: ' + err.message, 'error')
      }
      e.target.value = ''
    }

    function confirmReset () {
      if (confirm('Are you sure? This will discard all changes and reload the original seed data.')) {
        resetToSeed().then(() => showToast('Reset to seed data'))
      }
    }

    const availableRegulations = computed(() => (store.data.enums && store.data.enums.complianceRegulations) || [])

    function isRegulationSelected (value) {
      return (store.featureToggles.selectedRegulations || []).includes(value)
    }

    function toggleRegulation (value) {
      if (!store.featureToggles.selectedRegulations) {
        store.featureToggles.selectedRegulations = []
      }
      const idx = store.featureToggles.selectedRegulations.indexOf(value)
      if (idx >= 0) {
        store.featureToggles.selectedRegulations.splice(idx, 1)
      } else {
        store.featureToggles.selectedRegulations.push(value)
      }
    }

    return { store, stats, toast, doExport, doImport, confirmReset, t, availableRegulations, isRegulationSelected, toggleRegulation }
  }
}
