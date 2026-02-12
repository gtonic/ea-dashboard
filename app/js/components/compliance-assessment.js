// compliance-assessment.js — Per-app per-regulation assessment with control questions
import { store } from '../store.js'
import { i18n } from '../i18n.js'

// ── Control questions per regulation ──
const controlQuestions = {
  GDPR: [
    { id: 'gdpr-01', article: 'Art. 30', de: 'Verarbeitungsverzeichnis vorhanden?', en: 'Records of processing activities available?', type: 'documentation' },
    { id: 'gdpr-02', article: 'Art. 25', de: 'Privacy by Design umgesetzt?', en: 'Privacy by Design implemented?', type: 'technical' },
    { id: 'gdpr-03', article: 'Art. 17', de: 'Löschkonzept vorhanden und umgesetzt?', en: 'Deletion concept available and implemented?', type: 'technical' },
    { id: 'gdpr-04', article: 'Art. 28', de: 'Auftragsverarbeitungsvertrag (AVV) mit Hersteller?', en: 'Data processing agreement (DPA) with vendor?', type: 'organizational' },
    { id: 'gdpr-05', article: 'Art. 35', de: 'Datenschutz-Folgenabschätzung (DSFA) durchgeführt?', en: 'Data protection impact assessment (DPIA) conducted?', type: 'documentation' },
    { id: 'gdpr-06', article: 'Art. 32', de: 'Technische und organisatorische Maßnahmen (TOMs) dokumentiert?', en: 'Technical and organizational measures (TOMs) documented?', type: 'documentation' },
    { id: 'gdpr-07', article: 'Art. 33/34', de: 'Prozess für Datenpannen-Meldung etabliert?', en: 'Data breach notification process established?', type: 'organizational' },
    { id: 'gdpr-08', article: 'Art. 44-49', de: 'Drittlandtransfer geprüft und abgesichert?', en: 'Third-country transfer assessed and secured?', type: 'organizational' },
  ],
  NIS2: [
    { id: 'nis2-01', article: 'Art. 21(a)', de: 'Cybersecurity-Risikomanagement implementiert?', en: 'Cybersecurity risk management implemented?', type: 'organizational' },
    { id: 'nis2-02', article: 'Art. 21(b)', de: 'Incident-Response-Plan vorhanden?', en: 'Incident response plan available?', type: 'organizational' },
    { id: 'nis2-03', article: 'Art. 21(c)', de: 'Business Continuity / Disaster Recovery vorhanden?', en: 'Business continuity / disaster recovery available?', type: 'technical' },
    { id: 'nis2-04', article: 'Art. 21(d)', de: 'Supply-Chain-Sicherheit bewertet?', en: 'Supply chain security assessed?', type: 'organizational' },
    { id: 'nis2-05', article: 'Art. 21(e)', de: 'Schwachstellenmanagement / Patch-Prozess vorhanden?', en: 'Vulnerability management / patch process available?', type: 'technical' },
    { id: 'nis2-06', article: 'Art. 21(f)', de: 'Verschlüsselung (at rest & in transit) eingesetzt?', en: 'Encryption (at rest & in transit) used?', type: 'technical' },
    { id: 'nis2-07', article: 'Art. 21(g)', de: 'Multi-Faktor-Authentifizierung (MFA) aktiviert?', en: 'Multi-factor authentication (MFA) enabled?', type: 'technical' },
    { id: 'nis2-08', article: 'Art. 23', de: 'Meldepflicht-Prozess eingerichtet (24h/72h)?', en: 'Reporting obligation process established (24h/72h)?', type: 'organizational' },
  ],
  ISO27001: [
    { id: 'iso-01', article: 'A.5', de: 'Informationssicherheitsrichtlinien definiert?', en: 'Information security policies defined?', type: 'documentation' },
    { id: 'iso-02', article: 'A.6', de: 'Organisation der Informationssicherheit festgelegt?', en: 'Organization of information security established?', type: 'organizational' },
    { id: 'iso-03', article: 'A.8', de: 'Asset-Management durchgeführt?', en: 'Asset management conducted?', type: 'documentation' },
    { id: 'iso-04', article: 'A.9', de: 'Zugriffskontrolle implementiert?', en: 'Access control implemented?', type: 'technical' },
    { id: 'iso-05', article: 'A.12', de: 'Betriebssicherheit gewährleistet?', en: 'Operations security ensured?', type: 'technical' },
    { id: 'iso-06', article: 'A.14', de: 'Sichere Entwicklung gewährleistet?', en: 'Secure development ensured?', type: 'technical' },
    { id: 'iso-07', article: 'A.16', de: 'Sicherheitsvorfall-Management etabliert?', en: 'Security incident management established?', type: 'organizational' },
    { id: 'iso-08', article: 'A.17', de: 'Business Continuity berücksichtigt?', en: 'Business continuity considered?', type: 'organizational' },
  ],
  DORA: [
    { id: 'dora-01', article: 'Art. 6', de: 'ICT-Risikomanagement-Framework etabliert?', en: 'ICT risk management framework established?', type: 'organizational' },
    { id: 'dora-02', article: 'Art. 8', de: 'ICT-Assets identifiziert und klassifiziert?', en: 'ICT assets identified and classified?', type: 'documentation' },
    { id: 'dora-03', article: 'Art. 9', de: 'Schutz- und Präventionsmaßnahmen implementiert?', en: 'Protection and prevention measures implemented?', type: 'technical' },
    { id: 'dora-04', article: 'Art. 10', de: 'Erkennung von Anomalien und Incidents?', en: 'Detection of anomalies and incidents?', type: 'technical' },
    { id: 'dora-05', article: 'Art. 11', de: 'Reaktions- und Wiederherstellungspläne vorhanden?', en: 'Response and recovery plans available?', type: 'organizational' },
    { id: 'dora-06', article: 'Art. 28', de: 'ICT-Drittanbieter-Risiko bewertet?', en: 'ICT third-party risk assessed?', type: 'organizational' },
  ],
  SOX: [
    { id: 'sox-01', article: 'Sec. 302', de: 'Interne Kontrollen für Finanzberichterstattung dokumentiert?', en: 'Internal controls for financial reporting documented?', type: 'documentation' },
    { id: 'sox-02', article: 'Sec. 404', de: 'Wirksamkeit interner Kontrollen bewertet?', en: 'Effectiveness of internal controls assessed?', type: 'organizational' },
    { id: 'sox-03', article: 'Sec. 802', de: 'Aufbewahrungspflichten eingehalten?', en: 'Record retention requirements met?', type: 'documentation' },
  ],
  BAIT: [
    { id: 'bait-01', article: 'Tz. 1-4', de: 'IT-Strategie dokumentiert und abgestimmt?', en: 'IT strategy documented and aligned?', type: 'documentation' },
    { id: 'bait-02', article: 'Tz. 5-9', de: 'IT-Governance-Struktur etabliert?', en: 'IT governance structure established?', type: 'organizational' },
    { id: 'bait-03', article: 'Tz. 10-14', de: 'Informationssicherheit-Management vorhanden?', en: 'Information security management available?', type: 'organizational' },
  ],
  KRITIS: [
    { id: 'krit-01', article: '§ 8a', de: 'Branchenspezifische Sicherheitsstandards umgesetzt?', en: 'Industry-specific security standards implemented?', type: 'technical' },
    { id: 'krit-02', article: '§ 8b', de: 'Meldepflicht bei Sicherheitsvorfällen eingerichtet?', en: 'Reporting obligation for security incidents established?', type: 'organizational' },
    { id: 'krit-03', article: '§ 8a', de: 'Regelmäßige Sicherheitsaudits durchgeführt?', en: 'Regular security audits conducted?', type: 'organizational' },
  ],
  EUAIACT: [
    { id: 'ai-01', article: 'Art. 6', de: 'KI-Risikoklassifizierung durchgeführt (unannehmbares / hohes / begrenztes / minimales Risiko)?', en: 'AI risk classification conducted (unacceptable / high / limited / minimal risk)?', type: 'documentation' },
    { id: 'ai-02', article: 'Art. 9', de: 'Risikomanagement-System für das KI-System etabliert?', en: 'Risk management system for the AI system established?', type: 'organizational' },
    { id: 'ai-03', article: 'Art. 10', de: 'Datenqualität und Daten-Governance sichergestellt?', en: 'Data quality and data governance ensured?', type: 'organizational' },
    { id: 'ai-04', article: 'Art. 11', de: 'Technische Dokumentation vollständig vorhanden?', en: 'Technical documentation fully available?', type: 'documentation' },
    { id: 'ai-05', article: 'Art. 12', de: 'Aufzeichnungspflichten (Logging) implementiert?', en: 'Record-keeping (logging) obligations implemented?', type: 'technical' },
    { id: 'ai-06', article: 'Art. 13', de: 'Transparenz und Informationspflichten erfüllt?', en: 'Transparency and information obligations fulfilled?', type: 'documentation' },
    { id: 'ai-07', article: 'Art. 14', de: 'Menschliche Aufsicht (Human Oversight) gewährleistet?', en: 'Human oversight ensured?', type: 'organizational' },
    { id: 'ai-08', article: 'Art. 15', de: 'Genauigkeit, Robustheit und Cybersicherheit gewährleistet?', en: 'Accuracy, robustness and cybersecurity ensured?', type: 'technical' },
    { id: 'ai-09', article: 'Art. 52', de: 'Kennzeichnungspflicht für KI-generierte Inhalte umgesetzt?', en: 'Labelling obligation for AI-generated content implemented?', type: 'technical' },
    { id: 'ai-10', article: 'Art. 16/17', de: 'Konformitätsbewertung vorbereitet (bei Hochrisiko)?', en: 'Conformity assessment prepared (for high-risk)?', type: 'documentation' },
  ],
  CRA: [
    { id: 'cra-01', article: 'Art. 10', de: 'Security by Design im Entwicklungsprozess?', en: 'Security by Design in development process?', type: 'technical' },
    { id: 'cra-02', article: 'Art. 10', de: 'Software Bill of Materials (SBOM) vorhanden?', en: 'Software Bill of Materials (SBOM) available?', type: 'documentation' },
    { id: 'cra-03', article: 'Art. 11', de: 'Schwachstellen-Meldeprozess etabliert?', en: 'Vulnerability reporting process established?', type: 'organizational' },
    { id: 'cra-04', article: 'Art. 10', de: 'Sicherheitsupdates über Produktlebenszyklus gewährleistet?', en: 'Security updates over product lifecycle ensured?', type: 'technical' },
  ],
}

