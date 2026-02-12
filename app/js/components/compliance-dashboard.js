// compliance-dashboard.js — Compliance Dashboard with Gap-Analysis, Cross-Reference & Vendor-Compliance (Phase C2)
import { store } from '../store.js'
import { i18n } from '../i18n.js'
import { navigateTo, linkTo } from '../router.js'

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
      <div v-if="selectedRegulations.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ t('compliance.activeRegulations') }}</div>
          <div class="mt-2 text-2xl font-bold text-gray-800 dark:text-gray-100">{{ selectedRegulations.length }}</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ t('compliance.overallScore') }}</div>
          <div class="mt-2 text-2xl font-bold" :class="scoreColor(store.overallComplianceScore)">{{ store.overallComplianceScore }}%</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ t('compliance.gaps') }}</div>
          <div class="mt-2 text-2xl font-bold" :class="filteredGaps.length > 0 ? 'text-red-600' : 'text-green-600'">{{ filteredGaps.length }}</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ t('compliance.totalAssessments') }}</div>
          <div class="mt-2 text-2xl font-bold text-gray-800 dark:text-gray-100">{{ totalAssessments }}</div>
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
                  <div class="font-medium text-gray-800 dark:text-gray-200">{{ regLabel(reg.value) }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ regDesc(reg.value) }}</div>
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

      <!-- Gap Analysis -->
      <section v-if="selectedRegulations.length > 0"
               class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">{{ t('compliance.gapAnalysis') }}</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ t('compliance.gapAnalysisDesc') }}</p>
        <div v-if="filteredGaps.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">{{ t('compliance.noGaps') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200 dark:border-surface-700">
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.application') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.regulation') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.reason') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="gap in filteredGaps" :key="gap.appId + '-' + gap.regulation"
                  class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <td class="py-2 px-3">
                  <a :href="linkTo('/apps/' + gap.appId)" class="text-primary-600 hover:underline font-medium">{{ gap.appName }}</a>
                </td>
                <td class="py-2 px-3 text-gray-700 dark:text-gray-300">{{ regLabel(gap.regulation) }}</td>
                <td class="py-2 px-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    {{ gap.reason === 'missing' ? t('compliance.missing') : t('compliance.notAssessed') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Cross-Reference: Regulation Load Score -->
      <section v-if="selectedRegulations.length > 0"
               class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">{{ t('compliance.crossReference') }}</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ t('compliance.crossReferenceDesc') }}</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200 dark:border-surface-700">
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.application') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.vendor') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.regulationCount') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.regulation') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredLoadScores" :key="item.appId"
                  class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <td class="py-2 px-3">
                  <a :href="linkTo('/apps/' + item.appId)" class="text-primary-600 hover:underline font-medium">{{ item.appName }}</a>
                  <div class="text-xs text-gray-400">{{ item.criticality }}</div>
                </td>
                <td class="py-2 px-3 text-gray-600 dark:text-gray-400">{{ item.vendor }}</td>
                <td class="py-2 px-3">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                        :class="item.count >= 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : item.count >= 3 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'">
                    {{ item.count }}
                  </span>
                </td>
                <td class="py-2 px-3">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="reg in item.filteredRegulations" :key="reg"
                          class="px-1.5 py-0.5 rounded text-xs bg-surface-100 dark:bg-surface-800 text-gray-600 dark:text-gray-400">
                      {{ reg }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Vendor Compliance -->
      <section v-if="selectedRegulations.length > 0"
               class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">{{ t('compliance.vendorCompliance') }}</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ t('compliance.vendorComplianceDesc') }}</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200 dark:border-surface-700">
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.vendor') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.apps') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.assessments') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.complianceRate') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vc in store.vendorComplianceStatus" :key="vc.vendor"
                  class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <td class="py-2 px-3 font-medium text-gray-800 dark:text-gray-200">{{ vc.vendor }}</td>
                <td class="py-2 px-3 text-gray-600 dark:text-gray-400">{{ vc.apps }}</td>
                <td class="py-2 px-3">
                  <div class="flex items-center gap-2 text-xs">
                    <span class="text-green-600">{{ vc.compliant }}</span>
                    <span class="text-yellow-600">{{ vc.partial }}</span>
                    <span class="text-red-600">{{ vc.nonCompliant }}</span>
                    <span class="text-gray-400">{{ vc.notAssessed }}</span>
                  </div>
                </td>
                <td class="py-2 px-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all"
                           :class="vc.complianceRate >= 80 ? 'bg-green-500' : vc.complianceRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'"
                           :style="{ width: vc.complianceRate + '%' }"></div>
                    </div>
                    <span class="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">{{ vc.complianceRate }}%</span>
                  </div>
                </td>
                <td class="py-2 px-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="vc.nonCompliant > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : vc.partial > 0 || vc.notAssessed > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'">
                    {{ vc.nonCompliant > 0 ? t('compliance.nonCompliant') : vc.partial > 0 || vc.notAssessed > 0 ? t('compliance.partiallyCompliant') : t('compliance.compliant') }}
                  </span>
                </td>
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
    const selectedRegVals = computed(() => store.featureToggles.selectedRegulations || [])

    const selectedRegulations = computed(() => {
      return allRegulations.value.filter(r => selectedRegVals.value.includes(r.value))
    })

    // Regulation details computed from real assessment data
    const regulationDetails = computed(() => {
      const apps = store.data.applications || []
      const assessments = store.data.complianceAssessments || []
      return selectedRegulations.value.map(reg => {
        // Apps that have this regulation in their list
        const affectedApps = apps.filter(a => a.regulations && a.regulations.includes(reg.value))
        const appCount = affectedApps.length
        // Assessments for this regulation
        const regAssessments = assessments.filter(a => a.regulation === reg.value && affectedApps.some(app => app.id === a.appId))
        const compliant = regAssessments.filter(a => a.status === 'compliant').length
        const partial = regAssessments.filter(a => a.status === 'partial').length
        const total = appCount || 1
        const coverage = Math.round(((compliant + partial * 0.5) / total) * 100)
        // Determine overall regulation status
        const nonCompliant = regAssessments.filter(a => a.status === 'nonCompliant').length
        let status = 'compliant'
        if (nonCompliant > 0 || (appCount - regAssessments.length) > appCount * 0.3) status = 'nonCompliant'
        else if (partial > 0 || regAssessments.length < appCount) status = 'partial'
        return { ...reg, coverage, status, appCount }
      })
    })

    // Total assessments across selected regulations
    const totalAssessments = computed(() => {
      const assessments = store.data.complianceAssessments || []
      return assessments.filter(a => selectedRegVals.value.includes(a.regulation)).length
    })

    // Gap analysis filtered by selected regulations
    const filteredGaps = computed(() => {
      return store.complianceGaps.filter(g => selectedRegVals.value.includes(g.regulation))
    })

    // Regulation load scores filtered by selected regulations
    const filteredLoadScores = computed(() => {
      return store.regulationLoadScores.map(item => {
        const filteredRegs = item.regulations.filter(r => selectedRegVals.value.includes(r))
        return { ...item, filteredRegulations: filteredRegs, count: filteredRegs.length }
      }).filter(item => item.count > 0).sort((a, b) => b.count - a.count)
    })

    // Helper to get regulation label from value (i18n with fallback)
    function regLabel (value) {
      const key = 'regulation.' + value + '.label'
      const translated = t(key)
      if (translated !== key) return translated
      const reg = allRegulations.value.find(r => r.value === value)
      return reg ? reg.label : value
    }

    function regDesc (value) {
      const key = 'regulation.' + value + '.description'
      const translated = t(key)
      if (translated !== key) return translated
      const reg = allRegulations.value.find(r => r.value === value)
      return reg ? reg.description : ''
    }

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

    function scoreColor (score) {
      if (score >= 80) return 'text-green-600'
      if (score >= 60) return 'text-yellow-600'
      return 'text-red-600'
    }

    return {
      store, t, linkTo,
      selectedRegulations, regulationDetails, totalAssessments,
      filteredGaps, filteredLoadScores,
      statusClass, statusLabel, scoreColor, regLabel, regDesc,
      navigateTo
    }
  }
}
