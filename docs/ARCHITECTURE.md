# Architecture

## Backend Modules

```txt
AppModule
 ├─ InfrastructureModule
 │   ├─ SupabaseService
 │   ├─ RedisLockService
 │   └─ RabbitMqPublisher
 ├─ ScheduleModule
 │   ├─ ScheduleController
 │   └─ ScheduleService
 └─ BookingModule
     ├─ BookingController
     └─ BookingService
```

## Core Pattern

- Controller only handles HTTP.
- Service contains business rules.
- Infrastructure module wraps third-party dependencies.
- DTO validates input.
- Database schema is explicit and migration-friendly.
- Redis lock protects critical booking inventory.
- RabbitMQ emits events for notification, ticketing, and manifest generation.

## Recommended Next Modules

- AuthModule
- PaymentModule
- OperatorAdminModule
- TicketModule
- ManifestModule
- RefundModule
- PromoModule
- AuditLogModule

## API Endpoints

### Search schedules

```http
GET /api/v1/schedules?originPortId=<uuid>&destinationPortId=<uuid>&departureDate=2026-05-24&passengers=2
```

### Create booking

```http
POST /api/v1/bookings
Content-Type: application/json
```

```json
{
  "scheduleId": "uuid",
  "customer": {
    "fullName": "Krisna Anggara",
    "email": "krisna@example.com",
    "phone": "6285738239996"
  },
  "passengers": [
    {
      "fullName": "Krisna Anggara",
      "nationality": "Indonesia",
      "identityType": "KTP",
      "identityNumber": "1234567890"
    }
  ]
}
```

### Mark booking as paid

```http
PATCH /api/v1/bookings/:id/mark-paid
```

## Production Notes

Use a proper payment webhook instead of manual `mark-paid`.
Use Row Level Security carefully in Supabase. Backend service role key must never be exposed to frontend.
For real seat numbers, create `seats` and `booking_seats` tables. For inventory-only operators, schedule-level capacity is enough.
