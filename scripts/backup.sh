#!/bin/bash
# ==============================================================================
# KtmBotanica — Production Database Backup Script
# Usage: ./scripts/backup.sh [optional_custom_filename]
# ==============================================================================

set -e

# Load environment variables if .env exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

DB_USER="${MYSQL_USER:-nursery_user}"
DB_PASS="${MYSQL_PASSWORD:-nursery_secure_pass_2026}"
DB_NAME="${MYSQL_DATABASE:-nursery_db}"
CONTAINER_NAME="nursery_mysql"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="${1:-${BACKUP_DIR}/ktmbotanica_db_${TIMESTAMP}.sql.gz}"

mkdir -p "${BACKUP_DIR}"

echo "========================================================"
echo "📦 Initiating KtmBotanica MySQL Database Backup..."
echo "Container: ${CONTAINER_NAME}"
echo "Database:  ${DB_NAME}"
echo "Target:    ${BACKUP_FILE}"
echo "========================================================"

# Execute non-blocking mysqldump inside container and compress with gzip
docker exec "${CONTAINER_NAME}" mysqldump \
  -u"${DB_USER}" \
  -p"${DB_PASS}" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  "${DB_NAME}" | gzip > "${BACKUP_FILE}"

BACKUP_SIZE=$(ls -lh "${BACKUP_FILE}" | awk '{print $5}')
echo "✅ Backup completed successfully!"
echo "📁 Archive: ${BACKUP_FILE} (${BACKUP_SIZE})"
echo "========================================================"
