# KtmBotanica — Mobile-First Botanical Nursery & Florist eCommerce Platform

KtmBotanica is an enterprise-grade, mobile-first nursery plants and botanical flowers eCommerce platform designed for Kathmandu, Lalitpur, Bhaktapur, and across Nepal.

---

## 🌿 Core Architecture & Principles

- **Strict Separation of Concerns**:
  - `web/`: Client-side single-page application built with React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, and React Hook Form. Communicates purely via REST APIs.
  - `services/`: Backend API built with Node.js, Express, TypeScript, Prisma ORM, and MySQL 8.
- **Mobile-First Design**:
  - Engineered primarily for mobile touch viewports (360px, 375px, 390px, 414px) before expanding to tablets (768px) and desktop (1024px+).
  - All interactive elements meet minimum 44px touch targets with thumb-friendly bottom navigation.
- **Stock Model**:
  - Binary status model (`IN_STOCK` vs `OUT_OF_STOCK`). No customer-facing numeric stock units.
- **Image & Media Storage**:
  - Native NVMe filesystem storage with metadata managed in MySQL. **Zero external dependencies like Cloudinary**.
- **Deployment Model**:
  - **Local Development**: Docker & Docker Compose (`docker compose up -d --build`) with automated healthchecks, internal network isolation, and mounted persistent volumes.
  - **Production Deployment**: Native WebPro hosting (Node.js application manager, native MySQL 8, persistent NVMe `/uploads` directory). **Zero Docker runtime dependency in production**.

---

## 📂 Repository Structure

```
.
├── docker-compose.yml       # Local development multi-container stack
├── .env.example             # Configuration and secrets template
├── DEPLOYMENT.md            # WebPro production hosting runbook
├── DATABASE_OPERATIONS.md   # Backup, restore, and migration guide
├── README.md                # Project documentation
├── uploads/                 # Local media storage volume
├── scripts/                 # Cross-platform database operation scripts
├── services/                # Backend Express API & Prisma Service
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Botanical seed dataset
│   └── src/
└── web/                     # Frontend React 19 Application
    ├── nginx.conf           # Local reverse proxy & caching
    └── src/
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+ LTS
- Docker Desktop

### 1. One-Command Local Startup (Docker)
```bash
# Clone repository
git clone <repo-url>
cd Nursery

# Copy environment variables
cp .env.example .env

# Start MySQL, Backend API, and Nginx Web Gateway
docker compose up -d --build
```
- **Web Application & Gateway**: `http://localhost:80`
- **Backend Health Check**: `http://localhost:80/api/health`

### 2. Manual Local Development (Without Docker)
```bash
# Install dependencies
npm install

# Setup database & run migrations
npm run prisma:migrate
npm run prisma:seed

# Start both services in watch mode
npm run dev
```

---

## 📦 Production Deployment
Refer to [DEPLOYMENT.md](file:///c:/Users/ashim/Projects/Client%20Projects/Nursery/DEPLOYMENT.md) for detailed WebPro cPanel/Node.js step-by-step instructions.
