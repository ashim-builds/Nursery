# Production Deployment Guide — WebPro Hosting (Nepal)

This guide documents the complete production deployment procedure for the **KtmBotanica Nursery eCommerce Platform** on standard **WebPro Hosting (cPanel / DirectAdmin / CloudLinux)** environments in Nepal.

> **CRITICAL ARCHITECTURE REQUIREMENT**:  
> **DO NOT USE DOCKER IN PRODUCTION.** Docker is exclusively for local development and integration testing. Production runs natively on the hosting provider's Node.js application manager, native MySQL 8 database service, and persistent NVMe filesystem storage.

---

## 1. System Architecture Overview

```
Internet
   ↓
Domain (e.g., https://ktmbotanica.com)
   ↓
WebPro Web Server (Nginx / Apache / LiteSpeed)
   ├── Frontend: React 19 Production Bundle (web/dist -> public_html)
   ├── Backend: Node.js Express API (services/ -> Node App Manager, e.g., Port 3000 / Passenger)
   ├── Database: Managed MySQL 8 (cPanel MySQL Database)
   └── Media Storage: Persistent NVMe Directory (/uploads/ -> public_html/uploads)
```

---

## 2. Pre-Deployment Preparation

### 2.1 WebPro cPanel / Hosting Setup
1. **Create MySQL Database**:
   - Create Database: `ktmbota_nurserydb`
   - Create Database User: `ktmbota_dbuser` with a secure random password.
   - Grant **ALL PRIVILEGES** to the user on the database.
2. **Setup Node.js Application** (via cPanel "Setup Node.js App"):
   - **Node.js Version**: 20.x or 22.x LTS.
   - **Application Mode**: `Production`.
   - **Application Root**: `services` (or `api.ktmbotanica.com`).
   - **Application Startup File**: `dist/server.js`.
3. **Setup Persistent NVMe Upload Directories**:
   - Create folder: `public_html/uploads/products`
   - Create folder: `public_html/uploads/categories`
   - Create folder: `public_html/uploads/banners`
   - Create folder: `public_html/uploads/branding`
   - Set file permissions to `755` (writable by Node.js web server).

---

## 3. Step-by-Step Deployment Procedure

### Step 1: Build the Frontend Bundle
On your local machine or CI/CD runner:
```bash
cd web
npm ci
npm run build
```
The optimized production bundle will be generated inside `web/dist/`.

### Step 2: Deploy Frontend Static Files
Upload all files inside `web/dist/` directly into the web root (`public_html/`).

Ensure the `.htaccess` file in `public_html/` is configured for SPA client-side routing and static asset caching:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Proxy API requests to Node.js backend if using sub-path
  RewriteRule ^api/(.*)$ http://127.0.0.1:5000/api/$1 [P,L]
  
  # SPA Fallback: If requested resource is not a real file/dir, route to index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Caching for static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
</IfModule>
```

---

### Step 3: Build & Deploy Backend API Service
1. **Build Backend TypeScript Locally**:
   ```bash
   cd services
   npm ci
   npx prisma generate
   npm run build
   ```
2. **Upload Backend Files**:
   Upload the following to the Node.js application root directory on WebPro:
   - `dist/`
   - `prisma/`
   - `package.json`
   - `package-lock.json`
3. **Install Production Dependencies**:
   Inside the cPanel Node.js virtual environment terminal:
   ```bash
   npm ci --omit=dev
   npx prisma generate
   ```

---

### Step 4: Configure Production Environment Variables
Set the environment variables in cPanel Node.js App interface or in a secure `.env` file inside `services/`:

```ini
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://ktmbotanica.com
BACKEND_URL=https://ktmbotanica.com/api
CORS_ORIGIN=https://ktmbotanica.com

# Database Connection (WebPro MySQL)
DATABASE_URL="mysql://ktmbota_dbuser:StrongPassword2026!@localhost:3306/ktmbota_nurserydb"

# JWT Secrets (Random 64 characters)
JWT_SECRET=your_production_64_char_secure_jwt_access_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_production_64_char_secure_jwt_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=30d
COOKIE_SECRET=your_production_secure_cookie_signing_key

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=https://ktmbotanica.com/api/auth/google/callback

# Persistent NVMe File Storage
UPLOAD_DIR=/home/ktmbota/public_html/uploads
UPLOAD_BASE_URL=/uploads

# Payment Gateways (Nepal Production Keys)
ESEWA_PRODUCT_CODE=YOUR_MERCHANT_CODE
ESEWA_SECRET_KEY=YOUR_PRODUCTION_SECRET
```

---

### Step 5: Execute Database Migrations (Zero Data Loss)
Run Prisma production migration to apply the schema without resetting data:
```bash
npx prisma migrate deploy
```
*(Optional initial seeding for delivery zones, categories, and initial admin)*:
```bash
npm run prisma:seed
```

---

### Step 6: Start & Restart the Application
In cPanel Node.js App Manager:
- Click **Restart Application**.

---

### Step 7: Post-Deployment Verification Checklist
1. **API Health**:
   ```bash
   curl -I https://ktmbotanica.com/api/health
   # Must return HTTP 200 OK
   ```
2. **Frontend Loading**:
   Open `https://ktmbotanica.com` in a browser. Verify no 404s on `/assets/*`.
3. **Image Upload & Serving**:
   Log into `/admin`, upload a product image, and verify the file appears in `/home/ktmbota/public_html/uploads/products/` and renders correctly in the browser.
4. **Checkout & Payment**:
   Place a test Cash on Delivery or eSewa order.
5. **SSL & Security**:
   Ensure SSL certificate is active (HTTPS enforced).

---

## 4. Backup & Disaster Recovery Runbook

### 4.1 Database Backup
```bash
mysqldump -u ktmbota_dbuser -p ktmbota_nurserydb > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 4.2 Media Files Backup
```bash
tar -czvf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz /home/ktmbota/public_html/uploads
```

### 4.3 Restoration
- **Database**: `mysql -u ktmbota_dbuser -p ktmbota_nurserydb < backup_file.sql`
- **Uploads**: `tar -xzvf uploads_backup_file.tar.gz -C /home/ktmbota/public_html/`
