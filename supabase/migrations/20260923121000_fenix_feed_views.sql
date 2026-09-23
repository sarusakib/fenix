begin;

create or replace view public.fenix_public_question_feed
with (security_invoker=true)
as
select
  q.id,q.title,q.body,q.created_at,q.updated_at,q.author_id,q.topic_id,
  p.full_name as author_name,p.username as author_username,p.avatar_url as author_avatar_url,
  t.slug as topic_slug,t.name_bn as topic_name_bn,t.name_en as topic_name_en,
  coalesce((select count(*) from public.fenix_answers a where a.question_id=q.id and a.deleted_at is null),0)::int as answer_count,
  coalesce((select sum(v.value) from public.fenix_content_votes v where v.content_type='question' and v.content_id=q.id),0)::int as score
from public.fenix_questions q
join public.profiles p on p.id=q.author_id
left join public.fenix_topics t on t.id=q.topic_id
where q.deleted_at is null
  and p.feed_public
  and private.is_fenix_user_active(q.author_id);

create or replace view public.fenix_public_answer_feed
with (security_invoker=true)
as
select
  a.id,a.question_id,a.body,a.created_at,a.updated_at,a.author_id,
  p.full_name as author_name,p.username as author_username,p.avatar_url as author_avatar_url,
  coalesce((select sum(v.value) from public.fenix_content_votes v where v.content_type='answer' and v.content_id=a.id),0)::int as score
from public.fenix_answers a
join public.profiles p on p.id=a.author_id
where a.deleted_at is null
  and p.feed_public
  and private.is_fenix_user_active(a.author_id);

revoke all on public.fenix_public_question_feed from public,anon,authenticated;
grant select on public.fenix_public_question_feed to anon,authenticated;
revoke all on public.fenix_public_answer_feed from public,anon,authenticated;
grant select on public.fenix_public_answer_feed to anon,authenticated;

commit;