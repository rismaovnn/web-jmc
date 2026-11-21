/** Single JSON transport for the same-origin API. Never parse a Vercel HTML error as JSON. */
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); this.name = 'ApiError'; }
}

export async function requestJson<T>(path: `/api/${string}`, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30_000);
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  try {
    const response = await fetch(path, {
      credentials: 'same-origin', cache: 'no-store', ...options, signal: controller.signal,
    });
    const contentType = response.headers.get('content-type') || '';
    if (!/\bapplication\/(?:[a-z0-9.+-]*\+)?json\b/i.test(contentType)) {
      throw new ApiError(
        `API ${path} returned a non-JSON response (HTTP ${response.status}). Check Vercel Functions, rewrites and deployment logs.`,
        response.status,
      );
    }
    let body: unknown;
    try { body = await response.json(); }
    catch { throw new ApiError(`API ${path} returned malformed JSON (HTTP ${response.status}).`, response.status); }
    if (!response.ok) {
      const detail = body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
        ? body.message : `API request failed (HTTP ${response.status}).`;
      throw new ApiError(detail, response.status);
    }
    return body as T;
  } catch (error) {
    if (controller.signal.aborted && !options.signal?.aborted) {
      throw new ApiError(`API ${path} timed out. Please try again.`, 0);
    }
    if (error instanceof ApiError) throw error;
    if (error instanceof TypeError) throw new ApiError(`Cannot reach API ${path}. Check your connection and Vercel deployment.`, 0);
    throw error;
  } finally {
    window.clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}
