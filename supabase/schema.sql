-- ── Helix Point Procurement Desk — Supabase schema ──────────────────
-- Run this once in your Supabase project:
--   Dashboard → SQL Editor → New query → paste all of this → Run.

create extension if not exists "pgcrypto";

-- Saved RFQ / comparison rounds, shared across the team
create table if not exists rounds (
  id          uuid primary key default gen_random_uuid(),
  ref         text,
  grade       text,
  density     numeric,
  inquiry     jsonb not null default '[]',
  suppliers   jsonb not null default '[]',
  verdict     text,
  created_by  text default 'Team',
  created_at  timestamptz not null default now()
);

-- Shared supplier directory / scorecard
create table if not exists suppliers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  scores      jsonb not null default '[]',
  note        text default '',
  updated_by  text default 'Team',
  updated_at  timestamptz not null default now()
);

-- Row Level Security ---------------------------------------------------
alter table rounds    enable row level security;
alter table suppliers enable row level security;

-- Internal team tool: anyone who has the site URL (and the public anon
-- key) can read/write. Fine for an internal shared tool.
-- To lock down later, replace these with Supabase Auth policies (see README).
drop policy if exists "anon all rounds" on rounds;
drop policy if exists "anon all suppliers" on suppliers;
create policy "anon all rounds"    on rounds    for all to anon using (true) with check (true);
create policy "anon all suppliers" on suppliers for all to anon using (true) with check (true);
