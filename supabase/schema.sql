-- Run ONCE in Supabase Dashboard > SQL Editor.
-- Only the server-side service_role key can access CMS content and sessions through API.
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
create index if not exists cms_sessions_expires_at_idx on public.cms_sessions (expires_at);

alter table public.cms_sections enable row level security;
alter table public.cms_sessions enable row level security;
-- No policies for anon/authenticated; request access using server-side service_role only.
revoke all on table public.cms_sections, public.cms_sessions from anon, authenticated;
grant all on table public.cms_sections, public.cms_sessions to service_role;

-- Public bucket: website visitors can view images; only server-side service_role can upload.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cms-images', 'cms-images', true, 8388608, array['image/webp'])
on conflict (id) do update set public = excluded.public;
-- No public INSERT/UPDATE/DELETE policies. Service role bypasses RLS.
