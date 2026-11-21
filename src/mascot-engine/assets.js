/** Lazy, abort-aware browser atlas cache. Pages are decoded on demand, with LRU eviction. */
export class AtlasCache {
  constructor(manifest, base, { cachePages = 5 } = {}) {
    this.manifest = manifest;
    this.base = base;
    this.cachePages = cachePages;
    this.entries = new Map();
    this.pending = new Map();
    this.disposed = false;
  }
  get(page) {
    if (!this.entries.has(page)) return null;
    const image = this.entries.get(page);
    this.entries.delete(page);
    this.entries.set(page, image);
    return image;
  }
  load(page) {
    if (this.disposed || page < 0 || page >= this.manifest.atlas.pageCount) return Promise.resolve(null);
    const ready = this.get(page);
    if (ready) return Promise.resolve(ready);
    if (this.pending.has(page)) return this.pending.get(page);
    const url = new URL(this.manifest.atlas.pages[page].url, this.base).href;
    const task = (async () => {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      await img.decode();
      if (this.disposed) return null;
      this.entries.set(page, img);
      while (this.entries.size > this.cachePages) {
        const oldest = this.entries.keys().next().value;
        this.entries.delete(oldest);
      }
      return img;
    })().catch(error => {
      console.warn(`Sprite atlas unavailable (${page}):`, error);
      return null;
    }).finally(() => this.pending.delete(page));
    this.pending.set(page, task);
    return task;
  }
  prefetch(frame, direction = 0) {
    const perPage = this.manifest.atlas.framesPerPage;
    const currentPage = Math.floor(Math.max(0, frame) / perPage);
    this.load(currentPage);
    this.load(currentPage + (direction >= 0 ? 1 : -1));
  }
  dispose() { this.disposed = true; this.pending.clear(); this.entries.clear(); }
}

export async function loadManifest(manifestUrl) {
  const url = new URL(manifestUrl, document.baseURI);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Cannot load sprite manifest: ${response.status} ${url.href}`);
  const manifest = await response.json();
  return { manifest, base: new URL('.', url) };
}
