# Fastboat Booking Engine

Production-ready starter architecture for a fastboat booking platform.

## Stack

- Frontend: React + Vite + TypeScript
- Backend: NestJS + TypeScript
- Database/Auth/Storage: Supabase / PostgreSQL
- Queue: RabbitMQ
- Cache / Distributed Lock: Redis
- API Style: REST, modular clean architecture
- Container: Docker Compose

## Main Features

- Route and schedule search
- Seat availability checking
- Booking creation with expiry lock
- Passenger management
- Payment status update
- Async booking confirmation via RabbitMQ
- Redis seat lock to avoid double booking
- Supabase-compatible PostgreSQL schema

## Services

```txt
apps/
  api/   NestJS backend
  web/   React frontend

packages/
  shared/ Shared TypeScript types
```

## Quick Start

```bash
cp .env.example .env
docker compose up -d
cd apps/api
npm install
npm run start:dev
```

For frontend:

```bash
cd apps/web
npm install
npm run dev
```

## Booking Flow

1. Customer searches route and date.
2. API returns available schedules.
3. Customer selects schedule and passenger count.
4. API checks availability.
5. API creates temporary booking.
6. Redis lock holds selected seats or inventory.
7. Customer pays before expiry.
8. Payment callback confirms booking.
9. RabbitMQ publishes booking confirmed event.
10. Worker sends ticket/manifest/notification asynchronously.

## Important Design Decisions

- Inventory locking uses Redis with TTL.
- Confirmed bookings are persisted in PostgreSQL/Supabase.
- Payment processing is decoupled from ticket issuing.
- Booking status is state-machine friendly.
- Queue consumers are idempotent.
