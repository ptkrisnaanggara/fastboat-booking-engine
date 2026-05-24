# Fastboat Booking Engine API

Base URL:

```txt
http://localhost:3000/api/v1
```

## Admin Resources

Supported resources:

```txt
ports
operators
vessels
routes
schedules
```

### List resources

```http
GET /admin/{resource}
```

Example:

```bash
curl http://localhost:3000/api/v1/admin/ports
```

### Create port

```http
POST /admin/ports
Content-Type: application/json
```

```json
{
  "code": "SANUR",
  "name": "Sanur Harbour",
  "island": "Bali",
  "city": "Denpasar"
}
```

### Create operator

```json
{
  "name": "Bali Fastboat Demo Operator",
  "contact_email": "ops@example.com",
  "contact_phone": "6281234567890"
}
```

### Create vessel

```json
{
  "operator_id": "operator-uuid",
  "name": "Demo Fastboat 01",
  "capacity": 80
}
```

### Create route

```json
{
  "origin_port_id": "origin-port-uuid",
  "destination_port_id": "destination-port-uuid",
  "distance_km": 40,
  "estimated_duration_minutes": 45
}
```

### Create schedule

```json
{
  "route_id": "route-uuid",
  "operator_id": "operator-uuid",
  "vessel_id": "vessel-uuid",
  "departure_time": "2026-05-25T09:00:00+08:00",
  "arrival_time": "2026-05-25T09:45:00+08:00",
  "base_price": 175000,
  "currency": "IDR",
  "available_capacity": 80,
  "status": "OPEN"
}
```

## Public Schedule Search

```http
GET /schedules?originPortId=<uuid>&destinationPortId=<uuid>&departureDate=2026-05-25&passengers=2
```

## Create Booking

```http
POST /bookings
Content-Type: application/json
```

```json
{
  "scheduleId": "schedule-uuid",
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

## Get Booking Detail

```http
GET /bookings/{bookingId}
```

## Mark Booking Paid

```http
PATCH /bookings/{bookingId}/mark-paid
```

This endpoint:

- validates booking status
- writes a row to `payments`
- updates booking status to `PAID`
- publishes `booking.paid` event

## Passenger Manifest

```http
GET /admin/schedules/{scheduleId}/manifest
```

Only bookings with `PAID` or `CONFIRMED` status are included.
