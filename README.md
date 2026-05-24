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

## Quick Start

```bash
cp .env.example .env
docker compose up -d
cd apps/api
npm install
npm run start:dev
```

Frontend:

```bash
cd apps/web
npm install
npm run dev
```
