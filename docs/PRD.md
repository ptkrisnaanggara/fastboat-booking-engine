# Product Requirements Document: Fastboat Booking Engine

## 1. Document Control

| Item | Detail |
| --- | --- |
| Product | Fastboat Booking Engine |
| Version | 1.0 |
| Status | Draft |
| Owner | Product / Engineering Team |
| Backend | NestJS |
| Frontend | ReactJS |
| Database | Supabase / PostgreSQL |
| Queue | RabbitMQ |
| Cache / Locking | Redis |

---

## 2. Product Overview

Fastboat Booking Engine is a web-based booking platform for fastboat operators, travel agents, and customers. The system allows users to search schedules, check availability, create bookings, manage passengers, process payments, and generate booking confirmations.

The platform is designed as a scalable booking core that can support direct customer booking, agent booking, operator administration, payment integration, and asynchronous ticketing workflows.

---

## 3. Goals

### 3.1 Business Goals

- Provide a centralized booking system for fastboat routes and schedules.
- Reduce manual booking operations through automated availability checks.
- Prevent overbooking using Redis-based inventory locking.
- Support future integration with payment gateways, WhatsApp notifications, and operator dashboards.
- Provide an architecture that can scale to multiple operators, ports, routes, and sales channels.

### 3.2 Product Goals

- Customers can search fastboat schedules by route, date, and passenger count.
- Customers or agents can create bookings with passenger details.
- Operators can manage vessels, routes, schedules, and capacity.
- Admin users can monitor bookings, payments, and operational status.
- The system can emit booking events through RabbitMQ for async processes.

### 3.3 Engineering Goals

- Use modular NestJS backend architecture.
- Use ReactJS frontend with clean feature-based structure.
- Use Supabase/PostgreSQL as the source of truth.
- Use Redis for seat/inventory lock and short-lived cache.
- Use RabbitMQ for event-driven processing.
- Keep business logic isolated from infrastructure implementation.

---

## 4. Target Users

### 4.1 Customer

End user who wants to book a fastboat ticket.

Primary actions:

- Search schedules.
- Select departure.
- Enter passenger information.
- Make payment.
- Receive booking confirmation.

### 4.2 Travel Agent

Agent who books tickets on behalf of customers.

Primary actions:

- Search availability.
- Create booking for customer.
- Manage multiple bookings.
- Track payment and confirmation status.

### 4.3 Operator Admin

Fastboat operator staff who manages operational data.

Primary actions:

- Manage vessels.
- Manage routes.
- Manage schedules.
- Adjust capacity.
- View passenger manifest.

### 4.4 Platform Admin

Internal admin who manages the entire platform.

Primary actions:

- Manage ports, operators, routes, schedules.
- Monitor bookings and payments.
- Handle refunds and cancellations.
- View audit logs and system events.

---

## 5. Scope

### 5.1 In Scope for MVP

- Port management.
- Operator management.
- Vessel management.
- Route management.
- Schedule management.
- Schedule search.
- Booking creation.
- Passenger data capture.
- Booking status management.
- Manual mark-as-paid endpoint.
- Redis inventory lock.
- RabbitMQ booking event publisher.
- Basic React booking UI.
- Supabase/PostgreSQL database schema.

### 5.2 Out of Scope for MVP

- Full payment gateway integration.
- QR ticket generation.
- PDF ticket generation.
- Refund automation.
- Complex dynamic pricing.
- Multi-language UI.
- Mobile app.
- Loyalty program.
- Advanced reporting dashboard.

### 5.3 Future Scope

- Payment webhook integration.
- WhatsApp and email ticket delivery.
- Agent commission.
- Voucher and promo code.
- Seat map selection.
- Passenger manifest export.
- Operator settlement report.
- Multi-currency pricing.
- Public API for reseller partners.

---

## 6. User Journeys

### 6.1 Customer Booking Journey

