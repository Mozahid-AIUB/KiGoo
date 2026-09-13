alter table routes add column if not exists origin text;
alter table routes add column if not exists destination text;

update routes set origin = pickup_point, destination = university where origin is null;

alter table routes alter column origin set not null;
alter table routes alter column destination set not null;
alter table routes drop column if exists label;
