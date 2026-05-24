create extension if not exists "uuid-ossp";

create type booking_status as enum (
  'DRAFT',
  'PENDING_PAYMENT',
  'PAID',
  'CONFIRMED',
  'CANCELLED',
  'EXPIRED',
  'REFUNDED'
);

create table ports (
  id uuid primary key default uuid_generate_v4(),
  code varchar(20) unique not null,
  name varchar(120) not null,
  island varchar(120),
  city varchar(120),
  created_at timestamptz not null default now()
);

create table operators (
  id uuid primary key default uuid_generate_v4(),
  name varchar(120) not null,
  contact_email varchar(120),
  contact_phone varchar(50),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table vessels (
  id uuid primary key default uuid_generate_v4(),
  operator_id uuid not null references operators(id),
  name varchar(120) not null,
  capacity int not null check (capacity > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table routes (
  id uuid primary key default uuid_generate_v4(),
  origin_port_id uuid not null references ports(id),
  destination_port_id uuid not null references ports(id),
  distance_km numeric(10,2),
  estimated_duration_minutes int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint route_origin_destination_check check (origin_port_id <> destination_port_id)
);

create table schedules (
  id uuid primary key default uuid_generate_v4(),
  route_id uuid not null references routes(id),
  operator_id uuid not null references operators(id),
  vessel_id uuid not null references vessels(id),
  departure_time timestamptz not null,
  arrival_time timestamptz not null,
  base_price numeric(14,2) not null,
  currency varchar(3) not null default 'IDR',
  available_capacity int not null check (available_capacity >= 0),
  status varchar(30) not null default 'OPEN',
  created_at timestamptz not null default now(),
  constraint schedule_time_check check (arrival_time > departure_time)
);

create table customers (
  id uuid primary key default uuid_generate_v4(),
  full_name varchar(160) not null,
  email varchar(160),
  phone varchar(50) not null,
  created_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default uuid_generate_v4(),
  booking_code varchar(30) unique not null,
  customer_id uuid not null references customers(id),
  schedule_id uuid not null references schedules(id),
  status booking_status not null default 'PENDING_PAYMENT',
  passenger_count int not null check (passenger_count > 0),
  total_amount numeric(14,2) not null,
  currency varchar(3) not null default 'IDR',
  expires_at timestamptz not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table booking_passengers (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id) on delete cascade,
  full_name varchar(160) not null,
  nationality varchar(80),
  identity_type varchar(30),
  identity_number varchar(80),
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id),
  provider varchar(60) not null,
  provider_reference varchar(160),
  amount numeric(14,2) not null,
  currency varchar(3) not null default 'IDR',
  status varchar(30) not null default 'PENDING',
  paid_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create index idx_schedules_route_departure on schedules(route_id, departure_time);
create index idx_bookings_schedule_status on bookings(schedule_id, status);
create index idx_payments_booking on payments(booking_id);
