create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  trip_id uuid not null references trips(id) on delete restrict,
  user_id uuid not null references profiles(id) on delete cascade,
  seat text not null,
  fare int not null default 0,
  status text not null default 'booked' check (status in ('booked', 'boarded', 'cancelled')),
  boarded_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_trip on bookings(trip_id);
create index if not exists idx_bookings_user on bookings(user_id);
create unique index if not exists idx_bookings_trip_seat_active
  on bookings(trip_id, seat) where status in ('booked', 'boarded');

alter table bookings enable row level security;

drop policy if exists "users read own bookings" on bookings;
create policy "users read own bookings" on bookings
  for select using (auth.uid() = user_id);

drop policy if exists "users insert own bookings" on bookings;
create policy "users insert own bookings" on bookings
  for insert with check (auth.uid() = user_id);

drop policy if exists "users cancel own bookings" on bookings;
create policy "users cancel own bookings" on bookings
  for update using (auth.uid() = user_id and status = 'booked')
  with check (status = 'cancelled');

-- Atomically claims a seat: fails if the trip is full or the seat is already
-- taken, so two riders racing for the same seat can't both succeed.
create or replace function public.create_booking(
  p_trip_id uuid,
  p_seat text
)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip trips;
  v_fare int;
  v_booking bookings;
begin
  select * into v_trip from trips where id = p_trip_id for update;

  if v_trip.id is null then
    raise exception 'Trip not found';
  end if;
  if v_trip.status <> 'scheduled' then
    raise exception 'Trip is not open for booking';
  end if;
  if v_trip.available_seats <= 0 then
    raise exception 'Trip is full';
  end if;

  select fare into v_fare from route_slots where id = v_trip.route_slot_id;

  insert into bookings (booking_code, trip_id, user_id, seat, fare)
  values (
    'KG-' || upper(substr(md5(random()::text), 1, 6)),
    p_trip_id,
    auth.uid(),
    p_seat,
    coalesce(v_fare, 0)
  )
  returning * into v_booking;

  update trips set available_seats = available_seats - 1 where id = p_trip_id;

  return v_booking;
end;
$$;

create or replace function public.cancel_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings;
begin
  select * into v_booking from bookings where id = p_booking_id and user_id = auth.uid() for update;

  if v_booking.id is null then
    raise exception 'Booking not found';
  end if;
  if v_booking.status <> 'booked' then
    raise exception 'Only booked (unboarded) bookings can be cancelled';
  end if;

  update bookings set status = 'cancelled' where id = p_booking_id;
  update trips set available_seats = available_seats + 1 where id = v_booking.trip_id;
end;
$$;
