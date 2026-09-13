create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null check (type in ('pickup_point', 'campus')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table locations enable row level security;
create policy "public read locations" on locations for select using (true);

insert into locations (name, type)
select distinct origin, 'pickup_point' from routes
on conflict (name) do nothing;

insert into locations (name, type)
select distinct destination, 'campus' from routes
on conflict (name) do nothing;

alter table routes add column if not exists origin_id uuid;
alter table routes add column if not exists destination_id uuid;

alter table routes drop constraint if exists routes_origin_id_fkey;
alter table routes drop constraint if exists routes_destination_id_fkey;
alter table routes add constraint routes_origin_id_fkey foreign key (origin_id) references locations(id);
alter table routes add constraint routes_destination_id_fkey foreign key (destination_id) references locations(id);

update routes r set origin_id = l.id from locations l where l.name = r.origin and r.origin_id is null;
update routes r set destination_id = l.id from locations l where l.name = r.destination and r.destination_id is null;

alter table routes alter column origin_id set not null;
alter table routes alter column destination_id set not null;
alter table routes drop column if exists origin;
alter table routes drop column if exists destination;
alter table routes drop column if exists university;
alter table routes drop column if exists pickup_point;
