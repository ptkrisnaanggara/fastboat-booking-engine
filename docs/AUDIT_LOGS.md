# Audit Logs

Audit logs record admin mutations for operational traceability.

## Migration

Run:

```sql
infra/database/migrations/002_audit_logs.sql
```

## Table

```txt
audit_logs
```

Fields:

- `actor_type`
- `actor_id`
- `action`
- `resource`
- `resource_id`
- `before_data`
- `after_data`
- `metadata`
- `created_at`

## Tracked Admin Actions

The following actions are automatically recorded from `AdminService`:

- `create`
- `update`
- `deactivate`

## Example Query

```sql
select *
from audit_logs
where resource = 'schedules'
order by created_at desc;
```
