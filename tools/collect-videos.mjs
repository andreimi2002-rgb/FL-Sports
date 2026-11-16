// One-off seed/backfill. Runtime collection uses RSS only; no API key, no video downloads.
import { readFile, writeFile } from 'node:fs/promises';
import { VIDEO_SOURCES, videoKind, validVideoId } from '../js/video-data.js';
import { collectCatalog, mergeCatalog, watchMetadata } from '../netlify/lib/video-catalog.mjs';
const file = new URL('../data/video-catalog.json', import.meta.url);
const previous = JSON.parse(await readFile(file, 'utf8'));
const result = await collectCatalog(previous);
if (process.argv.includes('--backfill')) {
  for (const source of VIDEO_SOURCES) {
    try {
      const r = await fetch(source.url + '/videos', { signal: AbortSignal.timeout(10000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const html = await r.text();
      // /videos contains long-form uploads; shorts and live tabs are separate.
      const ids = [...new Set([...html.matchAll(/"videoId":"([\w-]{11})"/g)].map(m => m[1]))].filter(validVideoId).slice(0, 8);
      const batch = [];
      for (const id of ids) {
        try {
          const response = await fetch('https://www.youtube.com/watch?v=' + id, { signal: AbortSignal.timeout(6000) });
          if (!response.ok) continue;
          const m = watchMetadata(await response.text(), source);
          if (m.title && m.published) batch.push({ id, source: source.id, l: source.l, kind: videoKind(m.title, source.id), seconds: null, ...m, metadataChecked: new Date().toISOString() });
        } catch { /* optional backfill */ }
      }
      result.videos = mergeCatalog(result.videos, batch);
      console.log(source.name, batch.length, 'verificate');
    } catch (e) { console.log(source.name, e.message); }
  }
}
await writeFile(file, JSON.stringify(result, null, 2) + '\n');
console.log(result.videos.length, 'clipuri în catalog');
