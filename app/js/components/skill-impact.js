// skill-impact.js — Fachkräfte-Impact-Analyse: Skill profiles, Bus Factor, Outsourcing Readiness
import { store } from '../store.js'
import { linkTo } from '../router.js'

export default {
  name: 'SkillImpact',
  template: `
    <div class="space-y-6">

      <!-- Intro -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Fachkräfte-Impact-Analyse</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">Analyse der Skill-Abhängigkeiten, Bus-Factor-Risiken und Outsourcing-Readiness über alle Applikationen hinweg.</p>
      </div>

      <!-- KPI Summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4 text-center">
          <div class="text-2xl font-bold text-primary-600">{{ skillSummary.length }}</div>
          <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">Skill-Kategorien</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ totalHeadcount }}</div>
          <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">Fachkräfte gesamt</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4 text-center">
          <div class="text-2xl font-bold text-red-600">{{ highRiskPersons }}</div>
          <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">Bus-Factor Risiken</div>
        </div>
        <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ outsourceablePct }}%</div>
          <div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">Outsourcing-fähig</div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
        <div class="flex border-b border-surface-200 dark:border-surface-700">
          <button v-for="tab in tabs" :key="tab.id"
                  @click="activeTab = tab.id"
                  class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                  :class="activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'">
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab: Skill Overview -->
        <div v-if="activeTab === 'skills'" class="p-6">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Alle Skill-Kategorien mit Anzahl Fachkräfte, betroffenen Applikationen und Schlüsselpersonen.</p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-surface-200 dark:border-surface-700 text-left">
                  <th class="pb-2 font-semibold text-gray-900 dark:text-gray-100">Skill</th>
                  <th class="pb-2 font-semibold text-gray-900 dark:text-gray-100 text-center">Headcount</th>
                  <th class="pb-2 font-semibold text-gray-900 dark:text-gray-100 text-center">Apps</th>
                  <th class="pb-2 font-semibold text-gray-900 dark:text-gray-100">Schlüsselpersonen</th>
                  <th class="pb-2 font-semibold text-gray-900 dark:text-gray-100 text-center">Outsourceable</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sortedSkills" :key="s.skill"
                    class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800">
                  <td class="py-2 font-medium text-gray-900 dark:text-gray-100">{{ s.skill }}</td>
                  <td class="py-2 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                          :class="s.totalHeadcount <= 1 ? 'bg-red-100 text-red-700' : s.totalHeadcount <= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'">
                      {{ s.totalHeadcount }}
                    </span>
                  </td>
                  <td class="py-2 text-center text-gray-600 dark:text-gray-400">{{ s.appCount }}</td>
                  <td class="py-2">
                    <div class="flex flex-wrap gap-1">
                      <span v-for="p in s.keyPersons" :key="p"
                            class="inline-block px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                        {{ p }}
                      </span>
                    </div>
                  </td>
                  <td class="py-2 text-center">
                    <span v-if="s.outsourceable" class="text-green-600">✓</span>
                    <span v-else class="text-red-600">✗</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab: Bus Factor -->
        <div v-if="activeTab === 'busfactor'" class="p-6">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Personen mit überproportionalem Einfluss auf die IT-Landschaft. Hoher Bus-Factor = hohes Risiko bei Weggang.</p>
          <div class="space-y-3">
            <div v-for="bf in busFactor" :key="bf.person"
                 class="flex items-center gap-4 p-4 rounded-lg border"
                 :class="bf.risk === 'high' ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                        : bf.risk === 'medium' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800'
                        : 'border-surface-200 bg-surface-50 dark:bg-surface-800 dark:border-surface-700'">
              <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                   :class="bf.risk === 'high' ? 'bg-red-200 text-red-700' : bf.risk === 'medium' ? 'bg-yellow-200 text-yellow-700' : 'bg-surface-200 text-surface-600'">
                {{ bf.appCount }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ bf.person }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Skills: {{ bf.skills.join(', ') }}
                </div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <a v-for="aid in bf.appIds" :key="aid" :href="linkTo('/apps/' + aid)"
                     class="text-xs px-1.5 py-0.5 rounded bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 text-gray-700 dark:text-gray-300 hover:border-primary-400 transition-colors">
                    {{ appName(aid) }}
                  </a>
                </div>
              </div>
              <span class="text-xs font-semibold px-2 py-1 rounded-full shrink-0"
                    :class="bf.risk === 'high' ? 'bg-red-100 text-red-700' : bf.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'">
                {{ bf.risk === 'high' ? 'Hoch' : bf.risk === 'medium' ? 'Mittel' : 'Niedrig' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tab: Outsourcing Readiness -->
        <div v-if="activeTab === 'outsourcing'" class="p-6">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Bewertung der Outsourcing-Fähigkeit pro Skill: Lokale Verfügbarkeit vs. Nearshore-Potenzial.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="s in sortedSkills" :key="s.skill"
                 class="p-4 rounded-lg border"
                 :class="s.outsourceable ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800' : 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800'">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ s.skill }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                      :class="s.outsourceable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ s.outsourceable ? 'Nearshore-fähig' : 'Lokal gebunden' }}
                </span>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ s.totalHeadcount }} Fachkräfte · {{ s.appCount }} App(s) ·
                {{ s.keyPersons.length }} Schlüsselperson(en)
              </div>
              <div class="mt-2 flex flex-wrap gap-1">
                <span v-for="aid in s.appIds" :key="aid"
                      class="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 text-gray-600 dark:text-gray-400">
                  {{ appName(aid) }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `,
  setup () {
    const { computed, ref } = Vue

    const activeTab = ref('skills')
    const tabs = [
      { id: 'skills', label: 'Skill-Übersicht' },
      { id: 'busfactor', label: 'Bus-Factor-Analyse' },
      { id: 'outsourcing', label: 'Outsourcing-Readiness' }
    ]

    const skillSummary = computed(() => store.skillSummary)
    const busFactor = computed(() => store.busFactor)

    const sortedSkills = computed(() =>
      [...skillSummary.value].sort((a, b) => b.appCount - a.appCount || b.totalHeadcount - a.totalHeadcount)
    )

    const totalHeadcount = computed(() =>
      skillSummary.value.reduce((s, sk) => s + sk.totalHeadcount, 0)
    )

    const highRiskPersons = computed(() =>
      busFactor.value.filter(bf => bf.risk === 'high').length
    )

    const outsourceablePct = computed(() => {
      if (skillSummary.value.length === 0) return 0
      const cnt = skillSummary.value.filter(s => s.outsourceable).length
      return Math.round((cnt / skillSummary.value.length) * 100)
    })

    function appName (id) {
      const app = store.appById(id)
      return app ? app.name : id
    }

    return {
      store, linkTo,
      activeTab, tabs,
      skillSummary, busFactor, sortedSkills,
      totalHeadcount, highRiskPersons, outsourceablePct,
      appName
    }
  }
}
