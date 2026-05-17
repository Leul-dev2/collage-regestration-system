# AAU Registration System

A production-grade, multi-tenant university admission SaaS platform built for Ethiopian higher education institutions.

## Architecture

```
apps/
├── backend/     # Express.js + Prisma + PostgreSQL API server
└── frontend/    # Next.js 16 + React 19 + Tailwind 4 web app
```

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js 5
- **ORM**: Prisma 7 + PostgreSQL
- **Auth**: JWT + refresh tokens + email verification
- **Payments**: Chapa payment gateway
- **Email**: Nodemailer + BullMQ job queue
- **Security**: Helmet, CORS, rate limiting, bcrypt

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS 4 + Framer Motion
- **State**: Zustand (client) + TanStack Query (server)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

## Features

- 🏛️ Multi-tenant architecture (institution-scoped data)
- 🔐 Enterprise authentication (JWT, email verification, password reset, RBAC)
- 📝 Multi-step application workflow (Draft → Submit → Review → Approve/Reject)
- 💳 Chapa payment integration with webhooks
- 📊 Role-based dashboards (Super Admin, Admission Officer, Finance Officer, Student)
- 📧 Email notifications via BullMQ queue
- 📁 Document upload with validation
- 🔍 Audit logging for compliance
- 📱 Mobile-responsive with bottom navigation

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis (optional, for email queue)

### Backend Setup

```bash
cd apps/backend
cp .env.example .env       # Configure environment variables
npm install
npx prisma generate
npx prisma db push         # Create database schema
npm run seed               # Seed demo data
npm run dev                # http://localhost:5000
```

### Frontend Setup

```bash
cd apps/frontend
cp .env.example .env.local # Configure environment variables
npm install
npm run dev                # http://localhost:3000
```

### Production Build

```bash
# Backend
cd apps/backend
npm run build
npm start

# Frontend
cd apps/frontend
npm run build
npm start
```

## Demo Accounts (Development)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@saas.com | Admin@123456 |
| Institution Admin | admin@aau.edu.et | Admin@123456 |
| Admission Officer | admissions@aau.edu.et | Admin@123456 |
| Finance Officer | finance@aau.edu.et | Admin@123456 |
| Student | student@aau.edu.et | Student@123 |

## API Documentation

### Health Check
```
GET /health
```

### Authentication
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/auth/verify-email?token=...
```

### Core Resources
```
GET    /api/v1/colleges
GET    /api/v1/programs
GET    /api/v1/applications/my
POST   /api/v1/applications
PATCH  /api/v1/applications/:id/submit
POST   /api/v1/payments/initiate/:applicationId
GET    /api/v1/notifications
```

### Admin
```
GET    /api/v1/admin/dashboard
GET    /api/v1/admin/users
GET    /api/v1/admin/payments
GET    /api/v1/admin/audit-logs
PATCH  /api/v1/applications/:id/status
```

## Environment Variables

See `.env.example` in each app directory for complete configuration reference.

## License

Proprietary — All rights reserved.
