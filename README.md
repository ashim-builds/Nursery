# 🌱 KtmBotanica — Nepali Nursery & Floral eCommerce Platform

A modern, production-ready, **Mobile-First** Nursery and Flower eCommerce platform built for Nepal with a strictly separated monorepo architecture.

## 📱 Mobile-First Design
Engineered primarily for mobile smartphone shoppers (320px – 430px) with responsive progressive enhancement for tablets and desktops:
- Touch-friendly bottom navigation bar and quick cart drawer
- Sunlight, watering frequency, and pet safety diagnostic meters
- Pot size & planter variant configurator
- Flower bouquet delivery scheduler with personalized message cards
- Full mobile-first multi-step checkout (Cash on Delivery + Digital Wallets)

## 🛠 Tech Stack

### Frontend (`web/`)
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Botanical Design System
- **State & Data**: TanStack Query + React Context (Auth, Cart, UI)
- **Forms & Validation**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend (`services/`)
- **Runtime**: Node.js + Express + TypeScript
- **Database & ORM**: MySQL 8 + Prisma ORM
- **Authentication**: JWT (Access + Refresh tokens) + bcrypt
- **Validation**: Zod request schema validation
- **Image Storage**: Cloudinary signed uploads

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx reverse proxy with gzip/brotli caching

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database & Environment
```bash
cd services
cp .env.example .env
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 3. Start Development Servers
From the root directory:
```bash
npm run dev
```
- Frontend Storefront: `http://localhost:5173`
- Backend REST API: `http://localhost:5000/api/v1`

---

## 🐳 Running with Docker
```bash
docker-compose up --build -d
```
Visit `http://localhost` in your browser.
