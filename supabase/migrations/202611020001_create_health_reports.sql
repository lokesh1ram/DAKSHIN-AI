create table if not exists public.health_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  summary text not null,
  overall_status text not null check (overall_status in ('good', 'borderline', 'at-risk')),
  metrics jsonb not null default '[]'::jsonb,
  positives jsonb not null default '[]'::jsonb,
  negatives jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  raw_values jsonb
);

alter table public.health_reports
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists health_reports_user_created_at_idx
  on public.health_reports (user_id, created_at desc);

alter table public.health_reports enable row level security;
