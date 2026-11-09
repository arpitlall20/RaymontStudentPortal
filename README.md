# Raymont Student Accommodation Portal

StarRez-inspired student accommodation portal for a residential college (~130 beds). Includes student self-service and admin operations for rooms, allocations, fees, applications, maintenance, and announcements.

## Stack

- Next.js (App Router) + TypeScript
- Prisma + PostgreSQL
- Auth.js (credentials)
- Tailwind CSS

## Quick start

### 1. Database

Create a Postgres database and set `DATABASE_URL` in `.env` (see `.env.example`).

```bash
# Example local DB
createdb raymont
```

### 2. Install & migrate

```bash
npm install
cp .env.example .env   # edit secrets/URL as needed
npm run db:push
npm run db:seed
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo logins

| Role    | Email                   | Password     |
|---------|-------------------------|--------------|
| Admin   | `admin@raymont.local`   | `password123` |
| Student | `student@raymont.local` | `password123` |

## Features

**Student portal** (`/portal`)

- Dashboard with room, status, fees remaining
- Room / meal plan details
- Fees ledger + simulated payments
- Applications
- Maintenance requests
- Announcements

**Admin portal** (`/admin`)

- Occupancy dashboard
- Residents CRUD + per-resident ledger
- Buildings / rooms / beds
- Allocations (check-in / check-out)
- Billing (fee plans, charges, payments)
- Applications workflow (interview → offer → deposit)
- Maintenance queue
- Announcements

## Scripts

| Script            | Description                |
|-------------------|----------------------------|
| `npm run dev`     | Start dev server           |
| `npm run build`   | Prisma generate + build    |
| `npm run db:push` | Push Prisma schema         |
| `npm run db:seed` | Seed demo data             |
| `npm run db:reset`| Reset DB and reseed        |

## Notes

- Payments are **simulated** (ledger updates only; no Stripe).
- Remaining balance = sum(charges) − sum(payments).
- Single-college model with multi-building / multi-bed inventory.
