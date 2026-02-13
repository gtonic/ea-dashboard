# EA Dashboard — Deployment Guide

## Überblick

Das EA Dashboard kann auf drei Arten betrieben werden:

| Modus | Beschreibung | Datenbank | Multi-User |
|-------|-------------|-----------|------------|
| **Standalone** | Einzelne HTML-Datei, Browser-basiert | localStorage | Nein |
| **Development** | Docker Compose (SQLite) | SQLite | Ja |
| **Production** | Docker Compose (PostgreSQL) | PostgreSQL | Ja |

---

## 1. Standalone (Einzeldatei)

```bash
python3 build_single.py
# → bebauungsplan.html (ca. 2,4 MB)
```

Einfach die HTML-Datei im Browser öffnen. Alle Daten werden lokal im Browser gespeichert.

---

## 2. Development (Docker Compose + SQLite)

### Voraussetzungen

- Docker Engine ≥ 20.10
- Docker Compose ≥ 2.0

### Einrichtung

```bash
# 1. Umgebungsvariablen konfigurieren
cp backend/.env.example .env
# → .env bearbeiten: JWT_SECRET_KEY und ADMIN_PASSWORD setzen

# 2. Container starten
docker compose up -d

# 3. Seed-Daten laden (einmalig)
curl -X POST http://localhost/api/seed \
  -H "Authorization: Bearer $(curl -s -X POST http://localhost/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"admin@example.com","password":"YOUR_ADMIN_PASSWORD"}' | jq -r .access_token)"
```

**Zugang:** http://localhost  
**API-Docs:** http://localhost/api/docs

### Nützliche Befehle

```bash
docker compose logs -f backend    # Backend-Logs
docker compose restart backend    # Backend neustarten
docker compose down               # Alles stoppen
docker compose down -v            # Stoppen + Daten löschen
```

---

## 3. Production (Docker Compose + PostgreSQL)

### Voraussetzungen

- Docker Engine ≥ 20.10
- Docker Compose ≥ 2.0
- (Optional) Eigenes SSL-Zertifikat

### Einrichtung

```bash
# 1. Produktions-Umgebungsvariablen konfigurieren
cp .env.prod.example .env
# → .env bearbeiten: ALLE Werte anpassen!

# 2. (Optional) SSL-Zertifikat generieren
./scripts/generate-ssl-cert.sh ./certs your-domain.example.com

# 3. Container starten
docker compose -f docker-compose.prod.yml up -d

# 4. Status prüfen
docker compose -f docker-compose.prod.yml ps
curl -s http://localhost/api/health | jq .
```

### Umgebungsvariablen (.env)

| Variable | Pflicht | Beschreibung |
|----------|---------|-------------|
| `POSTGRES_PASSWORD` | ✅ | PostgreSQL-Passwort |
| `JWT_SECRET_KEY` | ✅ | JWT-Signaturschlüssel (generieren: `python -c "import secrets; print(secrets.token_urlsafe(32))"`) |
| `ADMIN_PASSWORD` | ✅ | Initialer Admin-Passwort |
| `POSTGRES_USER` | | DB-Benutzer (default: `eadash`) |
| `POSTGRES_DB` | | DB-Name (default: `eadashboard`) |
| `ADMIN_EMAIL` | | Admin E-Mail (default: `admin@example.com`) |
| `CORS_ORIGINS` | | Erlaubte Origins (default: `https://localhost`) |
| `LOG_LEVEL` | | Log-Level: debug/info/warning/error (default: `info`) |
| `LOG_FORMAT` | | `text` oder `json` (default: `json` in Produktion) |

### Health Checks

Die Container haben eingebaute Health Checks:

```bash
# Status aller Container
docker compose -f docker-compose.prod.yml ps

# Detaillierter Health-Check
curl -s http://localhost/api/health | jq .
# {
#   "status": "healthy",
#   "database": { "type": "postgresql", "connected": true },
#   "uptime_seconds": 3600,
#   "version": "0.5.0"
# }
```

---

## Backup & Restore

### Backup erstellen

```bash
# SQLite
DB_TYPE=sqlite DB_PATH=./data/ea-dashboard.db ./scripts/backup.sh

# PostgreSQL (in Docker)
docker compose -f docker-compose.prod.yml exec backend \
  env DB_TYPE=postgres POSTGRES_HOST=db \
  POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  /bin/sh -c 'PGPASSWORD=$POSTGRES_PASSWORD pg_dump -h db -U eadash eadashboard' \
  | gzip > backups/eadash_$(date +%Y%m%d_%H%M%S).sql.gz

# Alternativ: Backup-Skript direkt mit Zugriff auf Docker-Netzwerk
DB_TYPE=postgres POSTGRES_HOST=localhost POSTGRES_PORT=5432 \
  POSTGRES_USER=eadash POSTGRES_PASSWORD=your-password \
  ./scripts/backup.sh
```

