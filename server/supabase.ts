/** Supabase REST transport. Runs ONLY on the server (never import from src/).
 * Uses the legacy service_role JWT. Do not put this secret in any VITE_ variable.
 */
import type { SectionKey } from '../src/cms/schema';

export const useSupabase = process.env.VERCEL === '1' || process.env.CMS_STORAGE === 'supabase';
export const BUCKET = 'cms-images';

type CmsRow = { section: SectionKey; value: unknown };
type CmsSessionRow = { id: string; csrf: string; expires_at: string };

function settings() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key || !/^https:\/\//.test(url)) {
    throw new Error('Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only).');
  }
  return { url, key };
}

async function request<T>(route: string, method: string, body?: string | Uint8Array, extraHeaders: Record<string, string> = {}): Promise<T> {
  const { url, key } = settings();
  const response = await fetch(`${url}${route}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      ...(typeof body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      ...extraHeaders,
    },
    ...(body === undefined ? {} : { body: body as BodyInit }),
    signal: AbortSignal.timeout(20000),
    cache: 'no-store',
  });
  if (!response.ok) {
    // Never print keys or response bodies (which can contain private data).
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
  await request('/rest/v1/cms_sessions', 'POST', JSON.stringify([{ id, csrf, expires_at }]), {
    Prefer: 'return=minimal',
  });
}
export async function deleteSession(id: string): Promise<void> {
  await request(`/rest/v1/cms_sessions?id=eq.${encodeURIComponent(id)}`, 'DELETE');
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
