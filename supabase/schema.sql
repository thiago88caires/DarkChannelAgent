-- DarkChannelAgent schema (Supabase / Postgres)

-- Basic roles expected by PostgREST/Supabase
do $$ begin
  create role anon noinherit; exception when duplicate_object then null; end $$;
do $$ begin
  create role authenticated noinherit; exception when duplicate_object then null; end $$;
do $$ begin
  create role service_role noinherit; exception when duplicate_object then null; end $$;

grant usage on schema public to anon, authenticated, service_role;
grant select on all tables in schema public to anon, authenticated;
grant all privileges on all tables in schema public to service_role;
alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant all on tables to service_role;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  "NOME" text,
  "EMAIL" text unique not null,
  "CREDITOS" integer not null default 0,
  is_admin boolean not null default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.youtube_channels (
  id uuid primary key default gen_random_uuid(),
  user_email text not null references public.users("EMAIL") on delete cascade,
  name text not null,
  oauth_encrypted jsonb not null,
  created_at timestamp with time zone default now()
);

create type video_status as enum ('Draft', 'Waiting', 'Executing', 'Done');

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  "VIDEO ID" text unique not null,
  "VIDEO FILE" text,
  "USER EMAIL" text not null references public.users("EMAIL") on delete cascade,
  "LANGUAGE" text not null,
  "VIDEO YT URL" text,
  "STATUS" video_status not null default 'Waiting',
  GENRE text,
  SCREENPLAY text,
  DESCRIPTION text,
  STRUCTURE text,
  TONE text,
  "VIDEO TITLE" text,
  "VIDEO DESCRIPTION" text,
  "VIDEO TAGS" text,
  ELEMENTS text,
  "COMPOSITION RULES" text,
  TECHNIQUES text,
  "LIGHTING AND ATMOSPHERE" text,
  META jsonb,
  created_at timestamp with time zone default now()
);

-- Genres tables
create table if not exists public.genres_pt_br (
  GENRE text primary key,
  DESCRIPTION text,
  STRUCTURE text,
  TONE text,
  "VIDEO TITLE" text,
  "VIDEO DESCRIPTION" text,
  "VIDEO TAGS" text,
  ELEMENTS text,
  "COMPOSITION RULES" text,
  TECHNIQUES text,
  "LIGHTING AND ATMOSPHERE" text,
  updated_at timestamp with time zone default now()
);

create table if not exists public.genres_en (like public.genres_pt_br including all);
create table if not exists public.genres_es (like public.genres_pt_br including all);

-- Optional ledger
create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_email text not null references public.users("EMAIL") on delete cascade,
  delta integer not null,
  type text not null check (type in ('purchase','debit','adjust')),
  ref text,
  created_at timestamp with time zone default now()
);

-- Helpful indexes
create index if not exists idx_videos_user_email on public.videos ("USER EMAIL");
create index if not exists idx_videos_status on public.videos ("STATUS");
create index if not exists idx_videos_created_at on public.videos (created_at desc);

-- RLS policies (example – adjust to your project)
alter table public.users enable row level security;
alter table public.youtube_channels enable row level security;
alter table public.videos enable row level security;

-- Users: self-read/update; admins via service role
create policy if not exists users_self_select on public.users for select using (auth.jwt() ->> 'email' = "EMAIL");
create policy if not exists users_self_update on public.users for update using (auth.jwt() ->> 'email' = "EMAIL");

-- YouTube channels: owner only
create policy if not exists yt_owner_select on public.youtube_channels for select using (auth.jwt() ->> 'email' = user_email);
create policy if not exists yt_owner_insert on public.youtube_channels for insert with check (auth.jwt() ->> 'email' = user_email);
create policy if not exists yt_owner_delete on public.youtube_channels for delete using (auth.jwt() ->> 'email' = user_email);

-- Videos: owner only
create policy if not exists videos_owner_select on public.videos for select using (auth.jwt() ->> 'email' = "USER EMAIL");
create policy if not exists videos_owner_insert on public.videos for insert with check (auth.jwt() ->> 'email' = "USER EMAIL");
create policy if not exists videos_owner_update on public.videos for update using (auth.jwt() ->> 'email' = "USER EMAIL");
