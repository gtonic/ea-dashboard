#!/usr/bin/env bash
# Backup EA Dashboard database
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_TYPE="${DB_TYPE:-sqlite}"

mkdir -p "$BACKUP_DIR"

case "$DB_TYPE" in
  sqlite)
    DB_PATH="${DB_PATH:-./data/ea-dashboard.db}"
    if [ ! -f "$DB_PATH" ]; then
      echo "Error: SQLite database not found at $DB_PATH"
      exit 1
    fi
    BACKUP_FILE="$BACKUP_DIR/eadash_${TIMESTAMP}.db"
    cp "$DB_PATH" "$BACKUP_FILE"
    echo "SQLite backup: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
    ;;
  postgres)
    POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
    POSTGRES_PORT="${POSTGRES_PORT:-5432}"
    POSTGRES_USER="${POSTGRES_USER:-eadash}"
    POSTGRES_DB="${POSTGRES_DB:-eadashboard}"
    BACKUP_FILE="$BACKUP_DIR/eadash_${TIMESTAMP}.sql.gz"
    PGPASSWORD="${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD}" pg_dump \
      -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" "$POSTGRES_DB" \
      | gzip > "$BACKUP_FILE"
    echo "PostgreSQL backup: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
    ;;
  *)
    echo "Error: Unknown DB_TYPE '$DB_TYPE'. Use 'sqlite' or 'postgres'."
    exit 1
    ;;
esac

# Clean up backups older than 30 days
find "$BACKUP_DIR" -name "eadash_*" -mtime +30 -delete 2>/dev/null || true
echo "Cleanup: removed backups older than 30 days"
