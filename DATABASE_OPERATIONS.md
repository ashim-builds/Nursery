# 🌿 KtmBotanica — Production Database Operations & Runbook

This guide details operational procedures for database management, automated backups, schema migrations, disaster recovery, secret rotation, and log inspection.

---

## 📑 Table of Contents

1. [Golden Safety Rules](#1-golden-safety-rules)
2. [MySQL Backup Strategy](#2-mysql-backup-strategy)
3. [Automation Scripts & CLI Commands](#3-automation-scripts--cli-commands)
4. [How to Migrate Schema in Production](#4-how-to-migrate-schema-in-production)
5. [How to Rollback the Application](#5-how-to-rollback-the-application)
6. [How to Restore the Database](#6-how-to-restore-the-database)
7. [How to Rotate Secrets](#7-how-to-rotate-secrets)
8. [How to Inspect Production Logs](#8-how-to-inspect-production-logs)

---

## 1. 🛡️ Golden Safety Rules

> [!CAUTION]
> **NEVER RUN DESTRUCTIVE COMMANDS ON PRODUCTION**:
> - ❌ **NEVER** run `npx prisma migrate reset` in production. (It drops the database!)
> - ❌ **NEVER** run `npx prisma db push --force-reset` in production.
> - ❌ **NEVER** expose MySQL port `3306` to the public internet.
> - ✅ **ALWAYS** run `npx prisma migrate deploy` to safely apply pending migrations.
> - ✅ **ALWAYS** create a full database backup before applying any schema changes.

---

## 2. 📦 MySQL Backup Strategy

### Architecture & Backup Characteristics
- **Non-Blocking Online Backups**: Uses `--single-transaction` and `--quick` flags to dump InnoDB tables with full consistency without locking live customer transactions.
- **Compression**: Streams SQL output directly through `gzip` for minimal storage footprint.
- **Storage Tiering**: Daily backups stored in `./backups/` and recommended for sync to S3 / encrypted cloud storage.
- **Retention Policy**:
  - Daily backups: Retained for 7 days.
  - Weekly snapshots: Retained for 4 weeks.
  - Monthly archives: Retained for 12 months.

### Automated Linux / Docker Host Cron Job
To run an automated backup daily at 02:00 AM:
```bash
# Open crontab
crontab -e

# Add automated daily backup at 2:00 AM Kathmandu Time
0 2 * * * cd /opt/ktmbotanica && ./scripts/backup.sh >> /var/log/ktmbotanica_backup.log 2>&1
```

---

## 3. 🛠️ Automation Scripts & CLI Commands

| Operation | Linux / Bash Script | Windows PowerShell Script | Direct Docker Command |
| :--- | :--- | :--- | :--- |
| **Backup** | `./scripts/backup.sh` | `.\scripts\backup.ps1` | `docker exec nursery_mysql mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD --single-transaction --quick nursery_db > backup.sql` |
| **Restore** | `./scripts/restore.sh <file>` | `.\scripts\restore.ps1 -BackupFile <file>` | `cat backup.sql \| docker exec -i nursery_mysql mysql -u$MYSQL_USER -p$MYSQL_PASSWORD nursery_db` |
| **Migrate** | `./scripts/migrate.sh` | `.\scripts\migrate.ps1` | `docker exec nursery_services npx prisma migrate deploy` |
| **Seed** | `./scripts/seed.sh` | `.\scripts\seed.ps1` | `docker exec nursery_services npx tsx prisma/seed.ts` |

---

## 4. 🚀 How to Migrate Schema in Production

Follow this 4-step deployment cycle for zero data loss:

### Step 1: Generate Migration in Development
```bash
# In local development workspace:
cd services
npx prisma migrate dev --name add_seasonal_discount_fields
```
*Prisma will generate a SQL migration file inside `services/prisma/migrations/YYYYMMDDHHMMSS_add_seasonal_discount_fields/migration.sql`.*

### Step 2: Review Migration SQL
Inspect the generated `.sql` file to ensure:
- It does not contain accidental `DROP TABLE` or `DROP COLUMN` statements on active data.
- New columns either have defaults (`@default(...)`) or are nullable (`?`) to prevent migration lockups.

### Step 3: Backup Production Database
```bash
./scripts/backup.sh ./backups/pre_migration_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Step 4: Apply Migration to Production
```bash
./scripts/migrate.sh
# or directly:
docker exec nursery_services npx prisma migrate deploy
```

---

## 5. 🔄 How to Rollback the Application

### Application Code Rollback (Zero DB Schema Impact)
If a newly deployed frontend or backend build exhibits unexpected errors:
```bash
# 1. Pull previous stable git commit or tag
git checkout v1.2.4

# 2. Rebuild and restart containers
docker compose up --build -d web services
```

### Database Schema Rollback
If a schema migration must be undone:
1. **Never drop tables directly in production**.
2. Create a compensating migration in development that reverses the changes (e.g., `npx prisma migrate dev --name revert_feature_x`).
3. Deploy the compensating migration with `./scripts/migrate.sh`.
4. If emergency point-in-time recovery is required, follow the [Restore Procedure](#6-how-to-restore-the-database).

---

## 6. ♻️ How to Restore the Database

### Scenario: Restoring from a Point-in-Time Backup
```bash
# 1. Put web gateway into maintenance mode (optional, stops incoming write traffic)
docker stop nursery_web

# 2. Execute restore script
./scripts/restore.sh ./backups/ktmbotanica_db_20260907_120000.sql.gz

# 3. Verify database integrity
docker exec nursery_services npx tsx -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  async function test() {
    const count = await prisma.product.count();
    console.log('Restored product count:', count);
  }
  test();
"

# 4. Restart web container
docker start nursery_web
```

---

## 7. 🔑 How to Rotate Secrets

### A. Rotating MySQL Database Passwords
1. Generate a new strong password:
   ```bash
   openssl rand -base64 24
   ```
2. Update the password inside the running MySQL instance:
   ```bash
   docker exec -it nursery_mysql mysql -u root -p
   ```
   ```sql
   ALTER USER 'nursery_user'@'%' IDENTIFIED BY 'NEW_STRONG_PASSWORD_HERE';
   FLUSH PRIVILEGES;
   ```
3. Update `.env` file on host:
   ```env
   MYSQL_PASSWORD=NEW_STRONG_PASSWORD_HERE
   ```
4. Restart backend services:
   ```bash
   docker compose up -d --no-deps services
   ```

### B. Rotating JWT Secrets
1. Generate new 64-character secrets:
   ```bash
   openssl rand -hex 32
   ```
2. Update `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env`.
3. Restart `services`:
   ```bash
   docker compose up -d --no-deps services
   ```
   *(Note: Existing customer access tokens will expire naturally within 7 days; customers will re-authenticate automatically).*

---

## 8. 🔍 How to Inspect Production Logs

### View Real-Time Streaming Logs
```bash
# Stream all service logs
docker compose logs -f

# Stream only Express backend API logs
docker compose logs -f services

# Stream Nginx access and error logs
docker compose logs -f web

# Stream MySQL database logs
docker compose logs -f mysql
```

### Search and Filter Error Logs
```bash
# Filter errors from Express API in the last 2 hours
docker compose logs --since 2h services | grep "ERROR"

# View the last 200 log entries from backend
docker compose logs --tail=200 services
```

### Log Rotation Setting in `docker-compose.yml`
Docker automatically caps container logs using the default `json-file` driver. For production nodes, verify the log limits:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "50m"
    max-file: "5"
```
