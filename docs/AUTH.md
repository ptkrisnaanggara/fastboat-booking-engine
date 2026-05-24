# Admin API Authentication

Admin endpoints are protected by the `X-Admin-Api-Key` header.

## Environment

Add this variable to your local `.env` file:

```env
ADMIN_API_KEY=change-this-admin-key
```

## Header

```http
X-Admin-Api-Key: change-this-admin-key
```

## Protected Routes

All routes under this prefix are protected:

```txt
/api/v1/admin/*
```

Examples:

```bash
curl http://localhost:3000/api/v1/admin/ports \
  -H "X-Admin-Api-Key: change-this-admin-key"
```

```bash
curl http://localhost:3000/api/v1/admin/schedules/{scheduleId}/manifest \
  -H "X-Admin-Api-Key: change-this-admin-key"
```
