create table if not exists routes (
  id uuid primary key default gen_random_uuid(),
  university text not null,
  label text not null,
  pickup_point text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists route_slots (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references routes(id) on delete cascade,
  direction text not null check (direction in ('to_varsity', 'from_varsity')),
  departure_time time not null,
  arrival_time time not null,
  vehicle_id uuid references vehicles(id) on delete set null,
  total_seats int not null check (total_seats > 0),
  fare int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_route_slots_route on route_slots(route_id);

alter table trips add column if not exists route_slot_id uuid references route_slots(id) on delete set null;
create index if not exists idx_trips_route_slot on trips(route_slot_id);
create unique index if not exists idx_trips_slot_date on trips(route_slot_id, trip_date) where route_slot_id is not null;

alter table routes enable row level security;
alter table route_slots enable row level security;

create policy "public read routes" on routes for select using (true);
create policy "public read route_slots" on route_slots for select using (true);