### Backup wiederherstellen

```bash
# SQLite
DB_TYPE=sqlite DB_PATH=./data/ea-dashboard.db ./scripts/restore.sh backups/eadash_20260212.db

# PostgreSQL
DB_TYPE=postgres POSTGRES_HOST=localhost POSTGRES_PORT=5432 \
  POSTGRES_USER=eadash POSTGRES_PASSWORD=your-password \
  ./scripts/restore.sh backups/eadash_20260212.sql.gz
```

Backups älter als 30 Tage werden beim nächsten Backup automatisch gelöscht.

---

## Benutzer-Verwaltung

### Rollen

| Rolle | Lesen | Erstellen/Bearbeiten | Löschen | Admin-Bereich |
|-------|-------|---------------------|---------|--------------|
| **Viewer** | ✅ | ❌ | ❌ | ❌ |
| **Editor** | ✅ | ✅ | ❌ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ |

### Erster Login

Beim ersten Start wird automatisch ein Admin-Benutzer erstellt:
- E-Mail: Wert von `ADMIN_EMAIL`
- Passwort: Wert von `ADMIN_PASSWORD`

### Weitere Benutzer anlegen

1. Als Admin einloggen
2. Navigation → **Admin** → **Benutzerverwaltung**
3. „Neuer Benutzer" → E-Mail, Name, Rolle und Passwort angeben

Oder via API:
```bash
curl -X POST http://localhost/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"Max Mustermann","role":"editor","password":"secure-password"}'
```

---

## Logging

### Entwicklung (Textformat)

```
2026-02-12 14:30:00 INFO     [app.access] GET /api/health 200 2.1ms
```

### Produktion (JSON-Format)

```json
{"timestamp":"2026-02-12 14:30:00","level":"INFO","logger":"app.access","message":"GET /api/health 200 2.1ms","request_id":"a1b2c3d4e5f6"}
```

Jede Anfrage erhält eine `X-Request-ID` im Response-Header für Tracing.

### Log-Level anpassen

```bash
# In .env
LOG_LEVEL=debug    # debug, info, warning, error
LOG_FORMAT=json    # json oder text
```

---

## Sicherheits-Checkliste

Vor dem Produktiv-Einsatz:

- [ ] `JWT_SECRET_KEY` mit sicherem Zufallswert gesetzt
- [ ] `ADMIN_PASSWORD` geändert (stark, ≥12 Zeichen)
- [ ] `POSTGRES_PASSWORD` geändert (stark, ≥16 Zeichen)
- [ ] `CORS_ORIGINS` auf echte Domain beschränkt
- [ ] SSL-Zertifikat konfiguriert (Let's Encrypt oder eigenes)
- [ ] Firewall: Nur Port 80/443 öffentlich erreichbar
- [ ] Backup-Strategie eingerichtet und getestet
- [ ] Admin-E-Mail-Adresse angepasst
- [ ] `LOG_FORMAT=json` für strukturierte Logs
- [ ] Docker-Images regelmäßig aktualisieren

---

## Architektur

```
                    ┌─────────────────┐
                    │   Browser/SPA   │
                    └────────┬────────┘
                             │ HTTPS (443)
                    ┌────────▼────────┐
                    │  Nginx Frontend │
                    │  (Static Files) │
                    └──┬──────────┬───┘
                       │          │
              /app/*   │          │ /api/*
              (static) │          │ (reverse proxy)
                       │   ┌──────▼──────┐
                       │   │   FastAPI    │
                       │   │  (Backend)   │
                       │   └──────┬───────┘
                       │          │
                       │   ┌──────▼──────┐
                       │   │ PostgreSQL / │
                       │   │   SQLite     │
                       │   └─────────────┘
```

---

## Fehlerbehebung

### Container starten nicht

```bash
docker compose -f docker-compose.prod.yml logs
# Häufige Ursachen:
# - Fehlende Umgebungsvariablen → .env prüfen
# - Port bereits belegt → FRONTEND_PORT ändern
# - PostgreSQL braucht Zeit → warten, Health Check prüft automatisch
```

### Datenbank-Verbindung fehlgeschlagen

```bash
# Health-Check prüfen
curl -s http://localhost/api/health | jq .database
# → { "type": "postgresql", "connected": false } = Problem

# PostgreSQL-Logs prüfen
docker compose -f docker-compose.prod.yml logs db
```

### Passwort vergessen

```bash
# Neuen Admin per API erstellen (erfordert DB-Zugang)
docker compose -f docker-compose.prod.yml exec backend python -c "
from app.database import SessionLocal
from app.models.user import User
from app.services.auth_service import hash_password
db = SessionLocal()
user = db.query(User).filter(User.email == 'admin@example.com').first()
user.password_hash = hash_password('new-password')
db.commit()
print('Password reset.')
"
```
