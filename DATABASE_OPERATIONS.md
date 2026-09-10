# 🌿 RJ Flowers — Production Database Operations & Runbook

This guide details operational procedures for database management, backups, schema migrations, disaster recovery, secret rotation, and log inspection.

---

## 📑 Table of Contents

1. [Golden Safety Rules](#1-golden-safety-rules)
2. [MySQL Backup Strategy](#2-mysql-backup-strategy)
3. [CLI Commands](#3-cli-commands)
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
- **Retention Policy**:
  - Daily backups: Retained for 7 days.
  - Weekly snapshots: Retained for 4 weeks.
  - Monthly archives: Retained for 12 months.

---

## 3. 🛠️ CLI Commands

| Operation | Docker (Local Dev) | Production (cPanel SSH) |
| :--- | :--- | :--- |
| **Backup** | `docker exec nursery_mysql mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD --single-transaction --quick nursery_db > backup.sql` | `mysqldump -u rjflowe_dbuser -p rjflowe_nurserydb > backup.sql` |
| **Restore** | `cat backup.sql \| docker exec -i nursery_mysql mysql -u$MYSQL_USER -p$MYSQL_PASSWORD nursery_db` | `mysql -u rjflowe_dbuser -p rjflowe_nurserydb < backup.sql` |
| **Migrate** | `docker exec nursery_services npx prisma migrate deploy` | `npx prisma migrate deploy` |
| **Seed** | `docker exec nursery_services npx tsx prisma/seed.ts` | `npx tsx prisma/seed.ts` |

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
mysqldump -u rjflowe_dbuser -p rjflowe_nurserydb > pre_migration_backup.sql
```

### Step 4: Apply Migration to Production
```bash
npx prisma migrate deploy
```

---

## 5. 🔄 How to Rollback the Application

### Application Code Rollback (Zero DB Schema Impact)
If a newly deployed frontend or backend build exhibits unexpected errors:
```bash
# 1. Pull previous stable git commit or tag
git checkout v1.2.4

# 2. Rebuild locally and re-upload to server
npm run build
# Upload dist/ to server, restart Node.js app in cPanel
```

### Database Schema Rollback
If a schema migration must be undone:
1. **Never drop tables directly in production**.
2. Create a compensating migration in development that reverses the changes (e.g., `npx prisma migrate dev --name revert_feature_x`).
3. Deploy the compensating migration with `npx prisma migrate deploy`.
4. If emergency point-in-time recovery is required, follow the [Restore Procedure](#6-how-to-restore-the-database).

---

## 6. ♻️ How to Restore the Database

### Scenario: Restoring from a Backup
```bash
# 1. Stop Node.js app in cPanel (Restart → Stop)

# 2. Restore the backup
mysql -u rjflowe_dbuser -p rjflowe_nurserydb < backup_file.sql

# 3. Verify database integrity
node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  prisma.product.count().then(c => console.log('Products:', c));
"

# 4. Restart Node.js app in cPanel
```

---

## 7. 🔑 How to Rotate Secrets

### A. Rotating MySQL Database Passwords
1. Generate a new strong password:
   ```bash
   node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
   ```
2. Update the password in cPanel → MySQL Databases → Change Password.
3. Update `DATABASE_URL` in the `.env` file or cPanel Node.js environment variables.
4. Restart the Node.js application in cPanel.

### B. Rotating JWT Secrets
1. Generate new 64-character secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Update `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env` or cPanel env vars.
3. Restart the Node.js application.
   *(Note: Existing customer access tokens will expire naturally; customers will re-authenticate automatically).*

---

## 8. 🔍 How to Inspect Production Logs

### cPanel Production Logs
- **Node.js App Logs**: Check `stderr.log` in the application root directory (`~/api.rjflowers.com/stderr.log`)
- **Apache/LiteSpeed Error Logs**: cPanel → Metrics → Errors
- **Access Logs**: cPanel → Metrics → Raw Access

### Docker Local Development Logs
```bash
# Stream all service logs
docker compose logs -f

# Stream only Express backend API logs
docker compose logs -f services

# Stream MySQL database logs
docker compose logs -f mysql
```