1. Customer opens booking page.
2. Customer selects origin port, destination port, date, and passenger count.
3. System returns available schedules.
4. Customer selects a schedule.
5. System validates available capacity.
6. Customer enters passenger and contact information.
7. System creates booking with `PENDING_PAYMENT` status.
8. System temporarily reduces available capacity or locks inventory.
9. Customer completes payment.
10. System updates booking to `PAID` or `CONFIRMED`.
11. System publishes booking event to RabbitMQ.
12. Customer receives booking confirmation.

### 6.2 Agent Booking Journey

1. Agent logs in to dashboard.
2. Agent searches availability for customer.
3. Agent creates booking.
4. Agent shares payment instruction or payment link.
5. Agent monitors booking status.
6. Agent downloads or sends ticket after confirmation.

### 6.3 Operator Schedule Management Journey

1. Operator admin logs in.
2. Operator creates or updates vessel.
3. Operator creates route.
4. Operator creates schedule with departure time, arrival time, price, and capacity.
5. Schedule becomes available for search.
6. Operator views passenger manifest before departure.

---

## 7. Functional Requirements

## 7.1 Port Management

### Requirement

Admin can create, update, view, and deactivate ports.

### Fields

- Port code
- Port name
- Island
- City
- Active status

### Acceptance Criteria

- Admin can create a port with unique code.
- System rejects duplicate port code.
- Inactive ports should not appear in public search filters.

---

## 7.2 Operator Management

### Requirement

Admin can manage fastboat operators.

### Fields

- Operator name
- Contact email
- Contact phone
- Active status

### Acceptance Criteria

- Admin can create and update operator profile.
- Inactive operators cannot publish new schedules.

---

## 7.3 Vessel Management

### Requirement

Operator admin can manage vessels and capacity.

### Fields

- Operator ID
- Vessel name
- Capacity
- Active status

### Acceptance Criteria

- Vessel capacity must be greater than zero.
- Inactive vessels cannot be assigned to new schedules.

---

## 7.4 Route Management

### Requirement

Admin can manage travel routes between two ports.

### Fields

- Origin port
- Destination port
- Distance in kilometers
- Estimated duration in minutes
- Active status

### Acceptance Criteria

- Origin and destination cannot be the same.
- Inactive routes cannot be searched by customers.

---

## 7.5 Schedule Management

### Requirement

Operator admin can create schedules for vessels and routes.

### Fields

- Route ID
- Operator ID
- Vessel ID
- Departure time
- Arrival time
- Base price
- Currency
- Available capacity
- Status

### Acceptance Criteria

- Arrival time must be later than departure time.
- Available capacity cannot exceed vessel capacity.
- Only schedules with `OPEN` status appear in search.

---

## 7.6 Schedule Search

### Requirement

Customer can search schedules by origin, destination, date, and passenger count.

### Input

- Origin port ID
- Destination port ID
- Departure date
- Passenger count

### Output

- Schedule ID
- Operator name
- Vessel name
- Departure time
- Arrival time
- Available capacity
- Price
- Currency

### Acceptance Criteria

- System returns schedules matching the route and departure date.
- System only returns schedules with enough available capacity.
- System sorts schedules by departure time ascending.

---

## 7.7 Booking Creation

### Requirement

Customer or agent can create a booking for a selected schedule.

### Input

- Schedule ID
- Customer full name
- Customer email
- Customer phone
- Passenger list

### Output

- Booking ID
- Booking code
- Booking status
- Total amount
- Expiry time

### Rules

- Booking status starts as `PENDING_PAYMENT`.
- Booking expires if payment is not completed before expiry time.
- Passenger count equals number of passenger records.
- Total amount equals base price multiplied by passenger count.

### Acceptance Criteria

- System rejects booking if capacity is insufficient.
- System uses Redis lock during booking creation.
- System creates customer, booking, and passenger records.
- System publishes `booking.created` event.

---

## 7.8 Booking Status Management

### Statuses

- `DRAFT`
- `PENDING_PAYMENT`
- `PAID`
- `CONFIRMED`
- `CANCELLED`
- `EXPIRED`
- `REFUNDED`

### Rules

- `PENDING_PAYMENT` can become `PAID`, `EXPIRED`, or `CANCELLED`.
- `PAID` can become `CONFIRMED` or `REFUNDED`.
- `CONFIRMED` can become `CANCELLED` depending on policy.
- `EXPIRED` and `REFUNDED` are terminal states for MVP.

