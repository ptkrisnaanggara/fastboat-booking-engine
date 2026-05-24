# Booking Expiry

Unpaid bookings should not hold inventory forever. The expiry feature finds overdue `PENDING_PAYMENT` bookings, marks them as `EXPIRED`, restores schedule capacity, and publishes a `booking.expired` event.

## Endpoint

```http
POST /api/v1/admin/bookings/expiry/run?limit=50
X-Admin-Api-Key: <ADMIN_API_KEY>
```

## Example

```bash
curl -X POST "http://localhost:3000/api/v1/admin/bookings/expiry/run?limit=50" \
  -H "X-Admin-Api-Key: change-this-admin-key"
```

## Behavior

For each overdue booking:

1. Find booking with status `PENDING_PAYMENT` and `expires_at < now()`.
2. Update booking status to `EXPIRED`.
3. Restore schedule `available_capacity` using booking passenger count.
4. Publish RabbitMQ event `booking.expired`.

## Production Recommendation

Run this endpoint from a scheduler such as Kubernetes CronJob, GitHub Actions schedule, or a dedicated worker process every 1-5 minutes.
