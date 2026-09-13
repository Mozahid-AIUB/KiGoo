-- Demo seed data: adds route slots every 4 hours (both directions) for every
-- active route, and generates trips from now through 10pm tomorrow so the
-- app always has a "next trip" to show. Safe to re-run.

insert into vehicles (plate_no, capacity, driver_name, driver_phone)
select 'DEMO-1234', 40, 'Karim Uddin', '01700000000'
where not exists (select 1 from vehicles where plate_no = 'DEMO-1234');

do $$
declare
  v_vehicle_id uuid;
  v_route record;
  v_slot_id uuid;
  v_direction text;
  v_hour int;
  v_day int;
  v_trip_date date;
  v_dep_time time;
  v_arr_time time;
  v_slot_times time[] := array['06:00','10:00','14:00','18:00','22:00']::time[];
  v_horizon timestamp := (current_date + 1) + time '22:00';
begin
  select id into v_vehicle_id from vehicles where plate_no = 'DEMO-1234';

  for v_route in select id from routes where active = true loop
    foreach v_direction in array array['to_varsity', 'from_varsity'] loop
      -- clear any single leftover slot from the old seed so times don't collide
      for v_dep_time in select unnest(v_slot_times) loop
        select id into v_slot_id from route_slots
          where route_id = v_route.id and direction = v_direction and departure_time = v_dep_time
          limit 1;

        if v_slot_id is null then
          v_arr_time := v_dep_time + interval '45 minutes';
          insert into route_slots (route_id, direction, departure_time, arrival_time, vehicle_id, total_seats, fare)
          values (v_route.id, v_direction, v_dep_time, v_arr_time, v_vehicle_id, 40, 50)
          returning id into v_slot_id;
        end if;

        for v_day in 0..1 loop
          v_trip_date := current_date + v_day;
          if (v_trip_date + v_dep_time) <= v_horizon and (v_trip_date + v_dep_time) >= now() - interval '1 hour' then
            if not exists (select 1 from trips where route_slot_id = v_slot_id and trip_date = v_trip_date) then
              insert into trips (trip_date, departure_time, direction, vehicle_id, total_seats, available_seats, status, route_slot_id)
              values (v_trip_date, v_dep_time, v_direction, v_vehicle_id, 40, 40, 'scheduled', v_slot_id);
            end if;
          end if;
        end loop;
      end loop;
    end loop;
  end loop;
end $$;
