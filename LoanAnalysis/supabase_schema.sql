create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  phone_encrypted text not null,
  phone_hash text not null,
  session_id text not null,
  user_id text null,
  idempotency_key text not null,
  source text null default 'loan_insight',
  lead_stage text null check (lead_stage in ('gate2', 'gate3', 'eligibility_result')),
  top_scenarios text[] null,
  cluster_snapshot text null,
  metadata_json jsonb null,
  created_at timestamptz not null default now()
);

create unique index if not exists leads_phone_session_unique
  on public.leads (phone_hash, session_id);

create unique index if not exists leads_idempotency_key_unique
  on public.leads (idempotency_key);

create table if not exists public.loan_insight_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  session_id text not null,
  user_id text null,
  event_name text not null,
  payload jsonb null,
  created_at timestamptz not null default now()
);

create index if not exists loan_insight_events_session_idx
  on public.loan_insight_events (session_id, created_at desc);

-- RLS policies for API-driven inserts.
alter table public.leads enable row level security;
alter table public.loan_insight_events enable row level security;

drop policy if exists leads_insert_policy on public.leads;
create policy leads_insert_policy
  on public.leads
  for insert
  to anon, authenticated, service_role
  with check (true);

drop policy if exists leads_select_policy on public.leads;
create policy leads_select_policy
  on public.leads
  for select
  to anon, authenticated, service_role
  using (true);

drop policy if exists loan_insight_events_insert_policy on public.loan_insight_events;
create policy loan_insight_events_insert_policy
  on public.loan_insight_events
  for insert
  to anon, authenticated, service_role
  with check (true);

drop policy if exists loan_insight_events_select_policy on public.loan_insight_events;
create policy loan_insight_events_select_policy
  on public.loan_insight_events
  for select
  to anon, authenticated, service_role
  using (true);

-- If table already existed with older lead_stage constraint, migrate it safely.
do $$
begin
  alter table public.leads drop constraint if exists leads_lead_stage_check;
  alter table public.leads
    add constraint leads_lead_stage_check
    check (lead_stage in ('gate2', 'gate3', 'eligibility_result'));
exception
  when undefined_table then
    null;
end $$;
