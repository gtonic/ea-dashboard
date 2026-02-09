# vibe-app
Vibe Coded APM as Static HTML App

---

## Verbesserungsvorschläge & Feature-Roadmap

Priorisierte Erweiterungen für CIO, PMO und Geschäftsleitung – gegliedert nach strategischem Mehrwert.

### 🔴 Hohe Priorität – "CIO-Ready" Features

#### ~~1. Strategie-Roadmap / Gantt-Timeline~~ ✅ Implementiert
#### ~~2. Executive Summary / Management-Report (PDF-Export)~~ ✅ Implementiert

#### 3. Budget- & Kosten-Dashboard
Erweiterte Finanzübersicht für CIO/CFO:
- **Run vs. Change-Budget** Aufteilung (Run/Pflicht vs. Innovation/Grow)
- Kosten nach Domäne, Vendor, Applikationstyp
- Plankosten vs. Prognose vs. Ist
- Cost-of-Ownership pro Capability

#### 4. Risiko- & Compliance-Ansicht
- **Risiko-Heatmap**: Wahrscheinlichkeit × Auswirkung für Apps und Projekte
- Applikationen ohne Capability-Mapping = "Schatten-IT-Indikator"
- Vendor-Risiko: Auslaufende Verträge, Single-Vendor-Dependencies
- Lifecycle-Status pro Applikation (End-of-Life, End-of-Support)

---

### 🟡 Mittlere Priorität – Steuerungsrelevant für PMO

#### 5. Demand-to-Project Pipeline-Ansicht
- Kanban-Board mit Demand-Status als Spalten
- Konvertierung Demand → Projekt (mit Datenübernahme)
- Pipeline-Funnel: Demands → Bewertung → Genehmigt → Projekt
- Durchlaufzeiten-Analyse

#### 6. Ressourcen-Überlappungs-Analyse
- Projekte die dieselben Applikationen betreffen (Konflikterkennung)
- Cross-Domain-Projekte: Komplexitäts-Indikator
- Timeline-Kollisionen: Gleichzeitige Änderungen an derselben App

#### 7. Capability-basierte Investment-Analyse
- In welche Capabilities fließt wie viel Budget (via Projekte)?
- Capabilities mit hoher Kritikalität aber niedrigem Investment = **unterfinanziert**
- Maturity-Gap × Budget = Investieren wir in die richtigen Dinge?

#### 8. Szenario-Planung / What-If-Analyse
- "Was passiert, wenn wir Projekt X streichen?" → Auswirkung auf Maturity-Gaps, App-Landscape
- "Was passiert, wenn wir App Y ablösen?" → Betroffene Capabilities, Projekte, Prozesse
- Speicherbare Szenarien zum Vergleich

---

### 🟢 Nice-to-Have – Professionalisierung

#### 9. Technologie-Radar
- Genutzte Technologien/Plattformen aggregiert aus App-Daten
- Adopt / Trial / Assess / Hold Kategorisierung
- Mapping zu strategischen Entscheidungen

#### 10. Globale Volltextsuche
- Über alle Entitäten: "Zeig mir alles zu SAP" → Apps, Projekte, Demands, Vendors, Prozesse

#### 11. Change-Log / Audit-Trail
- Wer hat wann was geändert? (Governance)
- Versionierung der Daten (Snapshots pro Quartal)

#### 12. Datenqualitäts-Dashboard
- Unvollständige Datensätze (Apps ohne Kosten, ohne Vendor, ohne TIME-Quadrant)
- Capabilities ohne App-Mapping = "weiße Flecken"
- Vendors ohne verknüpfte Apps
- Orphaned Mappings

#### 13. Multi-Stakeholder-Ansichten
- **CIO-View**: Budget, Strategie, Risiken, TOP-10 Projekte
- **PMO-View**: Projekte, Demands, Timeline, Ressourcen
- **GL-View**: Executive Summary mit 5 KPIs und Ampeln
- Konfigurierbare Dashboards pro Rolle

#### 14. Integration-Map / Schnittstellen-Diagramm
- Applikations-Kommunikation (Datenflüsse)
- Schnittstellen-Technologie (API, File, DB-Link)
- Ergänzung zum Dependency-Graph (der aktuell nur Projekt-Dependencies zeigt)

#### 15. Strategische Konformitäts-Scorecard
- Pro Domäne: Projekte "Konform" vs. "Widerspricht"
- EA-Prinzipien definieren und Projekte dagegen bewerten
- Gesamtscore für die IT-Landschaft

---

### Empfohlene Umsetzungsreihenfolge

| Phase | Features | Wert |
|-------|----------|------|
| **Phase 1** | ~~Strategie-Roadmap + Executive Summary PDF~~ | ✅ Implementiert |
| **Phase 2** | Budget-Dashboard + Demand→Project Pipeline | PMO bekommt Steuerungsinstrument |
| **Phase 3** | Risiko-Heatmap + Datenqualität | Governance & Compliance |
| **Phase 4** | Szenario-Planung + Ressourcen-Analyse | Strategische Planung next level |
