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

    // ── Nav Items – Governance ──
    'nav.riskHeatmap': 'Risiko-Heatmap',
    'nav.conformityScorecard': 'Konformitätsbewertung',
    'nav.budgetDashboard': 'Budget-Dashboard',
    'nav.dataQuality': 'Datenqualität',

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

    // ── Misc UI ──
    'ui.collapse': 'Navigation einklappen',
    'ui.expand': 'Navigation ausklappen',
    'ui.pin': 'Als Favorit markieren',
    'ui.unpin': 'Favorit entfernen',
    'ui.close': 'Schließen',
    'ui.openMenu': 'Navigationsmenü öffnen',
    'ui.closeMenu': 'Navigationsmenü schließen',
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

    // ── Nav Items – Governance ──
    'nav.riskHeatmap': 'Risk Heatmap',
    'nav.conformityScorecard': 'Conformity Scorecard',
    'nav.budgetDashboard': 'Budget Dashboard',
    'nav.dataQuality': 'Data Quality',

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

    // ── Misc UI ──
    'ui.collapse': 'Collapse navigation',
    'ui.expand': 'Expand navigation',
    'ui.pin': 'Pin as favorite',
    'ui.unpin': 'Remove favorite',
    'ui.close': 'Close',
    'ui.openMenu': 'Open navigation menu',
    'ui.closeMenu': 'Close navigation menu',
  }
}
