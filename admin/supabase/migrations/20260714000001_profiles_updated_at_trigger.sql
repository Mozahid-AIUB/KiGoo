create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profiles_updated on profiles;

create trigger on_profiles_updated
  before update on profiles
  for each row execute procedure public.set_updated_at();