### Acceptance Criteria

- Invalid status transition must be rejected.
- Payment update must be idempotent.
- Booking update must emit event to RabbitMQ.

---

## 7.9 Payment Handling MVP

### Requirement

Admin or system can mark booking as paid.

### Acceptance Criteria

- Only `PENDING_PAYMENT` booking can be marked as paid.
- System records payment information.
- System emits `booking.paid` event.

### Future Enhancement

Replace manual payment update with payment gateway webhook.

---

## 7.10 Passenger Manifest

### Requirement

Operator admin can view passenger list for a schedule.

### Fields

- Booking code
- Passenger full name
- Nationality
- Identity type
- Identity number
- Booking status

### Acceptance Criteria

- Manifest only includes paid or confirmed bookings.
- Manifest can be filtered by schedule.
- Future version can export CSV or PDF.

---

## 8. Non-Functional Requirements

## 8.1 Performance

- Search schedule response should be below 500 ms for normal traffic.
- Booking creation should be below 1 second excluding external payment services.
- Redis lock TTL should be short and configurable.

## 8.2 Reliability

- Booking process must prevent overbooking.
- RabbitMQ event publishing should be retryable.
- Consumers must be idempotent.
- Database should be the source of truth.

## 8.3 Security

- Supabase service role key must only be used in backend.
- Frontend must never expose backend secret keys.
- Admin APIs must require authentication and authorization.
- Sensitive passenger identity data must be protected.
- Audit logs should be added for admin changes.

## 8.4 Scalability

- Backend modules should be independently maintainable.
- RabbitMQ should handle async notification, ticketing, and manifest jobs.
- Redis should support distributed deployment.
- Database indexes must support route and date search.

## 8.5 Observability

- API request logs.
- Booking creation logs.
- Payment status update logs.
- RabbitMQ publish/consume logs.
- Error tracking for failed booking and payment events.

---

## 9. Architecture Requirements

## 9.1 Backend Architecture

Backend uses NestJS modular architecture.

Recommended modules:

- `AppModule`
- `InfrastructureModule`
- `AuthModule`
- `PortModule`
- `OperatorModule`
- `VesselModule`
- `RouteModule`
- `ScheduleModule`
- `BookingModule`
- `PaymentModule`
- `TicketModule`
- `ManifestModule`
- `NotificationModule`
- `AuditLogModule`

### Layering

- Controller: HTTP request and response only.
- Service: business logic.
- Repository: database query abstraction.
- DTO: request validation.
- Infrastructure: Redis, RabbitMQ, Supabase, external services.

## 9.2 Frontend Architecture

Frontend uses ReactJS feature-based structure.

Recommended structure:

```txt
src/
  lib/
    api.ts
  modules/
    booking/
    schedule/
    admin/
    payment/
  components/
  hooks/
  types/
```

### UI Requirements

- Responsive layout.
- Simple search form.
- Schedule result cards.
- Booking form.
- Booking confirmation view.
- Admin dashboard in future phase.

## 9.3 Queue Architecture

RabbitMQ exchange:

```txt
fastboat.events
```

Routing keys:

```txt
booking.created
booking.paid
booking.confirmed
booking.cancelled
booking.expired
payment.received
notification.requested
```

Consumers:

- Ticket generation worker.
- Notification worker.
- Manifest sync worker.
- Payment reconciliation worker.

## 9.4 Redis Usage

Redis keys:

```txt
schedule:{scheduleId}:inventory
booking:{bookingId}:lock
search:{origin}:{destination}:{date}:{passengers}
```

Use cases:

- Inventory lock.
- Booking operation lock.
- Short-lived schedule search cache.
- Rate limiting in future phase.

---

## 10. Database Requirements

Core tables:

- `ports`
- `operators`
- `vessels`
- `routes`
- `schedules`
- `customers`
- `bookings`
- `booking_passengers`
- `payments`

Future tables:

