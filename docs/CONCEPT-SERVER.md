# Konzept: Containerisierte Server-Applikation

> **EA Dashboard — Migration von statischer Single-File-Applikation zu einer containerisierten Client-Server-Architektur mit Multi-User-Support**

---

## Inhaltsverzeichnis

- [1. Ausgangslage](#1-ausgangslage)
- [2. Zielarchitektur](#2-zielarchitektur)
- [3. Technologie-Stack](#3-technologie-stack)
- [4. Backend-Architektur](#4-backend-architektur)
- [5. REST API Design](#5-rest-api-design)
- [6. Datenbankschema](#6-datenbankschema)
- [7. Authentifizierung & Autorisierung](#7-authentifizierung--autorisierung)
- [8. Admin-Bereich](#8-admin-bereich)
- [9. Multi-User & Concurrency](#9-multi-user--concurrency)
- [10. Frontend-Anpassungen](#10-frontend-anpassungen)
- [11. Containerisierung](#11-containerisierung)
- [12. Umsetzungsplan](#12-umsetzungsplan)

---

## 1. Ausgangslage

### Aktuelle Architektur

```
┌──────────────────────────────────────────────────┐
│  Browser (Single-File HTML)                       │
│  ┌────────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Vue 3 SPA  │ │ Store.js │ │ localStorage   │  │
│  │ 49 Komp.   │ │ (State)  │ │ (Persistenz)   │  │
│  └────────────┘ └──────────┘ └────────────────┘  │
│  CDN: Tailwind CSS, Chart.js, D3.js               │
└──────────────────────────────────────────────────┘
```

**Einschränkungen der aktuellen Lösung:**
- Daten nur lokal im Browser (`localStorage`) — kein Zugriff von anderen Geräten
- Kein Multi-User-Support — keine gleichzeitige Zusammenarbeit
- Keine Authentifizierung — jeder mit Dateizugriff kann Daten sehen/ändern
- Keine zentrale Datenhaltung — Datenverlust bei Browser-Reset
- Kein Audit-Trail auf Benutzerebene

### Bestehende Assets (wiederverwendbar)

| Asset | Beschreibung | Wiederverwendung |
|-------|-------------|------------------|
| **49 Vue 3 Komponenten** | Dashboard, CRUD, Analyse-Views | 100% — Frontend bleibt Vue 3 |
| **store.js** | Reaktiver State, CRUD-Methoden, Computed Getters | Refactoring zu API-Client |
| **router.js** | Hash-basiertes SPA-Routing | 100% unverändert |
| **Datenmodell** | `bebauungsplan.json` mit 12+ Entitätstypen | 1:1 Übernahme als DB-Schema |
| **i18n** | Deutsch/Englisch Lokalisierung | 100% unverändert |
| **build_single.py** | Single-File Build | Ersetzt durch Container-Build |

---

## 2. Zielarchitektur

```
┌────────────────────────────────────────────────────────────────────┐
│  Docker Compose                                                     │
│                                                                     │
│  ┌─────────────────────┐     ┌──────────────────────────────────┐  │
│  │  Frontend Container  │     │  Backend Container               │  │
│  │  (Nginx)             │────▶│  (Python / FastAPI)              │  │
│  │                      │REST │                                  │  │
│  │  Vue 3 SPA           │◀────│  ┌─────────┐  ┌──────────────┐  │  │
│  │  Tailwind CSS        │     │  │ REST API │  │ Auth (JWT)   │  │  │
│  │  Chart.js / D3.js    │     │  └─────────┘  └──────────────┘  │  │
│  └─────────────────────┘     │  ┌─────────┐  ┌──────────────┐  │  │
│                               │  │ ORM     │  │ Middleware   │  │  │
│                               │  │(SQLAlch)│  │ (CORS,Auth)  │  │  │
│                               │  └────┬────┘  └──────────────┘  │  │
│                               └───────┼──────────────────────────┘  │
│                                       │                             │
│                               ┌───────▼──────────────────────────┐  │
│                               │  Datenbank                       │  │
│                               │  SQLite (Dev) / PostgreSQL (Prod)│  │
│                               └──────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### Entwurfsprinzipien

1. **Inkrementelle Migration** — Bestehende Vue-Komponenten bleiben erhalten, nur die Datenschicht wird ersetzt
2. **API-First** — Sämtliche Datenoperationen laufen über REST-Endpunkte
3. **Dual-Database** — SQLite für Entwicklung/einfache Deployments, PostgreSQL für Produktion
4. **Stateless Backend** — JWT-Token für Session-Management, keine Server-seitige Session
5. **Container-Ready** — Jeder Service läuft in eigenem Container

---

## 3. Technologie-Stack

### Backend

| Komponente | Technologie | Begründung |
|-----------|-------------|------------|
| **Sprache** | Python 3.12+ | Bestehende Python-Kenntnisse (build_single.py, server.py); großes Ökosystem |
| **Framework** | [FastAPI](https://fastapi.tiangolo.com/) | Async-Support, automatische OpenAPI-Docs, Pydantic-Validation, hohe Performance |
| **ORM** | [SQLAlchemy 2.0](https://www.sqlalchemy.org/) | Standard-ORM, unterstützt SQLite + PostgreSQL gleichermaßen |
| **Migration** | [Alembic](https://alembic.sqlalchemy.org/) | Datenbank-Migrationen, versioniert, reproduzierbar |
| **Auth** | [python-jose](https://github.com/mpdavis/python-jose) + [passlib](https://passlib.readthedocs.io/) | JWT-Token-Erzeugung und Passwort-Hashing (bcrypt) |
| **Validation** | [Pydantic v2](https://docs.pydantic.dev/) | Request/Response-Schemas, automatische Serialisierung |
| **Testing** | [pytest](https://pytest.org/) + [httpx](https://www.python-httpx.org/) | API-Tests mit async-Support |

### Frontend

| Komponente | Technologie | Änderung |
|-----------|-------------|----------|
| **Framework** | Vue 3 (ESM) | Unverändert |
| **HTTP Client** | `fetch` API (nativ) | Neu — ersetzt direkten Store-Zugriff |
| **Styling** | Tailwind CSS | Unverändert |
| **Charts** | Chart.js 4 / D3.js 7 | Unverändert |
| **State** | Refactored `store.js` | Daten via API statt localStorage |

### Infrastruktur

| Komponente | Technologie | Zweck |
|-----------|-------------|-------|
| **Containerisierung** | Docker + Docker Compose | Service-Orchestrierung |
| **Frontend-Server** | Nginx (Alpine) | Static-File-Serving + Reverse-Proxy |
| **Datenbank (Dev)** | SQLite 3 | Einfaches Setup, dateibasiert |
| **Datenbank (Prod)** | PostgreSQL 16 | Skalierbar, robust, Multi-User |
| **Reverse Proxy** | Nginx | Leitet `/api/*` an Backend weiter |

---

## 4. Backend-Architektur

### Projektstruktur

```
backend/
├── alembic/                    # DB-Migrationsskripte
│   ├── versions/
│   └── env.py
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI App-Instanz, Middleware, Startup
│   ├── config.py               # Umgebungsvariablen, DB-URL, JWT-Secret
│   ├── database.py             # SQLAlchemy Engine + Session
│   ├── models/                 # SQLAlchemy ORM-Modelle
│   │   ├── __init__.py
│   │   ├── user.py             # User, Role
│   │   ├── domain.py           # Domain, Capability, SubCapability
│   │   ├── application.py      # Application, CapabilityMapping
│   │   ├── project.py          # Project, ProjectDependency
│   │   ├── vendor.py           # Vendor
│   │   ├── demand.py           # Demand
│   │   ├── integration.py      # Integration
│   │   ├── process.py          # E2EProcess
│   │   ├── entity.py           # LegalEntity
│   │   └── compliance.py       # ComplianceAssessment
│   ├── schemas/                # Pydantic Request/Response-Schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── domain.py
│   │   ├── application.py
│   │   ├── project.py
│   │   ├── vendor.py
│   │   ├── demand.py
│   │   ├── integration.py
│   │   ├── process.py
│   │   ├── entity.py
│   │   └── compliance.py
│   ├── routers/                # API-Router (Endpunkte)
│   │   ├── __init__.py
│   │   ├── auth.py             # Login, Register, Token-Refresh
│   │   ├── users.py            # User-CRUD (Admin)
│   │   ├── domains.py          # Domain/Capability CRUD
│   │   ├── applications.py     # Application CRUD
│   │   ├── projects.py         # Project CRUD
│   │   ├── vendors.py          # Vendor CRUD
│   │   ├── demands.py          # Demand CRUD
│   │   ├── integrations.py     # Integration CRUD
│   │   ├── processes.py        # Process CRUD
│   │   ├── entities.py         # LegalEntity CRUD
│   │   ├── compliance.py       # ComplianceAssessment CRUD
│   │   ├── admin.py            # Admin-Endpunkte
│   │   └── export.py           # Import/Export (JSON, CSV)
│   ├── services/               # Business-Logik
│   │   ├── __init__.py
│   │   ├── auth_service.py     # Passwort-Hashing, JWT-Erzeugung
│   │   ├── seed_service.py     # Initial-Daten aus bebauungsplan.json
│   │   └── export_service.py   # Datenexport-Logik
│   └── middleware/
│       ├── __init__.py
│       └── auth.py             # JWT-Validation, Role-Check
├── tests/
│   ├── conftest.py             # Fixtures (Test-DB, Test-Client)
│   ├── test_auth.py
│   ├── test_applications.py
│   ├── test_domains.py
│   └── ...
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── .env.example
```

### Konfiguration (Umgebungsvariablen)

```env
# .env.example
DATABASE_URL=sqlite:///./data/ea-dashboard.db     # Dev
# DATABASE_URL=postgresql://user:pass@db:5432/ea   # Prod

JWT_SECRET_KEY=<zufälliger-schlüssel-32-zeichen>
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<initiales-admin-passwort>

CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

---

## 5. REST API Design

### Authentifizierung

| Methode | Endpunkt | Beschreibung | Auth |
|---------|---------|-------------|------|
| `POST` | `/api/auth/login` | Login → JWT Access + Refresh Token | Nein |
| `POST` | `/api/auth/refresh` | Refresh Access Token | Refresh-Token |
| `POST` | `/api/auth/logout` | Token invalidieren | JWT |
| `GET` | `/api/auth/me` | Aktueller Benutzer | JWT |
| `PUT` | `/api/auth/me` | Profil aktualisieren (Name, Passwort) | JWT |

### Domänen & Capabilities

| Methode | Endpunkt | Beschreibung | Auth |
|---------|---------|-------------|------|
| `GET` | `/api/domains` | Alle Domänen (inkl. Capabilities) | JWT |
| `GET` | `/api/domains/{id}` | Einzelne Domäne | JWT |
| `POST` | `/api/domains` | Domäne anlegen | JWT (Editor+) |
| `PUT` | `/api/domains/{id}` | Domäne aktualisieren | JWT (Editor+) |
| `DELETE` | `/api/domains/{id}` | Domäne löschen (kaskadierend) | JWT (Admin) |
| `POST` | `/api/domains/{id}/capabilities` | Capability anlegen | JWT (Editor+) |
| `PUT` | `/api/domains/{id}/capabilities/{capId}` | Capability aktualisieren | JWT (Editor+) |
| `DELETE` | `/api/domains/{id}/capabilities/{capId}` | Capability löschen | JWT (Admin) |

### Applikationen

| Methode | Endpunkt | Beschreibung | Auth |
|---------|---------|-------------|------|
| `GET` | `/api/applications` | Alle Applikationen | JWT |
| `GET` | `/api/applications/{id}` | Einzelne Applikation | JWT |
| `POST` | `/api/applications` | Applikation anlegen | JWT (Editor+) |
| `PUT` | `/api/applications/{id}` | Applikation aktualisieren | JWT (Editor+) |
| `DELETE` | `/api/applications/{id}` | Applikation löschen | JWT (Admin) |
| `GET` | `/api/applications/{id}/mappings` | Capability-Mappings | JWT |
| `GET` | `/api/applications/{id}/integrations` | Integrationen | JWT |
| `GET` | `/api/applications/{id}/compliance` | Compliance-Status | JWT |

### Projekte

| Methode | Endpunkt | Beschreibung | Auth |
|---------|---------|-------------|------|
| `GET` | `/api/projects` | Alle Projekte | JWT |
| `GET` | `/api/projects/{id}` | Einzelnes Projekt | JWT |
| `POST` | `/api/projects` | Projekt anlegen | JWT (Editor+) |
| `PUT` | `/api/projects/{id}` | Projekt aktualisieren | JWT (Editor+) |
| `DELETE` | `/api/projects/{id}` | Projekt löschen | JWT (Admin) |

### Vendors

| Methode | Endpunkt | Beschreibung | Auth |
|---------|---------|-------------|------|
| `GET` | `/api/vendors` | Alle Vendors | JWT |
| `GET` | `/api/vendors/{id}` | Einzelner Vendor | JWT |
| `POST` | `/api/vendors` | Vendor anlegen | JWT (Editor+) |
| `PUT` | `/api/vendors/{id}` | Vendor aktualisieren | JWT (Editor+) |
| `DELETE` | `/api/vendors/{id}` | Vendor löschen | JWT (Admin) |

### Demands

| Methode | Endpunkt | Beschreibung | Auth |
|---------|---------|-------------|------|
| `GET` | `/api/demands` | Alle Demands | JWT |
| `GET` | `/api/demands/{id}` | Einzelner Demand | JWT |
| `POST` | `/api/demands` | Demand anlegen | JWT (Editor+) |
| `PUT` | `/api/demands/{id}` | Demand aktualisieren | JWT (Editor+) |
| `DELETE` | `/api/demands/{id}` | Demand löschen | JWT (Admin) |

### Integrationen

| Methode | Endpunkt | Beschreibung | Auth |
|---------|---------|-------------|------|
| `GET` | `/api/integrations` | Alle Integrationen | JWT |
| `GET` | `/api/integrations/{id}` | Einzelne Integration | JWT |
| `POST` | `/api/integrations` | Integration anlegen | JWT (Editor+) |
| `PUT` | `/api/integrations/{id}` | Integration aktualisieren | JWT (Editor+) |
| `DELETE` | `/api/integrations/{id}` | Integration löschen | JWT (Admin) |

### Prozesse

| Methode | Endpunkt | Beschreibung | Auth |
|---------|---------|-------------|------|
| `GET` | `/api/processes` | Alle E2E-Prozesse | JWT |
| `GET` | `/api/processes/{id}` | Einzelner Prozess | JWT |
| `POST` | `/api/processes` | Prozess anlegen | JWT (Editor+) |
| `PUT` | `/api/processes/{id}` | Prozess aktualisieren | JWT (Editor+) |
| `DELETE` | `/api/processes/{id}` | Prozess löschen | JWT (Admin) |

### Legal Entities

| Methode | Endpunkt | Beschreibung | Auth |
|---------|---------|-------------|------|
| `GET` | `/api/entities` | Alle Legal Entities | JWT |
| `GET` | `/api/entities/{id}` | Einzelne Entity | JWT |
| `POST` | `/api/entities` | Entity anlegen | JWT (Editor+) |
| `PUT` | `/api/entities/{id}` | Entity aktualisieren | JWT (Editor+) |
| `DELETE` | `/api/entities/{id}` | Entity löschen | JWT (Admin) |

### Compliance

| Methode | Endpunkt | Beschreibung | Auth |
|---------|---------|-------------|------|
| `GET` | `/api/compliance/assessments` | Alle Assessments | JWT |
| `GET` | `/api/compliance/assessments/{id}` | Einzelnes Assessment | JWT |
| `POST` | `/api/compliance/assessments` | Assessment anlegen | JWT (Editor+) |
| `PUT` | `/api/compliance/assessments/{id}` | Assessment aktualisieren | JWT (Editor+) |
| `DELETE` | `/api/compliance/assessments/{id}` | Assessment löschen | JWT (Admin) |
| `GET` | `/api/compliance/scorecard` | Compliance-Gesamtübersicht | JWT |

### Capability-Mappings

| Methode | Endpunkt | Beschreibung | Auth |
|---------|---------|-------------|------|
| `GET` | `/api/capability-mappings` | Alle Mappings | JWT |
| `POST` | `/api/capability-mappings` | Mapping anlegen | JWT (Editor+) |
| `DELETE` | `/api/capability-mappings/{id}` | Mapping löschen | JWT (Editor+) |

### Admin

| Methode | Endpunkt | Beschreibung | Auth |
|---------|---------|-------------|------|
| `GET` | `/api/admin/users` | Alle Benutzer auflisten | JWT (Admin) |
| `POST` | `/api/admin/users` | Benutzer anlegen | JWT (Admin) |
| `PUT` | `/api/admin/users/{id}` | Benutzer aktualisieren | JWT (Admin) |
| `DELETE` | `/api/admin/users/{id}` | Benutzer löschen | JWT (Admin) |
| `GET` | `/api/admin/audit-log` | Audit-Log anzeigen | JWT (Admin) |
| `POST` | `/api/admin/seed` | Initialdaten laden | JWT (Admin) |
| `GET` | `/api/admin/system-info` | Systemstatus | JWT (Admin) |

### Datenexport/-import

| Methode | Endpunkt | Beschreibung | Auth |
|---------|---------|-------------|------|
| `GET` | `/api/export/json` | Vollständiger Datenexport als JSON | JWT |
| `POST` | `/api/import/json` | Datenimport aus JSON | JWT (Admin) |
| `GET` | `/api/export/csv/{entity}` | CSV-Export pro Entitätstyp | JWT |

### Aggregierte Dashboard-Endpunkte

| Methode | Endpunkt | Beschreibung | Auth |
|---------|---------|-------------|------|
| `GET` | `/api/dashboard/summary` | Kennzahlen-Übersicht (totalApps, avgMaturity, etc.) | JWT |
| `GET` | `/api/dashboard/time-distribution` | TIME-Quadranten-Verteilung | JWT |
| `GET` | `/api/dashboard/budget-overview` | Budget-Zusammenfassung | JWT |
| `GET` | `/api/dashboard/risk-heatmap` | Risiko-Heatmap-Daten | JWT |
| `GET` | `/api/dashboard/health-score` | EA Health Score | JWT |

---

## 6. Datenbankschema

### ER-Diagramm (vereinfacht)

```
┌──────────┐     ┌─────────────┐     ┌──────────────┐
│  users   │     │  domains    │     │ capabilities │
├──────────┤     ├─────────────┤     ├──────────────┤
│ id (PK)  │     │ id (PK)     │────▶│ id (PK)      │
│ email    │     │ name        │     │ domain_id(FK)│
│ name     │     │ description │     │ name         │
│ password │     │ icon        │     │ maturity     │
│ role     │     │ color       │     │ criticality  │
│ active   │     └─────────────┘     └──────┬───────┘
└──────────┘                                │
                                    ┌───────▼────────┐
                                    │sub_capabilities │
                                    ├────────────────┤
                                    │ id (PK)        │
                                    │ capability_id  │
                                    │ name           │
                                    │ maturity       │
                                    └────────────────┘

┌────────────────┐     ┌──────────────────┐
│ applications   │     │capability_mappings│
├────────────────┤     ├──────────────────┤
│ id (PK)        │◀───▶│ app_id (FK)      │
│ name           │     │ capability_id(FK)│
│ vendor         │     │ role             │
│ type           │     └──────────────────┘
│ criticality    │
│ time_quadrant  │     ┌──────────────────┐
│ annual_cost    │     │  integrations    │
│ ...            │◀───▶├──────────────────┤
└────────────────┘     │ source_app_id    │
                       │ target_app_id    │
                       │ technology       │
                       └──────────────────┘
```

### Tabellenübersicht

#### `users` — Benutzerverwaltung (NEU)

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | UUID / SERIAL | Primärschlüssel |
| `email` | VARCHAR(255) UNIQUE | Login-Email |
| `name` | VARCHAR(255) | Anzeigename |
| `password_hash` | VARCHAR(255) | bcrypt-Hash |
| `role` | ENUM('admin','editor','viewer') | Benutzerrolle |
| `is_active` | BOOLEAN | Aktiv/deaktiviert |
| `created_at` | TIMESTAMP | Erstellungszeitpunkt |
| `last_login` | TIMESTAMP | Letzter Login |

#### `audit_log` — Änderungsprotokoll (NEU)

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | UUID / SERIAL | Primärschlüssel |
| `user_id` | FK → users | Wer hat die Änderung gemacht |
| `action` | VARCHAR(50) | CREATE, UPDATE, DELETE |
| `entity_type` | VARCHAR(50) | applications, domains, etc. |
| `entity_id` | VARCHAR(50) | ID der geänderten Entität |
| `changes` | JSON/JSONB | Vorher/Nachher-Diff |
| `timestamp` | TIMESTAMP | Zeitstempel |

#### `domains` — Geschäftsdomänen

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | INTEGER PK | Domänen-ID (1, 2, 3, ...) |
| `name` | VARCHAR(255) | Name der Domäne |
| `description` | TEXT | Beschreibung |
| `icon` | VARCHAR(10) | Emoji-Icon |
| `color` | VARCHAR(7) | Hex-Farbcode |

#### `capabilities` — Business Capabilities

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | VARCHAR(20) PK | z.B. "1.3" |
| `domain_id` | FK → domains | Zugehörige Domäne |
| `name` | VARCHAR(255) | Capability-Name |
| `maturity` | INTEGER (1–5) | Reifegradlevel |
| `criticality` | VARCHAR(20) | High/Medium/Low |

#### `sub_capabilities`

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | VARCHAR(20) PK | z.B. "1.3.2" |
| `capability_id` | FK → capabilities | Zugehörige Capability |
| `name` | VARCHAR(255) | Name |
| `maturity` | INTEGER (1–5) | Reifegrad |

#### `applications` — Applikationen

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | VARCHAR(20) PK | z.B. "APP-001" |
| `name` | VARCHAR(255) | Applikationsname |
| `description` | TEXT | Beschreibung |
| `type` | VARCHAR(20) | SaaS/On-Prem/Custom/PaaS |
| `criticality` | VARCHAR(30) | Mission-Critical, etc. |
| `time_quadrant` | VARCHAR(20) | Tolerate/Invest/Migrate/Eliminate |
| `vendor` | VARCHAR(255) | Hersteller (Legacy) |
| `annual_cost` | DECIMAL | Jährliche Kosten |
| `user_count` | INTEGER | Anzahl Nutzer |
| `owner` | VARCHAR(255) | Verantwortlicher |
| `go_live_date` | DATE | Go-Live-Datum |
| `end_of_support_date` | DATE | End-of-Support |
| `end_of_life_date` | DATE | End-of-Life |
| `license_cost` | DECIMAL | Lizenzkosten |
| `operations_cost` | DECIMAL | Betriebskosten |
| `integration_cost` | DECIMAL | Integrationskosten |
| `personnel_cost` | DECIMAL | Personalkosten |
| `technology` | JSON | Technologie-Stack (Array) |
| `data_classification` | VARCHAR(30) | Datenklassifizierung |
| `entities` | JSON | Zugeordnete Legal Entities (Array) |
| `vendors` | JSON | Multi-Vendor-Zuordnungen (Array) |

#### `capability_mappings` — App→Capability-Zuordnungen

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | SERIAL PK | Automatische ID |
| `app_id` | FK → applications | Applikation |
| `capability_id` | FK → capabilities | Capability |
| `role` | VARCHAR(20) | Primary/Secondary |

#### `projects` — Projekte

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | VARCHAR(20) PK | z.B. "PRJ-001" |
| `name` | VARCHAR(255) | Projektname |
| `description` | TEXT | Beschreibung |
| `category` | VARCHAR(50) | Run/Modernisierung/Innovation/... |
| `status` | VARCHAR(10) | green/yellow/red |
| `budget` | DECIMAL | Budget in EUR |
| `progress` | INTEGER (0–100) | Fortschritt % |
| `start_date` | DATE | Startdatum |
| `end_date` | DATE | Enddatum |
| `owner` | VARCHAR(255) | Verantwortlicher |
| `affected_apps` | JSON | Betroffene Apps (Array) |
| `conformity` | VARCHAR(20) | Konform/Teilkonform/Widerspricht |
| `domain_ids` | JSON | Zugeordnete Domänen |

#### `project_dependencies`

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | SERIAL PK | Automatische ID |
| `from_project_id` | FK → projects | Quell-Projekt |
| `to_project_id` | FK → projects | Ziel-Projekt |
| `type` | VARCHAR(5) | T/D/P/R/F/Z |
| `description` | TEXT | Beschreibung |

#### `vendors` — Lieferanten

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | VARCHAR(20) PK | z.B. "VND-001" |
| `name` | VARCHAR(255) | Vendor-Name |
| `type` | VARCHAR(50) | MSP/Hyperscaler/SaaS/License/... |
| `contract_end` | DATE | Vertragsende |
| `annual_cost` | DECIMAL | Jahreskosten |
| `health_score` | INTEGER (1–5) | Vendor Health Score |
| `notes` | TEXT | Notizen |
| `strategic_partner` | BOOLEAN | Strategischer Partner? |

#### `demands` — Anforderungen

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | VARCHAR(20) PK | z.B. "DEM-001" |
| `title` | VARCHAR(255) | Titel |
| `description` | TEXT | Beschreibung |
| `requester` | VARCHAR(255) | Anforderer |
| `priority` | VARCHAR(20) | Hoch/Mittel/Niedrig |
| `status` | VARCHAR(30) | Pipeline-Status |
| `domain_id` | FK → domains | Zugeordnete Domäne |
| `estimated_effort` | VARCHAR(50) | Geschätzter Aufwand |
| `business_value` | INTEGER (1–5) | Geschäftswert |
| `target_date` | DATE | Zieldatum |

#### `integrations` — Schnittstellen

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | VARCHAR(20) PK | z.B. "INT-001" |
| `source_app_id` | FK → applications | Quell-Applikation |
| `target_app_id` | FK → applications | Ziel-Applikation |
| `technology` | VARCHAR(30) | API/File/DB-Link/Event/ETL/Manual |
| `description` | TEXT | Beschreibung |
| `data_objects` | TEXT | Datenobjekte |
| `frequency` | VARCHAR(50) | Häufigkeit |

#### `e2e_processes` — End-to-End-Prozesse

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | VARCHAR(20) PK | z.B. "PRC-001" |
| `name` | VARCHAR(255) | Prozessname |
| `description` | TEXT | Beschreibung |
| `owner` | VARCHAR(255) | Prozessverantwortlicher |
| `steps` | JSON | Prozessschritte (Array) |
| `domain_ids` | JSON | Beteiligte Domänen |

#### `legal_entities` — Rechtliche Einheiten

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | VARCHAR(20) PK | z.B. "ENT-001" |
| `name` | VARCHAR(255) | Firmenname |
| `type` | VARCHAR(50) | GmbH/AG/... |
| `country` | VARCHAR(5) | Ländercode |
| `parent_id` | FK → legal_entities | Muttergesellschaft |
| `employees` | INTEGER | Mitarbeiterzahl |

#### `compliance_assessments` — Compliance-Bewertungen

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | SERIAL PK | Automatische ID |
| `app_id` | FK → applications | Betroffene Applikation |
| `regulation` | VARCHAR(30) | Regulierung (GDPR, NIS2, ...) |
| `status` | VARCHAR(30) | Konform/Teilkonform/Nicht konform/N.A. |
| `responsible` | VARCHAR(255) | Verantwortlicher |
| `deadline` | DATE | Frist |
| `notes` | TEXT | Bemerkungen |
| `workflow_status` | VARCHAR(30) | Draft/InReview/Approved |
| `audit_trail` | JSON | Änderungsverlauf |

---

## 7. Authentifizierung & Autorisierung

### Rollenmodell

| Rolle | Rechte | Beschreibung |
|-------|--------|-------------|
| **Admin** | Vollzugriff | Benutzerverwaltung, Datenimport/-export, Löschrechte, System-Konfiguration |
| **Editor** | Lesen + Schreiben | Entitäten anlegen und bearbeiten, keine Löschrechte für kritische Daten |
| **Viewer** | Nur Lesen | Dashboards, Reports, Exports ansehen — keine Datenänderung |

### JWT-basierter Auth-Flow

```
┌──────────┐                     ┌──────────────┐
│  Browser  │                     │   Backend    │
└─────┬────┘                     └──────┬───────┘
      │                                  │
      │  POST /api/auth/login            │
      │  {email, password}               │
      │─────────────────────────────────▶│
      │                                  │ ✓ Passwort prüfen (bcrypt)
      │  {access_token, refresh_token}   │ ✓ JWT erzeugen
      │◀─────────────────────────────────│
      │                                  │
      │  GET /api/applications           │
      │  Authorization: Bearer <token>   │
      │─────────────────────────────────▶│
      │                                  │ ✓ JWT validieren
      │  [applications...]               │ ✓ Rolle prüfen
      │◀─────────────────────────────────│
      │                                  │
      │  POST /api/auth/refresh          │
      │  {refresh_token}                 │  (wenn Access Token abläuft)
      │─────────────────────────────────▶│
      │  {access_token}                  │
      │◀─────────────────────────────────│
```

### Token-Details

| Token | Lebensdauer | Inhalt (Claims) | Speicherung |
|-------|------------|-----------------|-------------|
| **Access Token** | 60 Minuten | `user_id`, `email`, `role`, `exp` | Memory (JS-Variable) |
| **Refresh Token** | 7 Tage | `user_id`, `token_family`, `exp` | HttpOnly Cookie |

### Sicherheitsmaßnahmen

- **Passwort-Hashing**: bcrypt mit Kosten-Faktor 12
- **Rate Limiting**: Max. 5 Login-Versuche pro Minute pro IP
- **Refresh Token Rotation**: Bei jeder Token-Erneuerung wird ein neuer Refresh Token ausgestellt
- **CORS**: Whitelist für erlaubte Origins
- **HTTPS**: Erzwungen in Produktion (via Reverse Proxy)

---

## 8. Admin-Bereich

### Funktionen

```
┌──────────────────────────────────────────────────────┐
│  Admin-Bereich (nur für Rolle "admin")                │
│                                                        │
│  ┌─────────────────┐  ┌──────────────────────────┐   │
│  │ Benutzerverwaltung│  │ System-Konfiguration     │   │
│  │                   │  │                          │   │
│  │ • Benutzer anlegen│  │ • Feature Toggles       │   │
│  │ • Rollen zuweisen │  │ • Initialdaten laden    │   │
│  │ • Benutzer sperren│  │ • Datenimport (JSON)    │   │
│  │ • Passwort reset  │  │ • Datenexport (JSON)    │   │
│  └─────────────────┘  │ • System-Info / Health   │   │
│                        └──────────────────────────┘   │
│  ┌─────────────────┐  ┌──────────────────────────┐   │
│  │ Audit-Log        │  │ Domain-Templates         │   │
│  │                   │  │                          │   │
│  │ • Wer hat was     │  │ • Template auswählen    │   │
│  │   wann geändert?  │  │ • Template anwenden     │   │
│  │ • Filterbar nach  │  │ • Eigenes Template      │   │
│  │   Benutzer/Entity │  │   erstellen             │   │
│  └─────────────────┘  └──────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### Admin-UI Komponenten (Vue)

| Komponente | Beschreibung |
|-----------|-------------|
| `admin-dashboard.js` | Übersicht: Benutzeranzahl, letzte Logins, Systemstatus |
| `admin-users.js` | Benutzerliste mit CRUD-Operationen |
| `admin-user-form.js` | Formular: Benutzer anlegen/bearbeiten, Rollenzuweisung |
| `admin-audit-log.js` | Audit-Log mit Filtern (Benutzer, Zeitraum, Entitätstyp) |
| `admin-system.js` | Seed-Daten laden, Import/Export, Feature Toggles |

---

## 9. Multi-User & Concurrency

### Herausforderungen

1. **Gleichzeitige Bearbeitung** — Zwei Benutzer bearbeiten denselben Datensatz
2. **Datenaktualität** — Dashboard zeigt veraltete Daten an
3. **Konsistenz** — Kaskadierende Löschungen bei gleichzeitiger Nutzung

### Lösungsansatz: Optimistic Locking

```
┌──────────┐        ┌──────────┐        ┌──────────────┐
│  User A   │        │  User B   │        │   Backend    │
└─────┬────┘        └─────┬────┘        └──────┬───────┘
      │ GET /apps/APP-001 │                     │
      │ (version: 3)      │                     │
      │────────────────────┼────────────────────▶│
      │                    │ GET /apps/APP-001   │
      │                    │ (version: 3)        │
      │                    │────────────────────▶│
      │                    │                     │
      │ PUT /apps/APP-001  │                     │
      │ {version:3, ...}   │                     │
      │────────────────────┼────────────────────▶│  ✓ version 3 → 4
      │  200 OK (v:4)      │                     │
      │◀───────────────────┼─────────────────────│
      │                    │                     │
      │                    │ PUT /apps/APP-001   │
      │                    │ {version:3, ...}    │
      │                    │────────────────────▶│  ✗ version 3 ≠ 4
      │                    │  409 Conflict       │
      │                    │◀────────────────────│
      │                    │  (aktuellste Daten  │
      │                    │   im Response-Body) │
```

### Implementierungsdetails

- **Versions-Feld**: Jede Entität erhält ein `version`-Feld (Integer, auto-inkrement bei Update)
- **Conflict Detection**: Bei PUT/DELETE wird die `version` geprüft — stimmt sie nicht überein, → HTTP 409
- **Conflict Resolution**: Frontend zeigt Dialog mit beiden Versionen, Benutzer kann manuell mergen oder überschreiben
- **Datenhaltung**: Jede Entität enthält `updated_at` und `updated_by` Felder

### Optionale Echtzeit-Erweiterung (Zukunft)

Für spätere Ausbaustufen kann WebSocket-basierte Echtzeit-Synchronisierung ergänzt werden:
- Server-Sent Events (SSE) für Benachrichtigungen über Änderungen
- WebSocket für Live-Dashboards
- Wird in Phase 1–3 noch nicht benötigt

---

## 10. Frontend-Anpassungen

### Migration des Stores

Der bestehende `store.js` wird in zwei Teile aufgeteilt:

```
Vorher:                          Nachher:

┌──────────────────────┐        ┌──────────────────────┐
│  store.js            │        │  store.js (State)    │
│  • State (reactive)  │        │  • Reaktiver State   │
│  • CRUD-Methoden     │───────▶│  • Computed Getters  │
│  • Computed Getters  │        │  • UI-State          │
│  • localStorage      │        └──────────────────────┘
│  • Import/Export     │                    │ verwendet
└──────────────────────┘        ┌───────────▼──────────┐
                                │  api-client.js (NEU) │
                                │  • fetch-Wrapper     │
                                │  • JWT-Token-Mgmt    │
                                │  • CRUD-Operationen  │
                                │  • Error Handling    │
                                └──────────────────────┘
```

### API-Client Beispiel

```javascript
// api-client.js — HTTP-Client mit JWT-Support
const API_BASE = '/api'

let accessToken = null

export const api = {
  setToken(token) { accessToken = token },

  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' }
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

    const res = await fetch(`${API_BASE}${path}`, {
      method, headers,
      body: body ? JSON.stringify(body) : null
    })

    if (res.status === 401) {
      // Token abgelaufen → Refresh versuchen
      const refreshed = await this.refreshToken()
      if (refreshed) return this.request(method, path, body)
      // Redirect zu Login
      window.location.hash = '#/login'
      throw new Error('Session expired')
    }

    if (res.status === 409) {
      // Conflict → Optimistic Locking
      const conflict = await res.json()
      throw { type: 'CONFLICT', data: conflict }
    }

    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  // CRUD-Convenience-Methoden
  getApplications: ()        => api.request('GET', '/applications'),
  getApplication:  (id)      => api.request('GET', `/applications/${id}`),
  createApplication: (data)  => api.request('POST', '/applications', data),
  updateApplication: (id, d) => api.request('PUT', `/applications/${id}`, d),
  deleteApplication: (id)    => api.request('DELETE', `/applications/${id}`),

  // ... analog für alle Entitäten
}
```

### Neue UI-Komponenten

| Komponente | Beschreibung |
|-----------|-------------|
| `login.js` | Login-Formular (Email + Passwort) |
| `user-profile.js` | Profil bearbeiten (Name, Passwort ändern) |
| `admin-dashboard.js` | Admin-Übersicht |
| `admin-users.js` | Benutzerverwaltung |
| `admin-audit-log.js` | Audit-Log Viewer |
| `conflict-dialog.js` | Optimistic Locking Konfliktauflösung |

### Anpassungen bestehender Komponenten

1. **Layout**: Login-Status in Header anzeigen, Admin-Menüpunkt für Admins
2. **Alle CRUD-Formulare**: `store.addX()` → `api.createX()`, `store.updateX()` → `api.updateX()`
3. **Dashboard-Komponenten**: Daten via API laden statt direkt aus Store
4. **Settings**: Import/Export über Server-API statt localStorage
5. **Feature Toggles**: Serverseitig gespeichert (pro Instanz, nicht pro Browser)

---

## 11. Containerisierung

### Docker-Dateien

#### `backend/Dockerfile`

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini .

# Datenverzeichnis für SQLite
RUN mkdir -p /data

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### `frontend/Dockerfile`

```dockerfile
FROM nginx:1.27-alpine

# Nginx-Konfiguration mit Reverse-Proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Frontend-Dateien
COPY app/ /usr/share/nginx/html/

EXPOSE 80
```

#### `frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name _;

    # Frontend (SPA)
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Reverse-Proxy
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### `docker-compose.yml`

```yaml
version: "3.9"

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=sqlite:///./data/ea-dashboard.db
      - JWT_SECRET_KEY=${JWT_SECRET_KEY:-change-me-in-production}
      - ADMIN_EMAIL=${ADMIN_EMAIL:-admin@example.com}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
    volumes:
      - db-data:/data
    expose:
      - "8000"

  # PostgreSQL (optional, für Produktion)
  # db:
  #   image: postgres:16-alpine
  #   environment:
  #     POSTGRES_DB: ea_dashboard
  #     POSTGRES_USER: ea_user
  #     POSTGRES_PASSWORD: ${DB_PASSWORD:-change-me}
  #   volumes:
  #     - pg-data:/var/lib/postgresql/data
  #   expose:
  #     - "5432"

volumes:
  db-data:
  # pg-data:
```

#### `docker-compose.prod.yml` (PostgreSQL-Variante)

```yaml
version: "3.9"

services:
  frontend:
    build: ./frontend
    ports:
      - "443:443"
      - "80:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://ea_user:${DB_PASSWORD}@db:5432/ea_dashboard
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
    depends_on:
      - db
    expose:
      - "8000"

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ea_dashboard
      POSTGRES_USER: ea_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pg-data:/var/lib/postgresql/data
    expose:
      - "5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ea_user -d ea_dashboard"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pg-data:
```

### Deployment-Kommandos

```bash
# Entwicklung (SQLite)
docker compose up --build

# Produktion (PostgreSQL)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Initialdaten laden
docker compose exec backend python -m app.services.seed_service

# DB-Migration
docker compose exec backend alembic upgrade head
```

---

## 12. Umsetzungsplan

### Phase S1 — Backend-Grundgerüst (1–2 Wochen)

**Ziel:** Funktionierender Backend-Server mit DB-Anbindung und erstem REST-Endpunkt

| # | Aufgabe | Beschreibung |
|---|---------|-------------|
| 1.1 | Projektstruktur anlegen | `backend/` Verzeichnis, FastAPI-Projekt, requirements.txt |
| 1.2 | Datenbank-Setup | SQLAlchemy-Models für `domains`, `capabilities`, `applications` |
| 1.3 | Alembic-Migrationen | Initiale Migration, automatische Erkennung |
| 1.4 | Erste REST-Endpunkte | CRUD für Domains + Applications |
| 1.5 | Seed-Service | `bebauungsplan.json` → Datenbank importieren |
| 1.6 | Docker-Setup | Dockerfile + docker-compose.yml (Backend + SQLite) |
| 1.7 | Tests | pytest-Grundgerüst, erste API-Tests |

**Deliverable:** `docker compose up` startet Backend, Domains/Apps über REST erreichbar

---

### Phase S2 — Authentifizierung & Benutzerverwaltung (1–2 Wochen)

**Ziel:** Login-System mit JWT, Rollenmodell, Admin-CRUD

| # | Aufgabe | Beschreibung |
|---|---------|-------------|
| 2.1 | User-Model | SQLAlchemy-Model mit Passwort-Hash |
| 2.2 | Auth-Endpunkte | Login, Refresh, Logout, /me |
| 2.3 | JWT-Middleware | Token-Validierung, Rollen-Check |
| 2.4 | Admin-Endpunkte | User-CRUD, nur für Admin-Rolle |
| 2.5 | Initialer Admin | Automatische Erstellung beim ersten Start |
| 2.6 | Rate Limiting | Login-Versuchsbegrenzung |
| 2.7 | Tests | Auth-Flow-Tests, Rollen-Tests |

**Deliverable:** Login funktioniert, JWT-gesicherte Endpunkte, Admin kann Benutzer verwalten

---

### Phase S3 — Vollständige REST API (1–2 Wochen)

**Ziel:** Alle Entitäten über REST-API erreichbar

| # | Aufgabe | Beschreibung |
|---|---------|-------------|
| 3.1 | Verbleibende Models | Projects, Vendors, Demands, Integrations, Processes, Entities, Compliance |
| 3.2 | CRUD-Endpunkte | Für alle Entitäten |
| 3.3 | Dashboard-Endpunkte | Aggregierte Daten (Summary, TIME-Distribution, Health Score) |
| 3.4 | Audit-Log | Automatisches Logging aller Schreiboperationen |
| 3.5 | Import/Export | JSON-Export/-Import über API |
| 3.6 | Optimistic Locking | Version-Feld, Conflict Detection |
| 3.7 | OpenAPI-Dokumentation | Automatisch via FastAPI `/docs` |

**Deliverable:** Vollständige API, Swagger-UI unter `/api/docs`, Audit-Trail

---

### Phase S4 — Frontend-Migration (2–3 Wochen)

**Ziel:** Frontend nutzt Backend-API statt localStorage

| # | Aufgabe | Beschreibung |
|---|---------|-------------|
| 4.1 | API-Client | `api-client.js` mit JWT-Support |
| 4.2 | Login-Komponente | Login-Formular + Token-Management |
| 4.3 | Store-Refactoring | CRUD-Methoden → API-Aufrufe, reaktiver State beibehalten |
| 4.4 | Alle Formulare migrieren | store.addX() → api.createX() |
| 4.5 | Dashboard-Migration | Daten via Dashboard-API laden |
| 4.6 | Admin-UI | Benutzerverwaltung, Audit-Log, System-Config |
| 4.7 | Conflict-Handling | Dialog bei 409-Konflikten |
| 4.8 | Error-Handling | Globale Fehlerbehandlung, Toast-Benachrichtigungen |
| 4.9 | Frontend-Docker | Nginx-Container für Frontend |

**Deliverable:** Vollständig funktionierende Applikation über Docker Compose

---

### Phase S5 — Produktion & Härtung (1–2 Wochen)

**Ziel:** Produktionsreifes Deployment

| # | Aufgabe | Beschreibung |
|---|---------|-------------|
| 5.1 | PostgreSQL-Support | docker-compose.prod.yml, DB-Konfiguration |
| 5.2 | HTTPS/TLS | Nginx SSL-Konfiguration (Let's Encrypt / eigenes Zertifikat) |
| 5.3 | Environment Hardening | Secrets-Management, kein Debug in Prod |
| 5.4 | Health Checks | Docker Health Checks, /api/health Endpunkt |
| 5.5 | Logging | Strukturiertes Logging (JSON), Log-Rotation |
| 5.6 | Backup-Strategie | Automatische DB-Backups (pg_dump / SQLite-Kopie) |
| 5.7 | Dokumentation | Deployment-Guide, Admin-Handbuch |
| 5.8 | Performance-Tests | Lasttests mit mehreren gleichzeitigen Benutzern |

**Deliverable:** Produktionsreife Docker-Container, Deployment-Dokumentation

---

### Übersicht Umsetzungsplan

```
Woche 1─2      Woche 3─4      Woche 5─6      Woche 7─9      Woche 10─11
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Phase S1 │  │ Phase S2 │  │ Phase S3 │  │ Phase S4 │  │ Phase S5 │
│ Backend  │─▶│ Auth &   │─▶│ Alle     │─▶│ Frontend │─▶│ Prod &   │
│ Grund-   │  │ Benutzer │  │ REST     │  │ Migration│  │ Härtung  │
│ gerüst   │  │          │  │ APIs     │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

**Geschätzter Gesamtaufwand: 8–11 Wochen**

---

### Risikobetrachtung

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigation |
|--------|-------------------|------------|------------|
| Datenmigration aus localStorage fehlerhaft | Mittel | Hoch | Seed-Service als Fallback, JSON-Import |
| Performance-Einbussen durch API-Calls | Niedrig | Mittel | Aggregierte Dashboard-Endpunkte, Caching |
| Komplexität der Frontend-Migration | Hoch | Mittel | Inkrementelle Migration, Dual-Mode (API + localStorage) |
| Gleichzeitige Bearbeitung → Konflikte | Mittel | Niedrig | Optimistic Locking, klares UI für Konflikte |
| Sicherheitslücken in Auth | Niedrig | Hoch | Best Practices (bcrypt, JWT Rotation, CORS), Security Audit |

---

### Abwärtskompatibilität

Der **Single-File-Modus** (`bebauungsplan.html`) bleibt als Option erhalten. Durch die Beibehaltung des `build_single.py`-Workflows kann die Applikation weiterhin als lokale Einzeldatei genutzt werden — parallel zur Server-Variante. Dies ermöglicht:

- **Graduelle Einführung**: Teams können die Server-Variante testen, während andere noch lokal arbeiten
- **Offline-Fallback**: Für Szenarien ohne Netzwerkzugriff
- **Demo-Modus**: Für Präsentationen und Evaluierungen ohne Server-Infrastruktur
