-- FeniX master performance follow-up: cover the remaining FK used by Start/Legal relationships.
create index if not exists business_start_legal_progress_legal_item_id_idx
  on public.business_start_legal_progress (legal_item_id);