export { controlQuestions }

export default {
  name: 'ComplianceAssessment',
  props: {
    appId: { type: String, required: true },
    regulation: { type: String, required: true },
  },
  emits: ['close', 'saved'],
  template: `
    <div class="fixed inset-0 z-50 flex items-start justify-center pt-6 bg-black/40 overflow-y-auto" @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 mb-8" @click.stop>

        <!-- Header -->
        <div class="px-6 py-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span class="text-xl">⚖️</span>
                {{ lang === 'de' ? 'Compliance Assessment' : 'Compliance Assessment' }}
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                <span class="font-semibold text-gray-700">{{ appName }}</span>
                <span class="mx-2">→</span>
                <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">{{ regLabel }}</span>
              </p>
            </div>
            <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>

          <!-- Score bar -->
          <div class="mt-4 grid grid-cols-6 gap-2">
            <div class="bg-white rounded-lg p-2.5 text-center shadow-sm">
              <div class="text-xl font-bold" :class="scoreColor">{{ score }}%</div>
              <div class="text-[10px] text-gray-400">Score</div>
            </div>
            <div class="bg-white rounded-lg p-2.5 text-center shadow-sm">
              <div class="text-xl font-bold text-gray-600">{{ answered }}/{{ questions.length }}</div>
              <div class="text-[10px] text-gray-400">{{ lang === 'de' ? 'Bewertet' : 'Assessed' }}</div>
            </div>
            <div class="bg-white rounded-lg p-2.5 text-center shadow-sm">
              <div class="text-xl font-bold text-green-600">{{ counts.compliant }}</div>
              <div class="text-[10px] text-gray-400">✅</div>
            </div>
            <div class="bg-white rounded-lg p-2.5 text-center shadow-sm">
              <div class="text-xl font-bold text-yellow-600">{{ counts.partial }}</div>
              <div class="text-[10px] text-gray-400">⚠️</div>
            </div>
            <div class="bg-white rounded-lg p-2.5 text-center shadow-sm">
              <div class="text-xl font-bold text-red-600">{{ counts.nonCompliant }}</div>
              <div class="text-[10px] text-gray-400">❌</div>
            </div>
            <div class="bg-white rounded-lg p-2.5 text-center shadow-sm">
              <div class="text-xl font-bold text-blue-500">{{ counts.na }}</div>
              <div class="text-[10px] text-gray-400">N/A</div>
            </div>
          </div>
          <div class="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div class="h-1.5 rounded-full transition-all duration-500" :class="progressBarColor" :style="'width:' + score + '%'"></div>
          </div>
        </div>

        <!-- Questions grouped by control type -->
        <div class="px-6 py-4 max-h-[55vh] overflow-y-auto">
          <div v-for="(group, gtype) in groupedQuestions" :key="gtype" class="mb-5">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 pb-1 border-b border-surface-100">
              {{ typeLabel(gtype) }} ({{ group.length }})
            </h4>
            <div v-for="q in group" :key="q.id"
                 class="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <span class="shrink-0 w-16 text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded mt-0.5">{{ q.article }}</span>
              <span class="flex-1 text-sm text-gray-700">{{ q[lang] || q.de }}</span>
              <div class="shrink-0 flex gap-1">
                <button v-for="st in statusOptions" :key="st.value"
                        @click="setAnswer(q.id, st.value)"
                        class="w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all"
                        :class="answers[q.id] === st.value ? st.activeClass : 'bg-white border-gray-200 text-gray-300 hover:border-gray-400 hover:text-gray-500'"
                        :title="st.title[lang]">
                  {{ st.icon }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <div class="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ lang === 'de' ? 'Bewertet durch' : 'Assessed by' }}</label>
              <input v-model="assessor" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none" :placeholder="lang === 'de' ? 'Name' : 'Name'" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ lang === 'de' ? 'Nächste Überprüfung' : 'Next review' }}</label>
              <input :value="nextReview" disabled class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-gray-100 text-gray-500" />
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-600 mb-1">{{ lang === 'de' ? 'Anmerkungen' : 'Notes' }}</label>
            <textarea v-model="notes" rows="2" class="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 outline-none resize-vertical" :placeholder="lang === 'de' ? 'Zusätzliche Bemerkungen…' : 'Additional notes…'"></textarea>
          </div>
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              {{ lang === 'de' ? 'Status' : 'Status' }}:
              <span class="font-bold" :class="overallStatusColor">{{ overallStatusLabel }}</span>
            </div>
            <div class="flex gap-2">
              <button @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">{{ lang === 'de' ? 'Abbrechen' : 'Cancel' }}</button>
              <button @click="save" class="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 font-medium">{{ lang === 'de' ? 'Assessment speichern' : 'Save Assessment' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup (props, { emit }) {
    const { ref, computed, onMounted } = Vue
    const lang = computed(() => i18n.locale)
    const answers = ref({})
    const assessor = ref('')
    const notes = ref('')

    const questions = computed(() => controlQuestions[props.regulation] || [])

    const statusOptions = [
      { value: 'compliant', icon: '✅', activeClass: 'bg-green-500 text-white border-green-600', title: { de: 'Erfüllt', en: 'Compliant' } },
      { value: 'partial', icon: '⚠️', activeClass: 'bg-yellow-400 text-yellow-900 border-yellow-500', title: { de: 'Teilweise', en: 'Partially' } },
      { value: 'nonCompliant', icon: '❌', activeClass: 'bg-red-500 text-white border-red-600', title: { de: 'Nicht erfüllt', en: 'Non-compliant' } },
      { value: 'na', icon: '➖', activeClass: 'bg-blue-400 text-white border-blue-500', title: { de: 'N/A', en: 'N/A' } },
    ]

    const appName = computed(() => {
      const a = store.appById(props.appId)
      return a ? a.name : props.appId
    })

    const regLabel = computed(() => {
      const allRegs = (store.data.enums && store.data.enums.complianceRegulations) || []
      const r = allRegs.find(r => r.value === props.regulation)
      return r ? r.label : props.regulation
    })

    const groupedQuestions = computed(() => {
      const groups = {}
      for (const q of questions.value) {
        if (!groups[q.type]) groups[q.type] = []
        groups[q.type].push(q)
      }
      return groups
    })

    function typeLabel (type) {
      const labels = {
        technical: { de: '🔧 Technische Kontrollen', en: '🔧 Technical Controls' },
        organizational: { de: '📋 Organisatorische Kontrollen', en: '📋 Organizational Controls' },
        documentation: { de: '📄 Dokumentation', en: '📄 Documentation' },
      }
      return (labels[type] || {})[lang.value] || type
    }

    // -- Stats --
    const counts = computed(() => {
      const a = answers.value
      let compliant = 0, partial = 0, nonCompliant = 0, na = 0
      for (const v of Object.values(a)) {
        if (v === 'compliant') compliant++
        else if (v === 'partial') partial++
        else if (v === 'nonCompliant') nonCompliant++
        else if (v === 'na') na++
      }
      return { compliant, partial, nonCompliant, na }
    })

    const answered = computed(() => {
      return Object.values(answers.value).filter(v => v && v !== 'notAssessed').length
    })

    const score = computed(() => {
      const c = counts.value
      const applicable = questions.value.length - c.na
      if (applicable <= 0) return 100
      return Math.round(((c.compliant + c.partial * 0.5) / applicable) * 100)
    })

    const scoreColor = computed(() => {
      if (score.value >= 80) return 'text-green-600'
      if (score.value >= 50) return 'text-yellow-600'
      return 'text-red-600'
    })

    const progressBarColor = computed(() => {
      if (score.value >= 80) return 'bg-green-500'
      if (score.value >= 50) return 'bg-yellow-500'
      return 'bg-red-500'
    })

    const overallStatus = computed(() => {
      if (answered.value === 0) return 'notAssessed'
      if (counts.value.nonCompliant > 0) return 'nonCompliant'
      if (counts.value.partial > 0 || answered.value < questions.value.length) return 'partial'
      return 'compliant'
    })

    const overallStatusColor = computed(() => {
      return { compliant: 'text-green-600', partial: 'text-yellow-600', nonCompliant: 'text-red-600', notAssessed: 'text-gray-400' }[overallStatus.value]
    })

    const overallStatusLabel = computed(() => {
      const labels = {
        compliant: { de: '✅ Konform', en: '✅ Compliant' },
        partial: { de: '⚠️ Teilweise konform', en: '⚠️ Partially compliant' },
        nonCompliant: { de: '❌ Nicht konform', en: '❌ Non-compliant' },
        notAssessed: { de: '⬜ Nicht bewertet', en: '⬜ Not assessed' },
      }
      return (labels[overallStatus.value] || {})[lang.value] || overallStatus.value
    })

    const nextReview = computed(() => {
      const d = new Date()
      d.setFullYear(d.getFullYear() + 1)
      return d.toISOString().split('T')[0]
    })

    // -- Load existing assessment --
    onMounted(() => {
      const existing = (store.data.complianceAssessments || []).find(
        a => a.appId === props.appId && a.regulation === props.regulation
      )
      if (existing && existing.answers) {
        answers.value = { ...existing.answers }
        assessor.value = existing.assessedBy || ''
        notes.value = existing.notes || ''
      } else {
        // Initialize all to notAssessed
        const init = {}
        for (const q of questions.value) init[q.id] = 'notAssessed'
        answers.value = init
      }
    })

    function setAnswer (qId, status) {
      answers.value[qId] = status
    }

    function save () {
      if (!store.data.complianceAssessments) store.data.complianceAssessments = []
      const list = store.data.complianceAssessments
      const idx = list.findIndex(a => a.appId === props.appId && a.regulation === props.regulation)
      const record = {
        id: idx >= 0 ? list[idx].id : 'CA-' + Date.now(),
        appId: props.appId,
        regulation: props.regulation,
        status: overallStatus.value,
        score: score.value,
        answers: { ...answers.value },
        assessedBy: assessor.value,
        assessedDate: new Date().toISOString().split('T')[0],
        nextReviewDate: nextReview.value,
        notes: notes.value,
        auditTrail: (idx >= 0 && list[idx].auditTrail) ? [
          ...list[idx].auditTrail,
          { timestamp: new Date().toISOString(), user: assessor.value || 'System', action: 'assessment_updated', status: overallStatus.value, score: score.value }
        ] : [
          { timestamp: new Date().toISOString(), user: assessor.value || 'System', action: 'assessment_created', status: overallStatus.value, score: score.value }
        ]
      }
      if (idx >= 0) list[idx] = record
      else list.push(record)
      emit('saved', record)
    }

    return {
      lang, answers, assessor, notes, questions, statusOptions, appName, regLabel,
      groupedQuestions, typeLabel, counts, answered, score, scoreColor, progressBarColor,
      overallStatus, overallStatusColor, overallStatusLabel, nextReview, setAnswer, save
    }
  }
}
