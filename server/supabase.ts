/** Server-only Supabase REST and Storage transport. NEVER import from src/. */
import type { SectionKey } from '../src/cms/schema.js';

export const useSupabase = process.env.VERCEL === '1' || process.env.CMS_STORAGE === 'supabase';
export const BUCKET = 'cms-images';
type CmsRow = { section: SectionKey; value: unknown };
type CmsSessionRow = { id: string; csrf: string; expires_at: string };
type LoginRow = { failures: number; updated_at: string };

function settings() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  // Prefer Supabase's current sb_secret_* API keys; legacy JWTs still work.
  const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!url || !/^https:\/\/[\w.-]+(?::\d+)?$/.test(url) || !key || key.startsWith('sb_publishable_')) {
    throw new Error('Supabase storage is not configured: set SUPABASE_URL and SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY) on the server.');
  }
  return { url, key };
}
export function validateSupabaseConfig() { settings(); }

async function request<T>(route: string, method: string, body?: string | Uint8Array, extraHeaders: Record<string, string> = {}): Promise<T> {
  const { url, key } = settings();
  const response = await fetch(`${url}${route}`, {
    method,
    headers: {
      apikey: key,
      // sb_secret_* keys are NOT JWTs; sending them as Authorization Bearer causes Invalid JWT.
      ...(!key.startsWith('sb_secret_') ? { Authorization: `Bearer ${key}` } : {}),
      Accept: 'application/json',
      ...(typeof body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      ...extraHeaders,
    },
    ...(body === undefined ? {} : { body: body as BodyInit }),
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Supabase ${method} ${route.split('?')[0]} failed (HTTP ${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  const payload = await response.text();
  return (payload ? JSON.parse(payload) : undefined) as T;
}

export async function getSections(): Promise<CmsRow[]> {
  return request<CmsRow[]>('/rest/v1/cms_sections?select=section,value', 'GET');
}
export async function putSection(section: SectionKey, value: unknown): Promise<void> {
  await request('/rest/v1/cms_sections?on_conflict=section', 'POST', JSON.stringify([{ section, value }]), {
    Prefer: 'resolution=merge-duplicates,return=minimal',
  });
}
export async function getSession(id: string): Promise<CmsSessionRow | null> {
  const rows = await request<CmsSessionRow[]>(
    `/rest/v1/cms_sessions?select=id,csrf,expires_at&id=eq.${encodeURIComponent(id)}&limit=1`, 'GET');
  return rows[0] ?? null;
}
export async function putSession(id: string, csrf: string, expires_at: string): Promise<void> {
  // Cleanup stale sessions/limits opportunistically on each admin login; no cron dependency.
  await request(`/rest/v1/cms_sessions?expires_at=lt.${encodeURIComponent(new Date().toISOString())}`, 'DELETE');
  await request(`/rest/v1/cms_login_attempts?updated_at=lt.${encodeURIComponent(new Date(Date.now()-24*60*60_000).toISOString())}`, 'DELETE');
  await request('/rest/v1/cms_sessions', 'POST', JSON.stringify([{ id, csrf, expires_at }]), {
    Prefer: 'return=minimal',
  });
}
export async function deleteSession(id: string): Promise<void> {
  await request(`/rest/v1/cms_sessions?id=eq.${encodeURIComponent(id)}`, 'DELETE');
}
// Shared rate-limiting between Vercel instances. RPC uses an atomic INSERT .. ON CONFLICT.
export async function getLoginFailures(key: string): Promise<number> {
  const rows = await request<LoginRow[]>(
    `/rest/v1/cms_login_attempts?select=failures,updated_at&key=eq.${encodeURIComponent(key)}&limit=1`, 'GET');
  const row = rows[0];
  return row && Date.parse(row.updated_at) > Date.now() - 15 * 60_000 ? row.failures : 0;
}
export async function recordLoginFailure(key: string): Promise<void> {
  await request('/rest/v1/rpc/cms_record_login_failure', 'POST', JSON.stringify({ p_key: key }));
}
export async function clearLoginFailures(key: string): Promise<void> {
  await request(`/rest/v1/cms_login_attempts?key=eq.${encodeURIComponent(key)}`, 'DELETE');
}
export async function uploadCmsImage(filename: string, body: Buffer): Promise<string> {
  const key = `uploads/${filename}`;
  await request(`/storage/v1/object/${BUCKET}/${key}`, 'POST', new Uint8Array(body), {
    'Content-Type': 'image/webp',
    'Cache-Control': 'max-age=31536000',
    'x-upsert': 'false',
  });
  return publicCmsImageUrl(key);
}
export function publicCmsImageUrl(objectKey: string): string {
  const { url } = settings();
  return `${url}/storage/v1/object/public/${BUCKET}/${objectKey.split('/').map(encodeURIComponent).join('/')}`;
}
