insert into ports (code, name, island, city) values
  ('SANUR', 'Sanur Harbour', 'Bali', 'Denpasar'),
  ('NP-BANJAR', 'Banjar Nyuh Harbour', 'Nusa Penida', 'Klungkung'),
  ('PADANGBAI', 'Padang Bai Harbour', 'Bali', 'Karangasem'),
  ('GILI-T', 'Gili Trawangan Harbour', 'Lombok/Gili', 'North Lombok')
on conflict (code) do nothing;

insert into operators (name, contact_email, contact_phone) values
  ('Bali Fastboat Demo Operator', 'ops@example.com', '6281234567890')
on conflict do nothing;

insert into vessels (operator_id, name, capacity)
select id, 'Demo Fastboat 01', 80
from operators
where name = 'Bali Fastboat Demo Operator'
limit 1;

insert into routes (origin_port_id, destination_port_id, distance_km, estimated_duration_minutes)
select origin.id, destination.id, 40, 45
from ports origin, ports destination
where origin.code = 'SANUR' and destination.code = 'NP-BANJAR'
and not exists (
  select 1 from routes r where r.origin_port_id = origin.id and r.destination_port_id = destination.id
);

insert into schedules (route_id, operator_id, vessel_id, departure_time, arrival_time, base_price, currency, available_capacity, status)
select r.id, o.id, v.id,
  (date_trunc('day', now()) + interval '1 day' + interval '09 hours')::timestamptz,
  (date_trunc('day', now()) + interval '1 day' + interval '09 hours 45 minutes')::timestamptz,
  175000,
  'IDR',
  80,
  'OPEN'
from routes r
join ports origin on origin.id = r.origin_port_id
join ports destination on destination.id = r.destination_port_id
join operators o on o.name = 'Bali Fastboat Demo Operator'
join vessels v on v.operator_id = o.id and v.name = 'Demo Fastboat 01'
where origin.code = 'SANUR' and destination.code = 'NP-BANJAR'
limit 1;