- `users`
- `roles`
- `agent_profiles`
- `operator_users`
- `tickets`
- `refunds`
- `promos`
- `audit_logs`
- `notification_logs`
- `webhook_events`

---

## 11. API Requirements

## 11.1 Public APIs

### Search schedules

```http
GET /api/v1/schedules
```

Query parameters:

- `originPortId`
- `destinationPortId`
- `departureDate`
- `passengers`

### Create booking

```http
POST /api/v1/bookings
```

### Get booking detail

```http
GET /api/v1/bookings/:id
```

## 11.2 Admin APIs

Future endpoints:

```http
POST /api/v1/admin/ports
POST /api/v1/admin/operators
POST /api/v1/admin/vessels
POST /api/v1/admin/routes
POST /api/v1/admin/schedules
GET  /api/v1/admin/bookings
GET  /api/v1/admin/schedules/:id/manifest
```

## 11.3 Payment APIs

MVP:

```http
PATCH /api/v1/bookings/:id/mark-paid
```

Future:

```http
POST /api/v1/payments/webhook/:provider
GET  /api/v1/payments/:id
```

---

## 12. Booking Rules

- Booking must have at least one passenger.
- Booking expiry default is 15 minutes.
- Expired unpaid bookings should release capacity.
- Paid bookings should not release capacity unless refunded or cancelled.
- Booking code must be unique.
- Passenger count must match inserted passenger records.

---

## 13. Error Handling

Common errors:

| Scenario | Expected Error |
| --- | --- |
| Schedule not found | `404 Schedule not found` |
| Not enough seats | `400 Not enough seats available` |
| Booking locked | `400 Schedule is being booked. Please retry shortly.` |
| Booking not found | `404 Booking not found` |
| Invalid payment status transition | `400 Booking cannot be paid from status <status>` |

---

## 14. MVP Milestones

## Phase 1: Foundation

- Monorepo setup.
- Docker Compose setup.
- Supabase/PostgreSQL schema.
- NestJS base module setup.
- React base layout.

## Phase 2: Booking Core

- Schedule search API.
- Booking creation API.
- Passenger record creation.
- Redis inventory lock.
- Booking detail API.

## Phase 3: Payment MVP

- Manual mark-as-paid endpoint.
- Payment table integration.
- Booking status update.
- RabbitMQ `booking.paid` event.

## Phase 4: Admin Foundation

- Port CRUD.
- Operator CRUD.
- Vessel CRUD.
- Route CRUD.
- Schedule CRUD.

## Phase 5: Production Readiness

- Auth and role-based access control.
- Audit logs.
- Error tracking.
- API logging.
- Worker consumers.
- Deployment pipeline.

---

## 15. Success Metrics

- Search schedule success rate above 99%.
- Booking creation success rate above 98% when seats are available.
- Zero confirmed overbooking incidents.
- Average schedule search response below 500 ms.
- Average booking creation response below 1 second.
- Payment event processing latency below 5 seconds.

---

## 16. Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Overbooking | High | Redis lock and database validation |
| Payment webhook duplicate event | Medium | Idempotency key and webhook event log |
| Operator changes schedule after booking | High | Restrict edits for schedules with paid bookings |
| Redis unavailable | High | Fail safe and reject booking creation temporarily |
| RabbitMQ unavailable | Medium | Retry publish or use outbox pattern |
| Exposed Supabase service key | High | Backend-only secret management |

---

## 17. Open Questions

- Should booking support exact seat number selection or only capacity-based inventory?
- Should operators confirm bookings manually after payment?
- What payment provider will be used first?
- Should agents have credit balance or pay per booking?
- Should cancellation rules differ by operator?
- Should the system support return-trip booking in MVP?

---

## 18. Recommended Next Engineering Tasks

1. Add repository layer for Supabase queries.
2. Add admin CRUD modules for ports, operators, vessels, routes, and schedules.
3. Add payment table write when booking is marked as paid.
4. Add booking expiry worker.
5. Add RabbitMQ consumer worker app.
6. Add authentication and role-based access control.
7. Add seed data for Bali, Nusa Penida, Gili, Lombok routes.
8. Add frontend admin dashboard.
