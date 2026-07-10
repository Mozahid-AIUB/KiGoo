create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  plate_no text not null unique,
  capacity int not null check (capacity > 0),
  driver_name text,
  driver_phone text,
  created_at timestamptz not null default now()
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  trip_date date not null,
  departure_time time not null,
  direction text not null check (direction in ('to_varsity', 'from_varsity')),
  vehicle_id uuid not null references vehicles(id) on delete restrict,
  total_seats int not null check (total_seats > 0),
  available_seats int not null check (available_seats >= 0),
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_trips_date on trips(trip_date);
create index if not exists idx_trips_vehicle on trips(vehicle_id);

alter table vehicles enable row level security;
alter table trips enable row level security;

create policy "public read vehicles" on vehicles for select using (true);
create policy "public read trips" on trips for select using (true);
