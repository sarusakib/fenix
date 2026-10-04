begin;

drop policy if exists news_admin_read on public.news_posts;
drop policy if exists news_public_read on public.news_posts;

create policy news_anon_read
  on public.news_posts
  for select
  to anon
  using (status = 'published');

create policy news_authenticated_read
  on public.news_posts
  for select
  to authenticated
  using ((status = 'published') or (select is_fenix_admin()));

drop policy if exists fenix_blood_donors_own_select on public.fenix_blood_donors;
drop policy if exists fenix_blood_donors_public_select on public.fenix_blood_donors;

create policy fenix_blood_donors_anon_select
  on public.fenix_blood_donors
  for select
  to anon
  using (
    is_public = true
    and availability = 'available'
    and private.is_fenix_user_active(user_id)
  );

create policy fenix_blood_donors_authenticated_select
  on public.fenix_blood_donors
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (is_public = true and availability = 'available' and private.is_fenix_user_active(user_id))
    or (select is_fenix_admin())
  );

commit;
