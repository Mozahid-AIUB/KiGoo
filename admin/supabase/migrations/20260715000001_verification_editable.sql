alter table verifications add column if not exists department text;

insert into storage.buckets (id, name, public)
values ('id-cards', 'id-cards', false)
on conflict (id) do nothing;

create policy "users read own id card" on storage.objects
  for select using (bucket_id = 'id-cards' and owner = auth.uid());

create policy "users upload own id card" on storage.objects
  for insert with check (bucket_id = 'id-cards' and owner = auth.uid());

create policy "users update own id card" on storage.objects
  for update using (bucket_id = 'id-cards' and owner = auth.uid());

create policy "users update own verification" on verifications
  for update using (auth.uid() = user_id and status in ('pending', 'rejected'));
