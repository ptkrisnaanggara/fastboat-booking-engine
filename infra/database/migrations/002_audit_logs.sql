create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_type varchar(50) not null default 'system',
  actor_id varchar(120),
  action varchar(80) not null,
  resource varchar(80) not null,
  resource_id uuid,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_resource on audit_logs(resource, resource_id);
create index if not exists idx_audit_logs_action on audit_logs(action);
create index if not exists idx_audit_logs_created_at on audit_logs(created_at);
