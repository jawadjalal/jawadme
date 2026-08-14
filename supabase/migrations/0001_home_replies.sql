-- Messages left in the reply box at the bottom of the homepage.
--
-- Run this once against the Supabase "Portfolio" project (SQL Editor → New
-- query → paste → Run). Until it exists, /api/reply falls back to writing each
-- message to the platform logs and reports it as unstored.
--
-- Mirrors design_briefs: rows are written by the API route and read by
-- /responses, both with the service-role key. RLS is on with no policies at all,
-- so anon and authenticated can see nothing — only the service role, which
-- bypasses it by design.

create table if not exists public.home_replies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  message text not null,
  -- Optional: someone can leave a note without leaving a way to be answered.
  email text,
  referer text,
  user_agent text,
  status text not null default 'new'
);

alter table public.home_replies enable row level security;

-- The inbox reads newest-first and nothing else ever queries this table.
create index if not exists home_replies_created_at_idx
  on public.home_replies (created_at desc);
