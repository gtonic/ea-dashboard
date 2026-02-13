# EA Dashboard

> **Enterprise Architecture Dashboard** — A strategic IT landscape planning tool ("Strategischer Bebauungsplan") for mid-sized industrial enterprises. Built as a standalone, single-file HTML application.

---

## Table of Contents

- [Overview](#overview)
- [User Documentation](#user-documentation)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Components](#components)
- [Getting Started](#getting-started)
- [Build](#build)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Feature Roadmap](#feature-roadmap)
- [Server-Architektur Konzept](#server-architektur-konzept)

---

## Overview

The EA Dashboard is an Application Portfolio Management (APM) tool designed for CIOs, PMOs, and enterprise architects. It provides strategic visibility into IT landscapes including application portfolios, capability mappings, project tracking, vendor management, demand pipelines, and risk assessments.

**Key characteristics:**

- **Zero-server architecture** — Runs entirely in the browser, including from `file://`
- **Single-file distribution** — Build script bundles everything into one self-contained HTML file
- **Offline-capable** — All dependencies loaded via CDN on first load; data persisted in `localStorage`
- **No build toolchain required** — No webpack, no Vite, no npm needed for the app itself

## User Documentation

For a comprehensive guide to all features — grouped by stakeholder role (CIO, Enterprise Architect, PMO, Business Stakeholders) — see the **[User Documentation (USERDOC.md)](USERDOC.md)**.
For strategic differentiation ideas (Brainstorming) see **[docs/BRAINSTORMING-DIFFERENZIERUNG.md](docs/BRAINSTORMING-DIFFERENZIERUNG.md)**.

## Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | [Vue 3](https://vuejs.org/) (ESM/Global build via CDN) | Reactive UI components |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (CDN) | Utility-first CSS |
| **Charts** | [Chart.js 4](https://www.chartjs.org/) | Bar, pie, line, doughnut charts |
| **Graphs** | [D3.js 7](https://d3js.org/) | Force-directed dependency graphs |
| **State** | Custom reactive store (`store.js`) | Centralized state management with `localStorage` persistence |
| **Routing** | Custom hash-based router (`router.js`) | SPA navigation via `#/path` |
| **Build** | Python 3 script (`build_single.py`) | Bundles multi-file app into single HTML |
| **Tests** | [Vitest](https://vitest.dev/) | Unit testing framework |

### Application Flow

```
index.html (dev) ─── or ─── bebauungsplan.html (production single-file)
    │
    ├── app.js          → Creates Vue app, registers 35 components
    ├── store.js        → Reactive state: CRUD operations, persistence, import/export
    ├── router.js       → Hash-based SPA routing with pattern matching
    └── components/     → 37 Vue components (list, detail, form, dashboard views)
          │
          └── data/bebauungsplan.json  → Seed data loaded on first run
```

### State Management

The store (`store.js`) uses Vue 3's `reactive()` to create a centralized, deeply-watched state object. Changes are automatically debounce-persisted to `localStorage` (500ms delay).

**Key features:**
- Computed getters for aggregated metrics (avg maturity, budget totals, TIME distribution)
- Full CRUD for all entity types (domains, apps, projects, vendors, demands, integrations, processes)
- Cascading deletes (e.g., deleting a domain removes its capability mappings and project references)
- JSON import/export for data portability
- Reset-to-seed functionality

### Routing

The router (`router.js`) implements hash-based navigation with regex pattern matching:

```
#/                    → Dashboard
#/apps                → Application list
#/apps/APP-001        → Application detail (parameterized)
#/domains/3           → Domain detail (parameterized)
#/risk-heatmap        → Risk heatmap view
...
```

Unknown routes fall back to the dashboard. Query parameters are parsed automatically.

## Data Model

### Core Entities

| Entity | ID Format | Description |
|--------|-----------|-------------|
| **Domains** | Numeric (1, 2, ...) | Business domains (e.g., Production, Sales, Finance) |
| **Capabilities** | `{domainId}.{n}` (e.g., `1.3`) | Business capabilities with maturity levels (1–5) |
| **Sub-Capabilities** | `{capId}.{n}` (e.g., `1.3.2`) | Granular capability breakdown |
| **Applications** | `APP-{nnn}` | IT systems with vendor, cost, criticality, TIME quadrant |
| **Projects** | `PRJ-{nnn}` | Change initiatives with budget, status, timeline |
| **Vendors** | `VND-{nnn}` | IT vendors/partners with contract details |
| **Demands** | `DEM-{nnn}` | Business requests and initiative proposals |
| **Integrations** | `INT-{nnn}` | Application-to-application interfaces |
| **Processes** | Free-form ID | End-to-end business processes spanning domains |

### Enumerations

| Enum | Values |
|------|--------|
| **Criticality** | Mission-Critical, Business-Critical, Business-Operational, Administrative |
| **TIME Quadrant** | Tolerate, Invest, Migrate, Eliminate |
| **App Type** | SaaS, On-Prem, Custom, PaaS |
| **Capability Maturity** | 1 (Initial) → 5 (Optimized) |
| **Project Status** | green, yellow, red |
| **Risk Probability** | Sehr niedrig, Niedrig, Mittel, Hoch, Sehr hoch |
| **Risk Impact** | Minimal, Gering, Moderat, Erheblich, Kritisch |
| **Lifecycle Status** | Planned, Active, End-of-Support, End-of-Life |
| **AI Risk Category** | Kein AI-Usecase, Minimales Risiko, Begrenztes Risiko, Hohes Risiko, Unannehmbares Risiko |

### Relationships

- **Capability Mappings** link Applications to Capabilities (with role: Primary/Secondary)
- **Project Dependencies** link Projects to other Projects (source → target)
- **Projects** reference Domains (primary + secondary) and affected Applications
- **Demands** reference Domains, Applications, and Vendors
- **Integrations** link source and target Applications
- **Processes** span multiple Domains, derived app relationships via capability mappings

## Components

### Dashboard & Strategy (11)

| Component | File | Route | Description |
|-----------|------|-------|-------------|
| Dashboard | `dashboard.js` | `/` | KPI cards, TIME/status charts, management KPIs |
| Executive Summary | `executive-summary.js` | `/executive-summary` | PDF-exportable management report |
| Roadmap | `roadmap.js` | `/roadmap` | Gantt-style strategy timeline |
| Budget Dashboard | `budget-dashboard.js` | `/budget-dashboard` | Run vs. Change budget, cost breakdowns |
| Risk Heatmap | `risk-heatmap.js` | `/risk-heatmap` | Probability × Impact matrix |
| Data Quality | `data-quality.js` | `/data-quality` | Completeness and consistency checks |
| Resource Overlaps | `resource-overlap.js` | `/resource-overlaps` | Conflict detection, timeline collisions, cross-domain complexity |
| Scenario Planner | `scenario-planner.js` | `/scenario-planner` | What-if analysis for project/app changes |
| Capability Investment | `capability-investment.js` | `/capability-investment` | Budget allocation to capabilities, underfunded analysis |
| Technology Radar | `tech-radar.js` | `/tech-radar` | Adopt/Trial/Assess/Hold technology categorization |
| EA Health Score | `ea-health-score.js` | `/ea-health-score` | Aggregated IT landscape health (0–100) with recommendations |

### Domain & Capability Management (5)

| Component | File | Route | Description |
|-----------|------|-------|-------------|
| Domain List | `domain-list.js` | `/domains` | All business domains |
| Domain Detail | `domain-detail.js` | `/domains/:id` | Domain with capabilities and mappings |
| Domain Form | `domain-form.js` | Modal | Create/edit domain |
| Capability Form | `capability-form.js` | Modal | Create/edit capability |
| Maturity Gap | `maturity-gap.js` | `/maturity-gap` | Current vs. target maturity analysis |

### Application Management (6)

| Component | File | Route | Description |
|-----------|------|-------|-------------|
| App List | `app-list.js` | `/apps` | All applications with filters |
| App Detail | `app-detail.js` | `/apps/:id` | Full application profile |
| App Form | `app-form.js` | Modal | Create/edit application |
| Cap-App Matrix | `cap-app-matrix.js` | `/capability-matrix` | Capability × Application heatmap |
| TIME Quadrant | `time-quadrant.js` | `/time` | Tolerate/Invest/Migrate/Eliminate view |
| Integration Map | `integration-map.js` | `/integration-map` | Application interface diagram |

### Project Management (5)

| Component | File | Route | Description |
|-----------|------|-------|-------------|
| Project List | `project-list.js` | `/projects` | All projects with status |
| Project Detail | `project-detail.js` | `/projects/:id` | Full project profile |
| Project Form | `project-form.js` | Modal | Create/edit project |
| Project Heatmap | `project-heatmap.js` | `/project-heatmap` | Project risk/status overview |
| Dependency Graph | `dependency-graph.js` | `/dependencies` | D3 force-directed project graph |

### Demand & Pipeline (4)

| Component | File | Route | Description |
|-----------|------|-------|-------------|
| Demand List | `demand-list.js` | `/demands` | All demands |
| Demand Detail | `demand-detail.js` | `/demands/:id` | Full demand profile |
| Demand Form | `demand-form.js` | Modal | Create/edit demand |
| Demand Pipeline | `demand-pipeline.js` | `/demand-pipeline` | Kanban-style pipeline view |

### Reference Data (7)

| Component | File | Route | Description |
|-----------|------|-------|-------------|
| Vendor List | `vendor-list.js` | `/vendors` | All vendors |
| Vendor Detail | `vendor-detail.js` | `/vendors/:id` | Vendor profile with linked apps |
| Vendor Form | `vendor-form.js` | Modal | Create/edit vendor |
| Process List | `process-list.js` | `/processes` | End-to-end processes |
| Process Detail | `process-detail.js` | `/processes/:id` | Process with domain/app chain |
| Process Form | `process-form.js` | Modal | Create/edit process |
| AI Use Cases | `ai-usecases-list.js` | `/ai-usecases` | EU AI Act categorized use cases |

### Framework (2)

| Component | File | Description |
|-----------|------|-------------|
| Layout | `layout.js` | App shell with sidebar navigation and header |
| Settings | `settings.js` | Data import/export, reset, metadata editing |

## Getting Started

### Development Mode (multi-file)

1. Serve the app directory with any static HTTP server:
   ```bash
   cd app
   python3 -m http.server 8080
   ```
2. Open `http://localhost:8080` in a browser.

### Production Mode (single-file)

1. Build the single-file HTML:
   ```bash
   python3 build_single.py
   ```
2. Open `bebauungsplan.html` directly in a browser (works with `file://` protocol).

## Build

The build process (`build_single.py`) creates a single self-contained HTML file by:

1. Reading the seed data JSON
2. Stripping ES module `import`/`export` statements from all JS files
3. Converting `export default` to named constants
4. Converting async `loadData()` to a synchronous version using embedded seed data
5. Inlining all component code and the store/router into a single `<script>` block
6. Writing the complete HTML with CDN references for Vue, Tailwind, Chart.js, and D3

```bash
python3 build_single.py
```

Output: `bebauungsplan.html` (~500+ KB, works offline after initial CDN load)

## Testing

Unit tests cover the core logic modules (`store.js` and `router.js`) using [Vitest](https://vitest.dev/).

### Running Tests

```bash
npm install          # first time only
npm test             # run all tests once
npm run test:watch   # run tests in watch mode
```

### Test Structure

```
tests/
├── mocks/
│   └── vue-mock.js       # Minimal Vue API mock (reactive, watch, computed)
├── store.test.js         # Store CRUD operations, getters, relationships (94 tests)
└── router.test.js        # Route matching, navigation, query parsing (33 tests)
```

### What's Tested

- **Store getters**: `totalApps`, `totalProjects`, `avgMaturity`, `totalBudget`, `timeDistribution`, `projectStatusCounts`, `maturityGaps`, etc.
- **Domain CRUD**: `addDomain`, `updateDomain`, `deleteDomain` (with cascading cleanup)
- **Capability CRUD**: `addCapability`, `updateCapability`, `deleteCapability`, `addSubCapability`, `deleteSubCapability`
- **Application CRUD**: `addApp`, `updateApp`, `deleteApp` (with mapping and project cleanup)
- **Project CRUD**: `addProject`, `updateProject`, `deleteProject` (with dependency cleanup)
- **Vendor CRUD**: `addVendor`, `updateVendor`, `deleteVendor`, `appsForVendor`, `vendorForApp`
- **Demand CRUD**: `addDemand`, `updateDemand`, `deleteDemand`, filtering by domain/app/vendor
- **Integration CRUD**: `addIntegration`, `updateIntegration`, `deleteIntegration`, `integrationsForApp`
- **Process CRUD**: `addProcess`, `updateProcess`, `deleteProcess`, relationship derivation
- **Mapping CRUD**: `addMapping`, `removeMapping` (with deduplication)
- **Router**: All 28 route patterns, parameterized routes, query parsing, 404 fallback

## Project Structure

```
├── app/
│   ├── index.html                    # Dev entry point (multi-file mode)
│   ├── data/
│   │   └── bebauungsplan.json        # Seed data with full data model + enums
│   └── js/
│       ├── app.js                    # Vue app init, component registration
│       ├── store.js                  # Reactive state, CRUD, persistence
│       ├── router.js                 # Hash-based SPA router
│       └── components/               # 37 Vue component files
│           ├── layout.js             # App shell (sidebar + header)
│           ├── dashboard.js          # Home / KPI dashboard
│           ├── settings.js           # Import/export/reset
│           ├── domain-list.js        # Domain management
│           ├── app-list.js           # Application management
│           ├── project-list.js       # Project management
│           ├── demand-list.js        # Demand management
│           ├── vendor-list.js        # Vendor management
│           ├── process-list.js       # Process management
│           ├── risk-heatmap.js       # Risk analysis
│           ├── budget-dashboard.js   # Financial overview
│           ├── executive-summary.js  # Management report
│           └── ...                   # (+ 23 more component files)
├── bebauungsplan.html                # Built single-file output
├── build_single.py                   # Python build script
├── package.json                      # Test dependencies (vitest, jsdom)
├── vitest.config.js                  # Test configuration
└── tests/                            # Unit tests
    ├── mocks/vue-mock.js
    ├── store.test.js
    └── router.test.js
```

---

## Feature Roadmap

Priorisierte Erweiterungen für CIO, PMO und Geschäftsleitung – gegliedert nach strategischem Mehrwert.

### 🔴 Hohe Priorität – "CIO-Ready" Features

#### ~~1. Strategie-Roadmap / Gantt-Timeline~~ ✅ Implementiert
#### ~~2. Executive Summary / Management-Report (PDF-Export)~~ ✅ Implementiert

#### ~~3. Budget- & Kosten-Dashboard~~ ✅ Implementiert
Erweiterte Finanzübersicht für CIO/CFO:
- **Run vs. Change-Budget** Aufteilung (Run/Pflicht vs. Innovation/Grow)
- Kosten nach Domäne, Vendor, Applikationstyp
- Plankosten vs. Prognose vs. Ist
- Cost-of-Ownership pro Capability

#### ~~4. Risiko- & Compliance-Ansicht~~ ✅ Implementiert
- **Risiko-Heatmap**: Wahrscheinlichkeit × Auswirkung für Apps und Projekte
- Applikationen ohne Capability-Mapping = "Schatten-IT-Indikator"
- Vendor-Risiko: Auslaufende Verträge, Single-Vendor-Dependencies
- Lifecycle-Status pro Applikation (End-of-Life, End-of-Support)

---

### 🟡 Mittlere Priorität – Steuerungsrelevant für PMO

#### ~~5. Demand-to-Project Pipeline-Ansicht~~ ✅ Implementiert
- Kanban-Board mit Demand-Status als Spalten
- Konvertierung Demand → Projekt (mit Datenübernahme)
- Pipeline-Funnel: Demands → Bewertung → Genehmigt → Projekt
- Durchlaufzeiten-Analyse

#### ~~6. Ressourcen-Überlappungs-Analyse~~ ✅ Implementiert
- Projekte die dieselben Applikationen betreffen (Konflikterkennung)
- Cross-Domain-Projekte: Komplexitäts-Indikator
- Timeline-Kollisionen: Gleichzeitige Änderungen an derselben App

#### ~~7. Capability-basierte Investment-Analyse~~ ✅ Implementiert
- In welche Capabilities fließt wie viel Budget (via Projekte)?
- Capabilities mit hoher Kritikalität aber niedrigem Investment = **unterfinanziert**
- Maturity-Gap × Budget = Investieren wir in die richtigen Dinge?

#### ~~8. Szenario-Planung / What-If-Analyse~~ ✅ Implementiert
- "Was passiert, wenn wir Projekt X streichen?" → Auswirkung auf Maturity-Gaps, App-Landscape
- "Was passiert, wenn wir App Y ablösen?" → Betroffene Capabilities, Projekte, Prozesse
- Speicherbare Szenarien zum Vergleich

---

### 🟢 Nice-to-Have – Professionalisierung

#### ~~9. Technologie-Radar~~ ✅ Implementiert
- Genutzte Technologien/Plattformen aggregiert aus App-Daten
- Adopt / Trial / Assess / Hold Kategorisierung
- Mapping zu strategischen Entscheidungen

#### ~~10. Globale Volltextsuche~~ ✅ Implementiert
- Über alle Entitäten: "Zeig mir alles zu SAP" → Apps, Projekte, Demands, Vendors, Prozesse

#### 11. Change-Log / Audit-Trail
- Wer hat wann was geändert? (Governance)
- Versionierung der Daten (Snapshots pro Quartal)

#### ~~12. Datenqualitäts-Dashboard~~ ✅ Implementiert
- Unvollständige Datensätze (Apps ohne Kosten, ohne Vendor, ohne TIME-Quadrant)
- Capabilities ohne App-Mapping = "weiße Flecken"
- Vendors ohne verknüpfte Apps
- Orphaned Mappings

#### 13. Multi-Stakeholder-Ansichten
- **CIO-View**: Budget, Strategie, Risiken, TOP-10 Projekte
- **PMO-View**: Projekte, Demands, Timeline, Ressourcen
- **GL-View**: Executive Summary mit 5 KPIs und Ampeln
- Konfigurierbare Dashboards pro Rolle

#### ~~14. Integration-Map / Schnittstellen-Diagramm~~ ✅ Implementiert
- Applikations-Kommunikation (Datenflüsse)
- Schnittstellen-Technologie (API, File, DB-Link)
- Ergänzung zum Dependency-Graph (der aktuell nur Projekt-Dependencies zeigt)

#### 15. Strategische Konformitäts-Scorecard
- Pro Domäne: Projekte "Konform" vs. "Widerspricht"
- EA-Prinzipien definieren und Projekte dagegen bewerten
- Gesamtscore für die IT-Landschaft

---

### 🔵 Phase 5+ – Weiterentwicklung & Professionalisierung

#### ~~16. Application Lifecycle Timeline~~ ✅
- ~~Visuelle Timeline pro App: Planned → Active → End-of-Support → End-of-Life~~
- ~~Aggregierte Ansicht: Welche Apps erreichen in den nächsten 12/24 Monaten End-of-Life?~~
- ~~Automatische Warnungen bei Apps im "Tolerate"-Quadranten + nahendem EOL~~

#### ~~17. Vendor Dependency Scorecard~~ ✅
- ~~**Vendor Concentration Risk**: Wie viel % der Mission-Critical Apps laufen bei einem Vendor?~~
- ~~**Contract Renewal Calendar**: Timeline-View aller auslaufenden Verträge~~
- ~~**Vendor Health Score**: Kombination aus Anzahl Apps, Kritikalität, Vertragsrestlaufzeit, Kosten~~

#### ~~18. Total Cost of Ownership (TCO) Rechner~~ ✅
- ~~Pro Applikation: Lizenzkosten + Betriebskosten + Integrationskosten + Projektkosten~~
- ~~TCO pro Capability: Was kostet eine Business-Capability end-to-end?~~
- ~~TCO-Vergleich: Was kostet App X vs. Migration auf App Y?~~

#### 19. Business Process Impact Map
- Interaktive Prozesslandkarte: Welche Prozesse sind von App-Änderung betroffen?
- Kritischer Pfad: Prozesse mit Single-App-Dependencies (kein Fallback)
- Prozesskosten: Aggregierte Kosten aller Apps entlang eines Prozesses

#### 20. Trend-Analyse / Zeitreihen-Dashboard
- KPI-Entwicklung über die Zeit (Quartalsvergleich)
- Maturity-Trend: Wird die IT-Landschaft reifer?
- Budget-Trend: Run vs. Change Ratio Entwicklung
- Setzt Quartalssnapshots voraus (passt zu Feature 11)

#### ~~21. EA Health Score & Automatische Empfehlungen~~ ✅ Implementiert
- Aggregierter "Gesundheitszustand" der IT-Landschaft (Score 0–100)
- Heuristik-basierte Warnungen:
  - Apps mit "Eliminate" + aktiven Projekten = Widerspruch
  - Capabilities auf Maturity 1 ohne Investment = Empfehlung
  - Vendors mit nur einer App + hoher Kritikalität = Klumpenrisiko
- Automatische Handlungsempfehlungen pro Warnung

#### 22. Dark Mode & Accessibility
- Dark Mode Toggle (Tailwind `dark:` Klassen – Grundstruktur bereits vorhanden)
- Barrierefreiheit: ARIA-Labels, Keyboard-Navigation, Screen-Reader-Support
- Responsive Design Verbesserungen für Tablet/Mobile

#### 23. Erweiterte Export-Funktionen
- **PowerPoint-Export**: Fertige Folien für Management-Präsentationen
- **CSV/Excel-Export**: Pro Entity-Typ für Weiterverarbeitung
- **Share-Link**: Daten als Base64-encoded URL zum Teilen (kein Backend nötig)

---

### Empfohlene Umsetzungsreihenfolge

| Phase | Features | Wert |
|-------|----------|------|
| **Phase 1** | ~~Strategie-Roadmap + Executive Summary PDF~~ | ✅ Implementiert |
| **Phase 2** | ~~Budget-Dashboard + Demand→Project Pipeline + AI/EU AI Act~~ | ✅ Implementiert |
| **Phase 3** | ~~Risiko-Heatmap + Datenqualität~~ | ✅ Implementiert |
| **Phase 4** | ~~Szenario-Planung + Ressourcen-Analyse~~ | ✅ Implementiert |
| **Phase 5** | ~~Globale Volltextsuche + Integration-Map~~ | ✅ Implementiert |
| **Phase 6** | ~~Capability-Investment + Technologie-Radar + EA Health Score~~ | ✅ Implementiert |
| **Phase 7** | ~~App Lifecycle Timeline + Vendor Scorecard + TCO Rechner~~ | ✅ Implementiert |
| **Phase 8** | Trend-Analyse + Dark Mode + Erweiterte Exports | Nächste Priorität |

---

### 🟣 Compliance-Umsetzungsphasen – Regulatorik & Governance

Integration regulatorischer Anforderungen (DSGVO, NIS2, Cyber Resilience Act, EU AI Act, ISO 27001/9001 u.a.) in das EA Dashboard, um Compliance-Status pro Applikation, Domäne und Prozess transparent und steuerbar zu machen.

#### Relevante Regulierungen & Standards

| Regulierung / Standard | Scope | Relevanz für EA |
|------------------------|-------|-----------------|
| **DSGVO** (EU 2016/679) | Personenbezogene Daten | Apps mit PII-Verarbeitung identifizieren, DSFA-Pflicht |
| **NIS2** (EU 2022/2555) | Netz- & Informationssicherheit | Kritische Infrastruktur, Incident-Response, Risikomanagement |
| **Cyber Resilience Act** (EU 2024) | Produkte mit digitalen Elementen | Software-Stückliste (SBOM), Schwachstellen-Management |
| **EU AI Act** (EU 2024/1689) | Künstliche Intelligenz | Risikoklassifizierung (bereits als Feld vorhanden), Dokumentationspflicht |
| **DORA** (EU 2022/2554) | Digitale operationale Resilienz | IKT-Risikomanagement, Drittanbieter-Überwachung |
| **eIDAS 2.0** (EU 2024/1183) | Elektronische Identifizierung | Identitäts- und Vertrauensdienste |
| **ISO 27001** | Informationssicherheit (ISMS) | Controls-Mapping auf IT-Systeme |
| **ISO 9001** | Qualitätsmanagement | Prozesskonformität |
| **ISO 42001** | KI-Managementsystem | KI-Governance (Ergänzung zu EU AI Act) |
| **ISO 22301** | Business Continuity | Ausfallsicherheit kritischer Systeme |
| **SOC 2 / BSI C5** | Cloud-Compliance | Vendor-/Cloud-Bewertung |
| **TISAX** | Automotive Informationssicherheit | Branchenspezifisch |
| **PCI DSS** | Zahlungsdatenverarbeitung | Apps mit Payment-Bezug |

#### Phase C1 – Compliance-Grundlagen (3–4 Wochen)

**Ziel:** Regulatorische Anforderungen als eigenständige Entität im Datenmodell verankern und mit bestehenden Entitäten (Apps, Prozesse, Vendors) verknüpfen.

**Datenmodell-Erweiterung:**
- `regulations[]` — Regulierungsstammdaten (Name, Kurzname, Scope, Gültigkeitsbereich, Fristen)
- `complianceRequirements[]` — Einzelanforderungen pro Regulierung (z.B. Art. 32 DSGVO → "Technische und organisatorische Maßnahmen")
- `complianceAssessments[]` — Bewertung pro App×Anforderung (Status: Konform/Teilw./Nicht konform/N.A., Verantwortlicher, Frist, Nachweise)

**Umsetzung:**
- Regulierungsverwaltung (CRUD): `regulation-list.js`, `regulation-detail.js`, `regulation-form.js`
- Compliance-Status-Anzeige in App-Detail und Vendor-Detail
- Erweiterung `store.js` um Compliance-CRUD und Getters
- Erweiterung `router.js` um `/regulations`, `/regulations/:id`
- Seed-Daten für DSGVO, NIS2, ISO 27001 als Beispielregulierungen

**Ergebnis:** Überblick welche Regulierungen für welche Apps/Prozesse gelten, mit Bewertungsstatus.

#### Phase C2 – Tiefe Integration & Gap-Analyse (4–5 Wochen)

**Ziel:** Compliance-Bewertungen systematisieren, Gaps automatisch erkennen, Handlungsempfehlungen generieren.

**Umsetzung:**
- **Compliance-Dashboard** (`compliance-dashboard.js`): Gesamtstatus aller Regulierungen, Ampel-Anzeige, Fortschrittsbalken pro Regulierung
- **Gap-Analyse**: Automatische Erkennung von Apps ohne Bewertung für zutreffende Regulierungen
- **Cross-Referenz**: Welche Applikationen sind von den meisten Regulierungen betroffen? (Regulierungslast-Score)
- **Vendor-Compliance**: Regulierungs-Konformität pro Vendor aggregieren (z.B. SOC 2, BSI C5 Status aller Vendor-Apps)
- **Integration in bestehende Views**:
  - Risk-Heatmap: Compliance-Risiken als zusätzliche Dimension
  - EA Health Score: Compliance-Faktor in Gesamtbewertung
  - Executive Summary: Compliance-Sektion im Management-Report

**Ergebnis:** Proaktive Identifikation von Compliance-Lücken mit priorisierter Handlungsliste.

#### Phase C3 – Reporting, Audit-Trail & Automatisierung (3–5 Wochen)

**Ziel:** Audit-fähige Compliance-Reports erzeugen, Änderungsnachverfolgung, Workflow-Unterstützung.

**Umsetzung:**
- **Compliance-Report-Export** (PDF): Regulierungs-Steckbriefe mit Status aller betroffenen Apps
- **Assessment-Workflow**: Status-Übergänge (Offen → In Prüfung → Bewertet → Review erforderlich) mit Fristmanagement
- **Audit-Trail**: Wer hat wann welche Compliance-Bewertung geändert? (Versionierung pro Assessment)
- **Fristenwarnungen**: Regulierungen mit ablaufenden Übergangsfristen hervorheben
- **Automatische Zuordnung**: Neue Apps erhalten automatisch zutreffende Regulierungen basierend auf Typ, Kritikalität und Datenklassifizierung
- **Compliance-Scorecard pro Domäne**: Aggregierter Konformitätsgrad je Geschäftsdomäne

**Ergebnis:** Vollständig audit-fähiges Compliance-Management mit Reporting und Nachvollziehbarkeit.

#### Empfohlene Compliance-Reihenfolge

| Phase | Inhalt | Aufwand | Voraussetzung |
|-------|--------|---------|---------------|
| **C1** | Regulierungsverwaltung, Datenmodell, CRUD, Basis-UI | 3–4 Wochen | — |
| **C2** | Dashboard, Gap-Analyse, Cross-Referenz, View-Integration | 4–5 Wochen | C1 |
| **C3** | Reporting, Audit-Trail, Workflows, Automatisierung | 3–5 Wochen | C2 |
| **Gesamt** | **Vollständiges Compliance-Modul** | **10–14 Wochen** | — |

---

## Server-Architektur Konzept

Für die Migration der statischen Single-File-Applikation zu einer containerisierten Client-Server-Architektur mit Multi-User-Support wurde ein umfassendes Konzept erstellt. Dieses deckt ab:

- **Backend**: Python / FastAPI mit SQLAlchemy ORM
- **Datenbank**: SQLite (Dev) / PostgreSQL (Prod)
- **Authentifizierung**: JWT-basiert mit Rollenmodell (Admin, Editor, Viewer)
- **REST API**: Vollständige CRUD-Endpunkte für alle Entitäten
- **Containerisierung**: Docker + Docker Compose
- **Multi-User**: Optimistic Locking für gleichzeitige Bearbeitung

📄 **Vollständiges Konzept: [docs/CONCEPT-SERVER.md](docs/CONCEPT-SERVER.md)**
