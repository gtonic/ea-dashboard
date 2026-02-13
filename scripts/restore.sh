#!/usr/bin/env bash
# Restore EA Dashboard database from backup
set -euo pipefail

BACKUP_FILE="${1:?Usage: $0 <backup-file>}"
DB_TYPE="${DB_TYPE:-sqlite}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

case "$DB_TYPE" in
  sqlite)
    DB_PATH="${DB_PATH:-./data/ea-dashboard.db}"
    echo "Restoring SQLite from $BACKUP_FILE → $DB_PATH"
    cp "$BACKUP_FILE" "$DB_PATH"
    echo "Restore complete."
    ;;
  postgres)
    POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
    POSTGRES_PORT="${POSTGRES_PORT:-5432}"
    POSTGRES_USER="${POSTGRES_USER:-eadash}"
    POSTGRES_DB="${POSTGRES_DB:-eadashboard}"
    echo "Restoring PostgreSQL from $BACKUP_FILE → $POSTGRES_DB"
    if [[ "$BACKUP_FILE" == *.gz ]]; then
      PGPASSWORD="${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD}" gunzip -c "$BACKUP_FILE" \
        | psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" "$POSTGRES_DB"
    else
      PGPASSWORD="${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD}" psql \
        -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" "$POSTGRES_DB" < "$BACKUP_FILE"
    fi
    echo "Restore complete."
    ;;
  *)
    echo "Error: Unknown DB_TYPE '$DB_TYPE'. Use 'sqlite' or 'postgres'."
    exit 1
    ;;
esac
