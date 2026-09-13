-- Demo seed data: one vehicle, route slots (both directions) for every existing
-- route, and scheduled trips for the next 3 days so the app has bookable trips.
-- Safe to re-run: skips inserts where matching rows already exist.

insert into vehicles (plate_no, capacity, driver_name, driver_phone)
select 'DEMO-1234', 40, 'Karim Uddin', '01700000000'
where not exists (select 1 from vehicles where plate_no = 'DEMO-1234');

do $$
declare
  v_vehicle_id uuid;
  v_route record;
  v_slot_to uuid;
  v_slot_from uuid;
  v_day int;
  v_trip_date date;
begin
  select id into v_vehicle_id from vehicles where plate_no = 'DEMO-1234';

  for v_route in select id from routes where active = true loop
    -- one "to campus" slot and one "from campus" slot per route, if missing
    select id into v_slot_to from route_slots
      where route_id = v_route.id and direction = 'to_varsity'
      limit 1;
    if v_slot_to is null then
      insert into route_slots (route_id, direction, departure_time, arrival_time, vehicle_id, total_seats, fare)
      values (v_route.id, 'to_varsity', '08:00', '08:45', v_vehicle_id, 40, 50)
      returning id into v_slot_to;
    end if;

    select id into v_slot_from from route_slots
      where route_id = v_route.id and direction = 'from_varsity'
      limit 1;
    if v_slot_from is null then
      insert into route_slots (route_id, direction, departure_time, arrival_time, vehicle_id, total_seats, fare)
      values (v_route.id, 'from_varsity', '17:00', '17:45', v_vehicle_id, 40, 50)
      returning id into v_slot_from;
    end if;

    for v_day in 0..2 loop
      v_trip_date := current_date + v_day;

      if not exists (select 1 from trips where route_slot_id = v_slot_to and trip_date = v_trip_date) then
        insert into trips (trip_date, departure_time, direction, vehicle_id, total_seats, available_seats, status, route_slot_id)
        values (v_trip_date, '08:00', 'to_varsity', v_vehicle_id, 40, 40, 'scheduled', v_slot_to);
      end if;

      if not exists (select 1 from trips where route_slot_id = v_slot_from and trip_date = v_trip_date) then
        insert into trips (trip_date, departure_time, direction, vehicle_id, total_seats, available_seats, status, route_slot_id)
        values (v_trip_date, '17:00', 'from_varsity', v_vehicle_id, 40, 40, 'scheduled', v_slot_from);
      end if;
    end loop;
  end loop;
end $$;
