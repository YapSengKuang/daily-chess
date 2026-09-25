-- Run this in the Supabase SQL editor.

create table if not exists public.users (
  id text primary key,
  email text,
  name text,
  image text,
  created_at timestamptz not null default now()
);

create table if not exists public.attempts (
  user_id text not null references public.users (id) on delete cascade,
  puzzle_date date not null,
  solved boolean not null,
  failed boolean not null,
  completed boolean not null default true,
  results jsonb not null default '[]'::jsonb,
  lives_left integer,
  updated_at timestamptz not null default now(),
  primary key (user_id, puzzle_date)
);

alter table public.users enable row level security;
alter table public.attempts enable row level security;
