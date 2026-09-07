#!/bin/bash
# ==============================================================================
# KtmBotanica — Production Database Restore Script
# Usage: ./scripts/restore.sh <path_to_backup_file>
# ==============================================================================

set -e

if [ -z "$1" ]; then
  echo "❌ Error: Backup file path required."
  echo "Usage: ./scripts/restore.sh ./backups/ktmbotanica_db_YYYYMMDD_HHMMSS.sql[.gz]"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: File '${BACKUP_FILE}' not found."
  exit 1
fi

# Load environment variables if .env exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

DB_USER="${MYSQL_USER:-nursery_user}"
DB_PASS="${MYSQL_PASSWORD:-nursery_secure_pass_2026}"
DB_NAME="${MYSQL_DATABASE:-nursery_db}"
CONTAINER_NAME="nursery_mysql"

echo "========================================================"
echo "⚠️  WARNING: You are about to restore database '${DB_NAME}'"
echo "Source:    ${BACKUP_FILE}"
echo "Container: ${CONTAINER_NAME}"
echo "========================================================"

read -p "Are you sure you want to proceed with restore? (y/N): " CONFIRM
if [[ "${CONFIRM}" != "y" && "${CONFIRM}" != "Y" ]]; then
  echo "❌ Restore cancelled."
  exit 0
fi

echo "🔄 Restoring database..."

if [[ "${BACKUP_FILE}" == *.gz ]]; then
  gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" mysql -u"${DB_USER}" -p"${DB_PASS}" "${DB_NAME}"
else
  cat "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" mysql -u"${DB_USER}" -p"${DB_PASS}" "${DB_NAME}"
fi

echo "✅ Database restore completed successfully!"
echo "========================================================"
