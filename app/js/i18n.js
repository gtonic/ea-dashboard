// i18n.js — Internationalization module (DE/EN) for EA Dashboard
import { reactive } from 'vue'

const LANG_KEY = 'ea-language'

export const i18n = reactive({
  locale: localStorage.getItem(LANG_KEY) || 'de',

  setLocale (lang) {
    this.locale = lang
    localStorage.setItem(LANG_KEY, lang)
  },

  t (key) {
    const dict = translations[this.locale] || translations.de
    return dict[key] || translations.de[key] || key
  }
})

// ────────────────────────────────────────────
// Translation dictionaries
// ────────────────────────────────────────────
const translations = {
  de: {
    // ── App ──
    'app.title': 'EA Dashboard',
    'app.subtitle': 'Enterprise-Architektur',
    'app.loading': 'Daten werden geladen…',
    'app.version': 'Version',
    'app.lastSaved': 'Zuletzt gespeichert',

    // ── Nav Groups ──
    'nav.overview': 'Übersicht',
    'nav.portfolio': 'Portfolio',
    'nav.projects': 'Vorhaben',
    'nav.vendors': 'Lieferanten',
    'nav.analysis': 'Analysen',
    'nav.governance': 'Governance',
    'nav.innovation': 'Innovation',
    'nav.system': 'System',
    'nav.favorites': 'Favoriten',

    // ── Nav Items – Overview ──
    'nav.dashboard': 'Dashboard',
    'nav.executiveSummary': 'Executive Summary',
    'nav.roadmap': 'Strategische Roadmap',

    // ── Nav Items – Portfolio ──
    'nav.applications': 'Applikationen',
    'nav.domains': 'Domänen & Capabilities',
    'nav.processes': 'Prozesse',
    'nav.entities': 'Rechtliche Entitäten',
    'nav.integrations': 'Integrationen',

    // ── Nav Items – Projects ──
    'nav.demands': 'Demand-Backlog',
    'nav.demandPipeline': 'Demand-Pipeline',
    'nav.projectPortfolio': 'Projektportfolio',
    'nav.projectHeatmap': 'Projekt-Heatmap',
    'nav.scenarioPlanner': 'Szenario-Planer',

    // ── Nav Items – Vendors ──
    'nav.vendorList': 'Lieferantenübersicht',
    'nav.vendorScorecard': 'Lieferantenbewertung',

    // ── Nav Items – Analysis ──
    'nav.capabilityMatrix': 'Capability-Matrix',
    'nav.capabilityInvestment': 'Capability-Investment',
    'nav.timeQuadrant': 'TIME-Quadrant',
    'nav.maturityGap': 'Reifegradanalyse',
    'nav.dependencies': 'Abhängigkeitsgraph',
    'nav.resourceOverlap': 'Ressourcen-Überlappung',
    'nav.techRadar': 'Technologie-Radar',

    // ── Nav Items – Governance ──
    'nav.riskHeatmap': 'Risiko-Heatmap',
    'nav.conformityScorecard': 'Konformitätsbewertung',
    'nav.budgetDashboard': 'Budget-Dashboard',
    'nav.dataQuality': 'Datenqualität',
    'nav.eaHealthScore': 'EA Health Score',

    // ── Nav Items – Innovation ──
    'nav.aiUsecases': 'KI-Anwendungsfälle',

    // ── Nav Items – System ──
    'nav.settings': 'Einstellungen',

    // ── Search ──
    'search.placeholder': 'Suche…',
    'search.shortcut': '⌘K',
    'search.title': 'Globale Suche',
    'search.fullPlaceholder': 'Applikationen, Domänen, Projekte, Lieferanten durchsuchen…',
    'search.noResults': 'Keine Ergebnisse gefunden',
    'search.results': 'Ergebnisse',

    // ── Breadcrumbs ──
    'breadcrumb.home': 'Start',

    // ── Language ──
    'lang.de': 'Deutsch',
    'lang.en': 'English',
    'lang.switch': 'Sprache',

    // ── Page Titles ──
    'page.dashboard': 'Dashboard',
    'page.domains': 'Domänen & Capabilities',
    'page.domainDetail': 'Domänen-Detail',
    'page.applications': 'Applikationen',
    'page.appDetail': 'Applikations-Detail',
    'page.capabilityMatrix': 'Capability–Applikations-Matrix',
    'page.timeQuadrant': 'TIME-Quadrant',
    'page.integrationMap': 'Integrationskarte',
    'page.projectPortfolio': 'Projektportfolio',
    'page.projectDetail': 'Projekt-Detail',
    'page.projectHeatmap': 'Projekt–Domänen-Heatmap',
    'page.dependencies': 'Projektabhängigkeiten',
    'page.processes': 'E2E-Prozesse',
    'page.processDetail': 'Prozess-Detail',
    'page.vendors': 'Lieferantenverwaltung',
    'page.vendorDetail': 'Lieferanten-Detail',
    'page.vendorScorecard': 'Lieferanten-Abhängigkeits-Scorecard',
    'page.entities': 'Rechtliche Entitäten',
    'page.entityDetail': 'Entitäts-Detail',
    'page.demands': 'Demand-Backlog',
    'page.demandDetail': 'Demand-Detail',
    'page.demandPipeline': 'Demand-Pipeline',
    'page.aiUsecases': 'KI-Anwendungsfälle',
    'page.budgetDashboard': 'Budget-Dashboard',
    'page.riskHeatmap': 'Risiko & Compliance',
    'page.dataQuality': 'Datenqualitäts-Dashboard',
    'page.resourceOverlap': 'Ressourcen-Überlappungsanalyse',
    'page.scenarioPlanner': 'Szenario-Planung / What-If',
    'page.maturityGap': 'Reifegradanalyse',
    'page.roadmap': 'Strategische Roadmap',
    'page.executiveSummary': 'Executive Summary',
    'page.settings': 'Einstellungen',
    'page.globalSearch': 'Globale Suche',
    'page.capabilityInvestment': 'Capability-Investment-Analyse',
    'page.conformityScorecard': 'Strategische Konformitäts-Scorecard',
    'page.techRadar': 'Technologie-Radar',
    'page.eaHealthScore': 'EA Health Score',
    'page.appLifecycleTimeline': 'App-Lifecycle-Timeline',
    'page.tcoCalculator': 'TCO-Rechner',

    // ── Nav Items – Phase 7 ──
    'nav.appLifecycleTimeline': 'App-Lifecycle-Timeline',
    'nav.tcoCalculator': 'TCO-Rechner',

    // ── Lifecycle Timeline ──
    'lifecycle.planned': 'Geplant',
    'lifecycle.active': 'Aktiv',
    'lifecycle.endOfSupport': 'End-of-Support',
    'lifecycle.endOfLife': 'End-of-Life',
    'lifecycle.eolWarnings': 'EOL-Warnungen',
    'lifecycle.warningTitle': 'Apps mit bevorstehendem End-of-Life',
    'lifecycle.months': 'Monate',
    'lifecycle.searchPlaceholder': 'Applikation suchen…',
    'lifecycle.allStatuses': 'Alle Status',
    'lifecycle.allCriticalities': 'Alle Kritikalitäten',
    'lifecycle.timelineTitle': 'Lifecycle-Timeline',
    'lifecycle.today': 'Heute',
    'lifecycle.detailTable': 'Lifecycle-Details',
    'lifecycle.colApp': 'Applikation',
    'lifecycle.colVendor': 'Hersteller',
    'lifecycle.colStatus': 'Status',
    'lifecycle.colCriticality': 'Kritikalität',
    'lifecycle.colGoLive': 'Go-Live',
    'lifecycle.colEOS': 'End-of-Support',
    'lifecycle.colEOL': 'End-of-Life',
    'lifecycle.colRemaining': 'Verbleibend',
    'lifecycle.expired': 'Abgelaufen',

    // ── TCO Calculator ──
    'tco.totalTCO': 'Gesamt-TCO',
    'tco.avgTCO': 'Durchschnitt',
    'tco.perApp': 'pro Applikation',
    'tco.applications': 'Applikationen',
    'tco.licenseCosts': 'Lizenzkosten',
    'tco.operationsCosts': 'Betriebskosten',
    'tco.costBreakdown': 'Kostenaufschlüsselung pro Applikation',
    'tco.license': 'Lizenzen',
    'tco.operations': 'Betrieb',
    'tco.integration': 'Integration',
    'tco.personnel': 'Personal',
    'tco.perCapability': 'TCO pro Capability',
    'tco.capability': 'Capability',
    'tco.domain': 'Domäne',
    'tco.numApps': 'Apps',
    'tco.totalLabel': 'Gesamt',
    'tco.avgLabel': 'Ø pro App',
    'tco.comparison': 'TCO-Vergleich',
    'tco.appA': 'Applikation A',
    'tco.appB': 'Applikation B',
    'tco.selectApp': '— Applikation wählen —',
    'tco.costCategory': 'Kostenkategorie',
    'tco.difference': 'Differenz',
    'tco.selectBoth': 'Bitte zwei Applikationen zum Vergleich auswählen.',
    'tco.detailTable': 'TCO-Detailtabelle',
    'tco.colApp': 'Applikation',
    'tco.colVendor': 'Hersteller',
    'tco.costPerUser': 'Kosten/User',

    // ── Misc UI ──
    'ui.collapse': 'Navigation einklappen',
    'ui.expand': 'Navigation ausklappen',
    'ui.pin': 'Als Favorit markieren',
    'ui.unpin': 'Favorit entfernen',
    'ui.close': 'Schließen',
    'ui.openMenu': 'Navigationsmenü öffnen',
    'ui.closeMenu': 'Navigationsmenü schließen',

    // ── Settings ──
    'settings.featureToggles': 'Funktionsbereiche',
    'settings.analysisDesc': 'Erweiterte Analysefunktionen ein-/ausblenden',
    'settings.governanceDesc': 'Governance-Funktionen ein-/ausblenden',
    'settings.complianceDesc': 'Compliance-Funktionen ein-/ausblenden',
    'settings.complianceRegulations': 'Regulatorien',
    'settings.complianceRegulationsDesc': 'Zutreffende Regulierungen auswählen',

    // ── Compliance ──
    'nav.compliance': 'Compliance',
    'nav.complianceDashboard': 'Compliance-Dashboard',
    'page.complianceDashboard': 'Compliance-Dashboard',
    'compliance.title': 'Compliance-Übersicht',
    'compliance.activeRegulations': 'Aktive Regulierungen',
    'compliance.noRegulations': 'Keine Regulierungen ausgewählt. Bitte in den Einstellungen konfigurieren.',
    'compliance.overallStatus': 'Gesamtstatus',
    'compliance.compliant': 'Konform',
    'compliance.partiallyCompliant': 'Teilweise konform',
    'compliance.nonCompliant': 'Nicht konform',
    'compliance.regulation': 'Regulierung',
    'compliance.status': 'Status',
    'compliance.coverage': 'Abdeckung',
    'compliance.affectedApps': 'Betroffene Applikationen',
    'compliance.goToSettings': 'Einstellungen öffnen',
  },

  en: {
    // ── App ──
    'app.title': 'EA Dashboard',
    'app.subtitle': 'Enterprise Architecture',
    'app.loading': 'Loading data…',
    'app.version': 'Version',
    'app.lastSaved': 'Last saved',

    // ── Nav Groups ──
    'nav.overview': 'Overview',
    'nav.portfolio': 'Portfolio',
    'nav.projects': 'Projects',
    'nav.vendors': 'Vendors',
    'nav.analysis': 'Analysis',
    'nav.governance': 'Governance',
    'nav.innovation': 'Innovation',
    'nav.system': 'System',
    'nav.favorites': 'Favorites',

    // ── Nav Items – Overview ──
    'nav.dashboard': 'Dashboard',
    'nav.executiveSummary': 'Executive Summary',
    'nav.roadmap': 'Strategy Roadmap',

    // ── Nav Items – Portfolio ──
    'nav.applications': 'Applications',
    'nav.domains': 'Domains & Capabilities',
    'nav.processes': 'Processes',
    'nav.entities': 'Legal Entities',
    'nav.integrations': 'Integrations',

    // ── Nav Items – Projects ──
    'nav.demands': 'Demand Backlog',
    'nav.demandPipeline': 'Demand Pipeline',
    'nav.projectPortfolio': 'Project Portfolio',
    'nav.projectHeatmap': 'Project Heatmap',
    'nav.scenarioPlanner': 'Scenario Planner',

    // ── Nav Items – Vendors ──
    'nav.vendorList': 'Vendor Overview',
    'nav.vendorScorecard': 'Vendor Scorecard',

    // ── Nav Items – Analysis ──
    'nav.capabilityMatrix': 'Capability Matrix',
    'nav.capabilityInvestment': 'Capability Investment',
    'nav.timeQuadrant': 'TIME Quadrant',
    'nav.maturityGap': 'Maturity Gap Analysis',
    'nav.dependencies': 'Dependency Graph',
    'nav.resourceOverlap': 'Resource Overlap',
    'nav.techRadar': 'Technology Radar',

    // ── Nav Items – Governance ──
    'nav.riskHeatmap': 'Risk Heatmap',
    'nav.conformityScorecard': 'Conformity Scorecard',
    'nav.budgetDashboard': 'Budget Dashboard',
    'nav.dataQuality': 'Data Quality',
    'nav.eaHealthScore': 'EA Health Score',

    // ── Nav Items – Innovation ──
    'nav.aiUsecases': 'AI Use Cases',

    // ── Nav Items – System ──
    'nav.settings': 'Settings',

    // ── Search ──
    'search.placeholder': 'Search…',
    'search.shortcut': '⌘K',
    'search.title': 'Global Search',
    'search.fullPlaceholder': 'Search applications, domains, projects, vendors…',
    'search.noResults': 'No results found',
    'search.results': 'results',

    // ── Breadcrumbs ──
    'breadcrumb.home': 'Home',

    // ── Language ──
    'lang.de': 'Deutsch',
    'lang.en': 'English',
    'lang.switch': 'Language',

    // ── Page Titles ──
    'page.dashboard': 'Dashboard',
    'page.domains': 'Domains & Capabilities',
    'page.domainDetail': 'Domain Detail',
    'page.applications': 'Applications',
    'page.appDetail': 'Application Detail',
    'page.capabilityMatrix': 'Capability–Application Matrix',
    'page.timeQuadrant': 'TIME Quadrant',
    'page.integrationMap': 'Integration Map',
    'page.projectPortfolio': 'Project Portfolio',
    'page.projectDetail': 'Project Detail',
    'page.projectHeatmap': 'Project–Domain Heatmap',
    'page.dependencies': 'Project Dependencies',
    'page.processes': 'E2E Processes',
    'page.processDetail': 'Process Detail',
    'page.vendors': 'Vendor Management',
    'page.vendorDetail': 'Vendor Detail',
    'page.vendorScorecard': 'Vendor Dependency Scorecard',
    'page.entities': 'Legal Entities',
    'page.entityDetail': 'Entity Detail',
    'page.demands': 'Demand Backlog',
    'page.demandDetail': 'Demand Detail',
    'page.demandPipeline': 'Demand Pipeline',
    'page.aiUsecases': 'AI Use Cases',
    'page.budgetDashboard': 'Budget Dashboard',
    'page.riskHeatmap': 'Risk & Compliance',
    'page.dataQuality': 'Data Quality Dashboard',
    'page.resourceOverlap': 'Resource Overlap Analysis',
    'page.scenarioPlanner': 'Scenario Planner / What-If',
    'page.maturityGap': 'Maturity Gap Analysis',
    'page.roadmap': 'Strategy Roadmap',
    'page.executiveSummary': 'Executive Summary',
    'page.settings': 'Settings',
    'page.globalSearch': 'Global Search',
    'page.capabilityInvestment': 'Capability Investment Analysis',
    'page.conformityScorecard': 'Strategic Conformity Scorecard',
    'page.techRadar': 'Technology Radar',
    'page.eaHealthScore': 'EA Health Score',
    'page.appLifecycleTimeline': 'App Lifecycle Timeline',
    'page.tcoCalculator': 'TCO Calculator',

    // ── Nav Items – Phase 7 ──
    'nav.appLifecycleTimeline': 'App Lifecycle Timeline',
    'nav.tcoCalculator': 'TCO Calculator',

    // ── Lifecycle Timeline ──
    'lifecycle.planned': 'Planned',
    'lifecycle.active': 'Active',
    'lifecycle.endOfSupport': 'End-of-Support',
    'lifecycle.endOfLife': 'End-of-Life',
    'lifecycle.eolWarnings': 'EOL Warnings',
    'lifecycle.warningTitle': 'Apps approaching End-of-Life',
    'lifecycle.months': 'months',
    'lifecycle.searchPlaceholder': 'Search application…',
    'lifecycle.allStatuses': 'All Statuses',
    'lifecycle.allCriticalities': 'All Criticalities',
    'lifecycle.timelineTitle': 'Lifecycle Timeline',
    'lifecycle.today': 'Today',
    'lifecycle.detailTable': 'Lifecycle Details',
    'lifecycle.colApp': 'Application',
    'lifecycle.colVendor': 'Vendor',
    'lifecycle.colStatus': 'Status',
    'lifecycle.colCriticality': 'Criticality',
    'lifecycle.colGoLive': 'Go-Live',
    'lifecycle.colEOS': 'End-of-Support',
    'lifecycle.colEOL': 'End-of-Life',
    'lifecycle.colRemaining': 'Remaining',
    'lifecycle.expired': 'Expired',

    // ── TCO Calculator ──
    'tco.totalTCO': 'Total TCO',
    'tco.avgTCO': 'Average',
    'tco.perApp': 'per application',
    'tco.applications': 'Applications',
    'tco.licenseCosts': 'License Costs',
    'tco.operationsCosts': 'Operations Costs',
    'tco.costBreakdown': 'Cost Breakdown per Application',
    'tco.license': 'License',
    'tco.operations': 'Operations',
    'tco.integration': 'Integration',
    'tco.personnel': 'Personnel',
    'tco.perCapability': 'TCO per Capability',
    'tco.capability': 'Capability',
    'tco.domain': 'Domain',
    'tco.numApps': 'Apps',
    'tco.totalLabel': 'Total',
    'tco.avgLabel': 'Avg per App',
    'tco.comparison': 'TCO Comparison',
    'tco.appA': 'Application A',
    'tco.appB': 'Application B',
    'tco.selectApp': '— Select application —',
    'tco.costCategory': 'Cost Category',
    'tco.difference': 'Difference',
    'tco.selectBoth': 'Please select two applications to compare.',
    'tco.detailTable': 'TCO Detail Table',
    'tco.colApp': 'Application',
    'tco.colVendor': 'Vendor',
    'tco.costPerUser': 'Cost/User',

    // ── Misc UI ──
    'ui.collapse': 'Collapse navigation',
    'ui.expand': 'Expand navigation',
    'ui.pin': 'Pin as favorite',
    'ui.unpin': 'Remove favorite',
    'ui.close': 'Close',
    'ui.openMenu': 'Open navigation menu',
    'ui.closeMenu': 'Close navigation menu',

    // ── Settings ──
    'settings.featureToggles': 'Feature Toggles',
    'settings.analysisDesc': 'Show/hide extended analysis features',
    'settings.governanceDesc': 'Show/hide governance features',
    'settings.complianceDesc': 'Show/hide compliance features',
    'settings.complianceRegulations': 'Regulations',
    'settings.complianceRegulationsDesc': 'Select applicable regulations',

    // ── Compliance ──
    'nav.compliance': 'Compliance',
    'nav.complianceDashboard': 'Compliance Dashboard',
    'page.complianceDashboard': 'Compliance Dashboard',
    'compliance.title': 'Compliance Overview',
    'compliance.activeRegulations': 'Active Regulations',
    'compliance.noRegulations': 'No regulations selected. Please configure in Settings.',
    'compliance.overallStatus': 'Overall Status',
    'compliance.compliant': 'Compliant',
    'compliance.partiallyCompliant': 'Partially Compliant',
    'compliance.nonCompliant': 'Non-Compliant',
    'compliance.regulation': 'Regulation',
    'compliance.status': 'Status',
    'compliance.coverage': 'Coverage',
    'compliance.affectedApps': 'Affected Applications',
    'compliance.goToSettings': 'Open Settings',
  }
}
