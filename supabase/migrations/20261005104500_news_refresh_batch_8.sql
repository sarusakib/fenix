select cron.unschedule('fenix-brain-source-refresh-daily')
where exists (select 1 from cron.job where jobname = 'fenix-brain-source-refresh-daily');

select cron.schedule(
  'fenix-brain-source-refresh-daily',
  '0 */6 * * *',
  $job$
    select net.http_post(
      url := 'https://lawdsvplbxfziihvmmva.supabase.co/functions/v1/fenix-brain-source-refresh',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-fenix-refresh-secret',
        (select decrypted_secret from vault.decrypted_secrets where name = 'fenix_brain_refresh_secret')
      ),
      body := '{"limit":8}'::jsonb,
      timeout_milliseconds := 120000
    ) as request_id;
  $job$
);