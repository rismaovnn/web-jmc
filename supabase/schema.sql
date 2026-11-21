-- Idempotent setup: run in Supabase SQL Editor, including when upgrading an existing project.
create table if not exists public.cms_sections (
  section text primary key check (section in ('hero','about','products','partners','leadership','contact','footer')),
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.cms_sessions (
  id text primary key,
  csrf text not null,
  expires_at timestamptz not null
);
create index if not exists cms_sessions_expires_at_idx on public.cms_sessions(expires_at);
create table if not exists public.cms_login_attempts (
  key text primary key,
  failures integer not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists cms_login_attempts_updated_at_idx on public.cms_login_attempts(updated_at);
-- Safe atomic limiter for concurrent requests on different serverless instances.
create or replace function public.cms_record_login_failure(p_key text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.cms_login_attempts (key, failures, updated_at) values (p_key, 1, now())
  on conflict (key) do update set
    failures = case when public.cms_login_attempts.updated_at < now() - interval '15 minutes' then 1 else least(10000, public.cms_login_attempts.failures + 1) end,
    updated_at = now();
end;
$$;

alter table public.cms_sections enable row level security;
alter table public.cms_sessions enable row level security;
alter table public.cms_login_attempts enable row level security;
revoke all on table public.cms_sections, public.cms_sessions, public.cms_login_attempts from anon, authenticated;
revoke all on function public.cms_record_login_failure(text) from public, anon, authenticated;
grant all on table public.cms_sections, public.cms_sessions, public.cms_login_attempts to service_role;
grant execute on function public.cms_record_login_failure(text) to service_role;

-- Public read-only images; upload/write only via server secret key.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('cms-images','cms-images',true,8388608,array['image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
