begin;

update public.news_posts
set status='archived', updated_at=timezone('utc',now())
where automation_status='review_queue'
  and source_url ~* '/(category|topic|tag|author|page|search|archive|feed|wp-json)(/|$)/';

update public.news_posts
set status='archived', updated_at=timezone('utc',now())
where automation_status='auto_official'
  and source_url ~* '/menu/page/'
  and source_name='Chief Judicial Magistrate Court, Feni'
  and source_url !~* '/(notice|notices)(/|$)'
  and source_url !~* '/(form-(administrative|legal-aid|circulars))(/|$)/';

update public.fenix_brain_source_refresh
set next_refresh_at=now(), enabled=true, last_error=null, updated_at=now()
where parser_key in ('notice_html','news_html');

commit;