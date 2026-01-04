create extension if not exists pgcrypto;

create table if not exists public.topic_snapshots (
  bucket_id text not null,
  snapshot_date date not null,
  snapshot_json jsonb not null,
  created_at timestamptz not null default now(),
  primary key (bucket_id, snapshot_date)
);

create table if not exists public.user_events (
  id uuid not null default gen_random_uuid(),
  user_id text not null,
  bucket_id text not null,
  snapshot_date date not null,
  event_type text not null,
  topic_id text,
  subtopic_id text,
  dwell_ms integer,
  created_at timestamptz not null default now(),
  primary key (id)
);

create table if not exists public.user_topic_scores (
  user_id text not null,
  topic_id text not null,
  score double precision not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);
