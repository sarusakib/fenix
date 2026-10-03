begin;

-- Store the user's birth date as private profile data.
alter table public.profiles
  add column if not exists date_of_birth date;

comment on column public.profiles.date_of_birth is
  'User date of birth for private profile data and form auto-fill; not exposed through public profile views.';

commit;
