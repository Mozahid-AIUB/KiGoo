alter table verifications
  add constraint verifications_user_id_profiles_fkey
  foreign key (user_id) references profiles(id) on delete cascade;
