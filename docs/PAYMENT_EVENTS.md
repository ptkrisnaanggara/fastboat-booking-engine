# Payment Events

This feature provides an idempotent payment receive endpoint for development and future payment gateway integration.

## Endpoint

```http
POST /api/v1/admin/payments/{provider}/receive
X-Admin-Api-Key: <ADMIN_API_KEY>
Content-Type: application/json
```

## Example

```bash
curl -X POST http://localhost:3000/api/v1/admin/payments/manual/receive \
  -H "Content-Type: application/json" \
  -H "X-Admin-Api-Key: change-this-admin-key" \
  -d '{
    "bookingCode": "FB1234567890",
    "providerReference": "MANUAL-001",
    "amount": 175000,
    "currency": "IDR",
    "status": "PAID"
  }'
```

## Behavior

- Rejects missing `bookingCode` or `providerReference`.
- Checks duplicate payment by provider and provider reference.
- Inserts payment record into `payments`.
- Updates booking status to `PAID` when booking is still `PENDING_PAYMENT`.
- Publishes `booking.paid` and `payment.received` events.

## Notes

This endpoint is under `/admin`, so it is protected by `X-Admin-Api-Key` middleware.
