-- Adds Uttara<->AIUB, Mohammadpur<->AIUB, and Mirpur<->AIUB routes, each with
-- the same every-4-hours trip schedule as the NSU route. Reuses existing
-- pickup-point locations (matched case-insensitively) instead of duplicating
-- them. Safe to re-run.

insert into locations (name, type)
select 'AIUB', 'campus'
where not exists (select 1 from locations where lower(name) = 'aiub');

insert into locations (name, type)
select v.name, 'pickup_point'
from (values ('Uttara'), ('Mohammadpur'), ('Mirpur')) as v(name)
where not exists (select 1 from locations l where lower(l.name) = lower(v.name));

insert into routes (origin_id, destination_id, university, pickup_point)
select o.id, d.id, d.name, o.name
from locations o, locations d, (values ('Uttara'), ('Mohammadpur'), ('Mirpur')) as v(name)
where lower(o.name) = lower(v.name) and lower(d.name) = 'aiub'
  and not exists (
    select 1 from routes r where r.origin_id = o.id and r.destination_id = d.id
  );

do $$
declare
  v_vehicle_id uuid;
  v_route record;
  v_direction text;
  v_slot_id uuid;
  v_day int;
  v_trip_date date;
  v_dep_time time;
  v_arr_time time;
  v_slot_times time[] := array['06:00','10:00','14:00','18:00','22:00']::time[];
  v_horizon timestamp := (current_date + 1) + time '22:00';
begin
  select id into v_vehicle_id from vehicles where plate_no = 'DEMO-1234';

  for v_route in
    select r.id
    from routes r
    join locations o on o.id = r.origin_id
    join locations d on d.id = r.destination_id
    where lower(o.name) in ('uttara', 'mohammadpur', 'mirpur') and lower(d.name) = 'aiub'
  loop
    foreach v_direction in array array['to_varsity', 'from_varsity'] loop
      foreach v_dep_time in array v_slot_times loop
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
