// compliance-audit.js — Compliance Audit Trail, Workflow & Deadline Warnings (Phase C3)
import { store } from '../store.js'
import { i18n } from '../i18n.js'
import { linkTo } from '../router.js'

export default {
  name: 'ComplianceAudit',
  template: `
    <div class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ t('compliance.c3.deadlineWarnings') }}</div>
          <div class="mt-2 text-2xl font-bold" :class="store.deadlineWarnings.length > 0 ? 'text-red-600' : 'text-green-600'">{{ store.deadlineWarnings.length }}</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ t('compliance.c3.openAssessments') }}</div>
          <div class="mt-2 text-2xl font-bold text-yellow-600">{{ workflowCounts.open }}</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ t('compliance.c3.inReview') }}</div>
          <div class="mt-2 text-2xl font-bold text-blue-600">{{ workflowCounts.inReview }}</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ t('compliance.c3.reviewRequired') }}</div>
          <div class="mt-2 text-2xl font-bold text-orange-600">{{ workflowCounts.reviewRequired }}</div>
        </div>
      </div>

      <!-- Regulation Deadline Warnings -->
      <section v-if="regulationDeadlines.length > 0"
               class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">{{ t('compliance.c3.regulationDeadlines') }}</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ t('compliance.c3.regulationDeadlinesDesc') }}</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200 dark:border-surface-700">
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.regulation') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.c3.deadline') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rd in regulationDeadlines" :key="rd.value"
                  class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <td class="py-3 px-3">
                  <div class="font-medium text-gray-800 dark:text-gray-200">{{ regLabel(rd.value) }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ regDesc(rd.value) }}</div>
                </td>
                <td class="py-3 px-3 text-gray-700 dark:text-gray-300">{{ rd.deadline }}</td>
                <td class="py-3 px-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="rd.expired ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'">
                    {{ rd.expired ? t('compliance.c3.active') : rd.daysRemaining + ' ' + t('compliance.c3.days') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Assessment Deadline Warnings -->
      <section class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">{{ t('compliance.c3.assessmentDeadlines') }}</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ t('compliance.c3.assessmentDeadlinesDesc') }}</p>
        <div v-if="store.deadlineWarnings.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">{{ t('compliance.c3.noDeadlineWarnings') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200 dark:border-surface-700">
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.application') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.regulation') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.c3.deadline') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.c3.daysRemaining') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.c3.workflowStatus') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in store.deadlineWarnings" :key="w.assessmentId"
                  class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <td class="py-2 px-3">
                  <a :href="linkTo('/apps/' + w.appId)" class="text-primary-600 hover:underline font-medium">{{ w.appName }}</a>
                </td>
                <td class="py-2 px-3 text-gray-700 dark:text-gray-300">{{ regLabel(w.regulation) }}</td>
                <td class="py-2 px-3 text-gray-700 dark:text-gray-300">{{ w.deadline }}</td>
                <td class="py-2 px-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="w.expired ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : w.daysRemaining <= 30 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'">
                    {{ w.expired ? t('compliance.c3.expired') : w.daysRemaining + ' ' + t('compliance.c3.days') }}
                  </span>
                </td>
                <td class="py-2 px-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="workflowBadge(w.workflowStatus)">
                    {{ workflowLabel(w.workflowStatus) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Assessment Workflow Overview -->
      <section class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">{{ t('compliance.c3.workflowOverview') }}</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ t('compliance.c3.workflowOverviewDesc') }}</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200 dark:border-surface-700">
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.application') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.regulation') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.status') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.c3.workflowStatus') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.c3.deadline') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.c3.assessedBy') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in filteredAssessments" :key="a.id"
                  class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <td class="py-2 px-3">
                  <a :href="linkTo('/apps/' + a.appId)" class="text-primary-600 hover:underline font-medium">{{ appName(a.appId) }}</a>
                </td>
                <td class="py-2 px-3 text-gray-700 dark:text-gray-300">{{ regLabel(a.regulation) }}</td>
                <td class="py-2 px-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="statusBadge(a.status)">
                    {{ statusLabel(a.status) }}
                  </span>
                </td>
                <td class="py-2 px-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="workflowBadge(a.workflowStatus || 'open')">
                    {{ workflowLabel(a.workflowStatus || 'open') }}
                  </span>
                </td>
                <td class="py-2 px-3 text-gray-700 dark:text-gray-300">{{ a.deadline || '—' }}</td>
                <td class="py-2 px-3 text-gray-600 dark:text-gray-400">{{ a.assessedBy }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Domain Compliance Scorecard -->
      <section v-if="store.complianceScorecardByDomain.length > 0"
               class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">{{ t('compliance.c3.domainScorecard') }}</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ t('compliance.c3.domainScorecardDesc') }}</p>
        <div class="space-y-4">
          <div v-for="ds in store.complianceScorecardByDomain" :key="ds.domainId" class="space-y-1">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded" :style="{ backgroundColor: ds.domainColor }"></span>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ ds.domainName }}</span>
                <span class="text-xs text-gray-400">({{ ds.appCount }} Apps)</span>
              </div>
              <div class="flex items-center gap-3 text-xs">
                <span class="text-green-600 font-semibold">{{ ds.compliant }} {{ t('compliance.compliant') }}</span>
                <span class="text-yellow-600 font-semibold">{{ ds.partial }} {{ t('compliance.partiallyCompliant') }}</span>
                <span class="text-red-600 font-semibold">{{ ds.nonCompliant }} {{ t('compliance.nonCompliant') }}</span>
                <span class="font-bold" :class="scoreColor(ds.score)">{{ ds.score }}%</span>
              </div>
            </div>
            <div class="w-full h-3 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden flex">
              <div class="h-full bg-green-500 transition-all duration-500" :style="{ width: pct(ds.compliant, ds.total) + '%' }"></div>
              <div class="h-full bg-yellow-400 transition-all duration-500" :style="{ width: pct(ds.partial, ds.total) + '%' }"></div>
              <div class="h-full bg-red-500 transition-all duration-500" :style="{ width: pct(ds.nonCompliant, ds.total) + '%' }"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Audit Trail -->
      <section class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">{{ t('compliance.c3.auditTrail') }}</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">{{ t('compliance.c3.auditTrailDesc') }}</p>
        <div v-if="allAuditEntries.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">{{ t('compliance.c3.noAuditEntries') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200 dark:border-surface-700">
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.c3.timestamp') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.c3.user') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.application') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.regulation') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.c3.action') }}</th>
                <th class="text-left py-2 px-3 text-gray-500 dark:text-gray-400 font-medium">{{ t('compliance.c3.comment') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(entry, idx) in allAuditEntries" :key="idx"
                  class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <td class="py-2 px-3 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">{{ formatDate(entry.timestamp) }}</td>
                <td class="py-2 px-3 text-gray-700 dark:text-gray-300">{{ entry.user }}</td>
                <td class="py-2 px-3">
                  <a :href="linkTo('/apps/' + entry.appId)" class="text-primary-600 hover:underline text-xs">{{ entry.appName }}</a>
                </td>
                <td class="py-2 px-3 text-gray-700 dark:text-gray-300 text-xs">{{ regLabel(entry.regulation) }}</td>
                <td class="py-2 px-3">
                  <span v-if="entry.action === 'statusChange'" class="text-xs">
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs" :class="workflowBadge(entry.fromStatus || 'open')">{{ workflowLabel(entry.fromStatus || 'open') }}</span>
                    <span class="mx-1 text-gray-400">→</span>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs" :class="workflowBadge(entry.toStatus)">{{ workflowLabel(entry.toStatus) }}</span>
                  </span>
                  <span v-else class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {{ t('compliance.c3.created') }}
                  </span>
                </td>
                <td class="py-2 px-3 text-gray-600 dark:text-gray-400 text-xs">{{ entry.comment }}</td>
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

    const regulationDeadlines = computed(() => store.regulationDeadlineWarnings)

    // Workflow counts
    const workflowCounts = computed(() => {
      const assessments = store.data.complianceAssessments || []
      const counts = { open: 0, inReview: 0, assessed: 0, reviewRequired: 0 }
      assessments.forEach(a => {
        const ws = a.workflowStatus || 'open'
        if (counts[ws] !== undefined) counts[ws]++
      })
      return counts
    })

    // Filtered assessments (show non-assessed first, then by workflow status priority)
    const filteredAssessments = computed(() => {
      const assessments = store.data.complianceAssessments || []
      const order = { reviewRequired: 0, open: 1, inReview: 2, assessed: 3 }
      return [...assessments].sort((a, b) => {
        const oa = order[a.workflowStatus || 'open'] ?? 1
        const ob = order[b.workflowStatus || 'open'] ?? 1
        return oa - ob
      })
    })

    // Collect all audit trail entries across all assessments
    const allAuditEntries = computed(() => {
      const entries = []
      ;(store.data.complianceAssessments || []).forEach(a => {
        const app = store.appById(a.appId)
        ;(a.auditTrail || []).forEach(entry => {
          entries.push({ ...entry, appId: a.appId, appName: app ? app.name : a.appId, regulation: a.regulation })
        })
      })
      return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    })

    // Helpers (i18n with fallback)
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

    function appName (appId) {
      const app = store.appById(appId)
      return app ? app.name : appId
    }

    function statusBadge (status) {
      if (status === 'compliant') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      if (status === 'partial') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }

    function statusLabel (status) {
      if (status === 'compliant') return t('compliance.compliant')
      if (status === 'partial') return t('compliance.partiallyCompliant')
      if (status === 'nonCompliant') return t('compliance.nonCompliant')
      return t('compliance.notAssessed')
    }

    function workflowBadge (ws) {
      const map = {
        open: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
        inReview: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        assessed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        reviewRequired: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      }
      return map[ws] || map.open
    }

    function workflowLabel (ws) {
      return t('compliance.c3.ws.' + (ws || 'open'))
    }

    function scoreColor (score) {
      if (score >= 80) return 'text-green-600'
      if (score >= 60) return 'text-yellow-600'
      return 'text-red-600'
    }

    function pct (val, total) {
      return total > 0 ? Math.round((val / total) * 100) : 0
    }

    function formatDate (ts) {
      if (!ts) return '—'
      return ts.replace('T', ' ').replace('Z', '').substring(0, 16)
    }

    return {
      store, t, linkTo,
      regulationDeadlines, workflowCounts, filteredAssessments, allAuditEntries,
      regLabel, regDesc, appName, statusBadge, statusLabel,
      workflowBadge, workflowLabel, scoreColor, pct, formatDate
    }
  }
}
